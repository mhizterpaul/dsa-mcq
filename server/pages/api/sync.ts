import type { NextApiRequest, NextApiResponse } from 'next';

// In a real app, this would be a connection to a real database (e.g., Postgres)
const serverDataStore: { [tableName: string]: any[] } = {
    'user_engagement': [
        // a mock record
        { userId: 'user-123', xp_progress: 1000, updatedAt: Date.now() - 100000 }
    ],
    'categories': [
        // a mock record
        { id: '1', name: 'Data Structures', masteryScore: 0.9, updatedAt: Date.now() - 200000 }
    ],
    // ... other tables
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'POST') {
        const clientDirtyData = req.body;
        const syncedData: { [tableName: string]: any[] } = {};

        // Iterate over tables sent by the client
        for (const tableName in clientDirtyData) {
            if (serverDataStore[tableName]) {
                const clientRecords = clientDirtyData[tableName];
                const serverRecords = serverDataStore[tableName];

                // "Last write wins" conflict resolution
                clientRecords.forEach(clientRecord => {
                    const serverRecordIndex = serverRecords.findIndex(sr => sr.id === clientRecord.id || sr.userId === clientRecord.userId);

                    if (serverRecordIndex > -1) {
                        // Record exists on server, compare timestamps
                        const serverRecord = serverRecords[serverRecordIndex];
                        if (clientRecord.updatedAt > serverRecord.updatedAt) {
                            // Client is newer, update server record
                            serverRecords[serverRecordIndex] = clientRecord;
                        }
                    } else {
                        // Record is new, add to server
                        serverRecords.push(clientRecord);
                    }
                });

                // The "truth" is now the server's state
                syncedData[tableName] = serverRecords;
            }
        }

        // Return the synced data to the client
        res.status(200).json(syncedData);
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
