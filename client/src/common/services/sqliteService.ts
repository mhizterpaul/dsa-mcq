import {
  openDatabase,
  SQLiteDatabase,
  ResultSet,
} from 'react-native-sqlite-storage';

// --- DATABASE CONFIGURATION ---
const DATABASE_NAME = 'dsamcq-local.db';
const DATABASE_LOCATION = 'default';

/**
 * A centralized service for all SQLite database operations.
 * Manages database initialization, schema creation, and provides generic CRUD methods.
 */
class SQLiteService {
  private db: SQLiteDatabase | null = null;

  /**
   * Initializes the database connection.
   * This method must be called before any other database operations are performed.
   * It opens the database and creates the necessary tables if they don't exist.
   */
  public async init(): Promise<void> {
    if (this.db) {
      console.log('[SQLiteService] Database is already initialized.');
      return;
    }
    try {
      this.db = await openDatabase({
        name: DATABASE_NAME,
        location: DATABASE_LOCATION,
      });
      console.log('[SQLiteService] Database opened successfully.');
      await this.createTables();
    } catch (error) {
      console.error('[SQLiteService] Failed to open database:', error);
      throw new Error('Failed to initialize the database.');
    }
  }

  /**
   * Creates all necessary tables for the application if they don't already exist.
   */
  private async createTables(): Promise<void> {
    const db = this.getDB();
    const queries = [
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        masteryScore REAL,
        createdAt INTEGER,
        updatedAt INTEGER,
        is_dirty INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS learning_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT,
        allQuestionIds TEXT,
        questionIds TEXT,
        subsetHistory TEXT,
        currentQuestionIndex INTEGER,
        answers TEXT,
        summary TEXT,
        startTime INTEGER,
        endTime INTEGER,
        createdAt INTEGER,
        updatedAt INTEGER,
        is_dirty INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS user_question_data (
        id TEXT PRIMARY KEY NOT NULL,
        questionId TEXT NOT NULL,
        userId TEXT NOT NULL,
        correctAttempts INTEGER,
        totalAttempts INTEGER,
        recallStrength REAL,
        lastAttemptTimestamp INTEGER,
        techniqueTransferScores TEXT,
        sm2 TEXT,
        createdAt INTEGER,
        updatedAt INTEGER,
        is_dirty INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT,
        message TEXT,
        type TEXT,
        isRead INTEGER,
        createdAt INTEGER,
        updatedAt INTEGER,
        sendAt INTEGER,
        is_dirty INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS user_engagement (
        userId TEXT PRIMARY KEY NOT NULL,
        session_attendance REAL,
        streak_length INTEGER,
        response_latency REAL,
        xp_progress REAL,
        leaderboard_rank INTEGER,
        last_session_timestamp INTEGER,
        createdAt INTEGER,
        updatedAt INTEGER,
        is_dirty INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS anomalies (
        id TEXT PRIMARY KEY NOT NULL,
        metricId TEXT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        updatedAt INTEGER,
        deviation REAL,
        evidence TEXT,
        is_dirty INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS devops_metrics (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt INTEGER,
        updatedAt INTEGER,
        is_dirty INTEGER DEFAULT 0
      );`,
    ];

    try {
      for (const sql of queries) {
        await db.executeSql(sql);
      }
      console.log('[SQLiteService] All tables created successfully.');
    } catch (error) {
      console.error('[SQLiteService] Error creating tables:', error);
      throw new Error('Failed to create database tables.');
    }
  }

  /**
   * Closes the database connection.
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('[SQLiteService] Database closed.');
    }
  }

  /**
   * Provides access to the raw database connection object.
   * Throws an error if the database is not initialized.
   */
  private getDB(): SQLiteDatabase {
    if (!this.db) {
      throw new Error(
        '[SQLiteService] Database is not initialized. Call init() first.',
      );
    }
    return this.db;
  }

  // --- GENERIC CRUD METHODS (to be fully implemented) ---

  public async create(tableName: string, data: object): Promise<ResultSet> {
    const db = this.getDB();
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    return db.executeSql(sql, values);
  }

  public async getById(tableName: string, id: string): Promise<any | null> {
    const db = this.getDB();
    const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
    const [resultSet] = await db.executeSql(sql, [id]);
    if (resultSet.rows.length > 0) {
      return resultSet.rows.item(0);
    }
    return null;
  }

  public async getAll(tableName: string): Promise<any[]> {
    const db = this.getDB();
    const sql = `SELECT * FROM ${tableName}`;
    const [resultSet] = await db.executeSql(sql);
    return resultSet.rows.raw();
  }

  public async update(tableName: string, id: string, data: object): Promise<ResultSet> {
    const db = this.getDB();
    const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const sql = `UPDATE ${tableName} SET ${updates} WHERE id = ?`;
    return db.executeSql(sql, values);
  }

  public async delete(tableName: string, id: string): Promise<ResultSet> {
    const db = this.getDB();
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;
    return db.executeSql(sql, [id]);
  }

  /**
   * Executes a custom SQL query. Use with caution.
   * @param sql The SQL statement to execute.
   * @param params An array of parameters to bind to the query.
   * @returns A promise that resolves with the ResultSet.
   */
  public async runQuery(sql: string, params: any[] = []): Promise<ResultSet> {
    const db = this.getDB();
    return db.executeSql(sql, params);
  }
}

// Export a singleton instance of the service
export const sqliteService = new SQLiteService();
