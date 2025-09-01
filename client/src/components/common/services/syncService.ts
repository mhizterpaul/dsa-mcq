import { sqliteService } from './sqliteService';
import { AppDispatch } from '../../mediator/store';
// Import all the actions needed to update the store
import { setCategories } from '../../learning/store/category.slice';
import { setWeeklyKingOfQuiz, setLeaderboard } from '../../engagement/store/globalEngagement.slice';
// ... import other actions as needed

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

  public async performSync(dispatch: AppDispatch): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress. Skipping.');
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

      // 2. Send dirty data to the server and get the merged data back
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dirtyData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const syncedData = await response.json();
      console.log('[SyncService] Received merged data from server.');

      // 3. Update local DB with the server's version of the truth
      for (const tableName in syncedData) {
        const serverRecords = syncedData[tableName];
        // This is a simplification. A real implementation would be more careful
        // about deleting records that no longer exist on the server.
        // For now, we just insert/update.
        for (const record of serverRecords) {
            // All records from server are considered "clean"
            record.is_dirty = 0;
            // Upsert logic (simplified)
            await sqliteService.runQuery(
                `INSERT OR REPLACE INTO ${tableName} (${Object.keys(record).join(',')}) VALUES (${Object.keys(record).map(() => '?').join(',')})`,
                Object.values(record)
            );
        }
      }

      // 4. Dispatch actions to update the Redux store with the new, synced data
      // This is a simplified example. A real implementation would be more generic.
      if (syncedData.categories) {
        dispatch(setCategories(syncedData.categories));
      }
      if (syncedData.user_engagement) {
        // Dispatch actions to update user engagement slices
      }
      // ... and so on for other tables

      console.log('[SyncService] Sync completed successfully.');
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
