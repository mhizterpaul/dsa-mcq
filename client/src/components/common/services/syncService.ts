import { sqliteService } from './sqliteService';
import CryptoJS from 'crypto-js';

const API_BASE_URL = 'http://localhost:3000/api';
const SYNC_ENDPOINT = `${API_BASE_URL}/sync`;

const TABLES_TO_SYNC = [
  'categories',
  'learning_sessions',
  'user_question_data',
  'notifications',
  'user_engagement',
];

class SyncService {
  private isSyncing = false;

  public async performSync(dispatch: any, getState: () => any): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress. Skipping.');
      return;
    }

    const state = getState();
    const token = state.user.token;
    const syncKey = state.user.syncKey;

    if (!token || !syncKey) {
      console.log('[SyncService] No authenticated session found. Skipping sync.');
      return;
    }

    this.isSyncing = true;
    console.log('[SyncService] Starting two-way sync...');

    try {
      const dirtyData: { [tableName: string]: any[] } = {};

      // 1. Collect all dirty records
      for (const tableName of TABLES_TO_SYNC) {
        const [resultSet] = await sqliteService.runQuery(
          `SELECT * FROM ${tableName} WHERE is_dirty = 1`,
        );
        const records = resultSet.rows.raw();
        if (records.length > 0) {
          dirtyData[tableName] = records;
        }
      }

      // 2. Sign and send dirty data to the server
      const body = JSON.stringify(dirtyData);
      const signature = CryptoJS.HmacSHA256(body, syncKey).toString();

      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-client-signature': signature
        },
        body: body,
      });

      if (response.status === 409) {
          console.log('[SyncService] Server is currently syncing this user. Will retry later.');
          return;
      }

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const syncedData = await response.json();
      console.log('[SyncService] Received merged data from server.');

      // 3. Update local DB with the server's version of the truth
      for (const tableName in syncedData) {
        const serverRecords = syncedData[tableName];
        for (const record of serverRecords) {
            // All records from server are considered "clean"
            record.is_dirty = 0;

            // Convert server column names if necessary (e.g., camelCase to snake_case if DB expects it)
            // Assuming DB matches server model for now as per sqliteService.ts

            const columns = Object.keys(record);
            const placeholders = columns.map(() => '?').join(',');
            const values = Object.values(record);

            await sqliteService.runQuery(
                `INSERT OR REPLACE INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`,
                values
            );
        }
      }

      // 4. Update the Redux store
      // This part depends on how you want to notify slices about new data.
      // One way is to dispatch a global "syncCompleted" action that slices can listen to.

      console.log('[SyncService] Sync completed successfully.');
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
