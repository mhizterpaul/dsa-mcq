import { open, SQLiteDatabase } from './database';

class ProgressRepository {
    private db: SQLiteDatabase;

    constructor() {
        this.db = open({ name: 'user_progress.db' });
        this.initialize();
    }

    private initialize() {
        this.db.execute(`
            CREATE TABLE IF NOT EXISTS user_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                xp INTEGER,
                last_synced_at TEXT
            )
        `);
    }

    async saveProgress(userId: string, xp: number) {
        this.db.execute(
            'INSERT OR REPLACE INTO user_progress (id, user_id, xp, last_synced_at) VALUES (?, ?, ?, ?)',
            [userId, userId, xp, new Date().toISOString()]
        );
    }

    async getProgress(userId: string) {
        const result = this.db.execute('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
        return result.rows[0] || null;
    }
}

export const progressRepository = new ProgressRepository();
