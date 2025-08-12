import { sqliteService } from './sqliteService';

const SYNC_ENDPOINT = '/api/sync'; // Assuming a relative path to the server API

const TABLES_TO_SYNC = [
  'categories',
  'learning_sessions',
  'user_question_data',
  'notifications',
  'user_engagement',
];

class SyncService {
  private isSyncing = false;

  /**
   * Performs a one-time sync of all dirty records from the local DB to the server.
   * If a sync is already in progress, it will not start another one.
   */
  public async performSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress. Skipping.');
      return;
    }

    this.isSyncing = true;
    console.log('[SyncService] Starting sync...');

    try {
      const dirtyData: { [tableName: string]: any[] } = {};
      let hasDirtyData = false;

      // 1. Collect all dirty records from all tables
      for (const tableName of TABLES_TO_SYNC) {
        const [resultSet] = await sqliteService.runQuery(
          `SELECT * FROM ${tableName} WHERE is_dirty = 1`,
        );
        const records = resultSet.rows.raw();
        if (records.length > 0) {
          dirtyData[tableName] = records;
          hasDirtyData = true;
        }
      }

      if (!hasDirtyData) {
        console.log('[SyncService] No dirty data to sync.');
        this.isSyncing = false;
        return;
      }

      // 2. Send dirty data to the server
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dirtyData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      console.log('[SyncService] Server received data successfully.');

      // 3. Reset the is_dirty flag for the synced records
      for (const tableName of Object.keys(dirtyData)) {
        await sqliteService.runQuery(
          `UPDATE ${tableName} SET is_dirty = 0 WHERE is_dirty = 1`,
        );
      }

      console.log('[SyncService] Sync completed successfully.');
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
      // In a real app, you might implement retry logic or a more robust error handling mechanism.
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
