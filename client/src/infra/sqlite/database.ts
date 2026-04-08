import * as SQLite from 'react-native-quick-sqlite';

export class SQLiteDatabase {
    private db: SQLite.QuickSQLiteConnection;

    constructor(name: string) {
        this.db = SQLite.open({ name });
    }

    execute(query: string, params: any[] = []): { rows: any[] } {
        const result = this.db.execute(query, params);
        return { rows: result.rows?._array || [] };
    }
}

export const open = ({ name }: { name: string }) => {
    return new SQLiteDatabase(name);
};
