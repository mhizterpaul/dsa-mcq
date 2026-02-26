import { PrismaClient } from '@prisma/client';

export class SyncService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async sync(userId: string, role: string, dirtyData: any) {
    // 1. Payload validation
    if (!dirtyData || typeof dirtyData !== 'object' || Array.isArray(dirtyData)) {
        throw new Error('Invalid payload: Expected an object');
    }

    // 2. Acquire lock
    return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        if (user.isSyncing) {
            throw new Error('Sync already in progress for this user');
        }

        await tx.user.update({
            where: { id: userId },
            data: { isSyncing: true }
        });

        try {
            const result: any = {};

            // 3. Process each table
            const supportedTables = [
                'categories',
                'learning_sessions',
                'user_question_data',
                'notifications',
                'user_engagement'
            ];

            for (const tableName of supportedTables) {
                const records = dirtyData[tableName];
                if (records) {
                    if (!Array.isArray(records)) {
                        throw new Error(`Invalid payload: ${tableName} must be an array`);
                    }
                    for (const record of records) {
                        await this.syncRecord(tx, tableName, record, userId, role);
                    }
                }
            }

            // 4. Collect all updated data for the user to send back
            // This ensures the client gets the full "server's truth"
            result.categories = await tx.category.findMany();
            result.learning_sessions = await tx.learningSession.findMany({ where: { userId } });
            result.user_question_data = await tx.userQuestionData.findMany({ where: { userId } });
            result.notifications = await tx.notification.findMany({ where: { userId } });
            result.user_engagement = await tx.engagement.findMany({ where: { userId } });

            return result;
        } finally {
            // 5. Release lock
            await tx.user.update({
                where: { id: userId },
                data: { isSyncing: false }
            });
        }
    }, {
        timeout: 20000 // 20 seconds timeout for sync
    });
  }

  private async syncRecord(tx: any, tableName: string, record: any, userId: string, role: string) {
    // Security: strictly isolated user data
    // If the table is user-specific, we force the userId to be the authenticated user's ID

    switch (tableName) {
        case 'learning_sessions':
            await this.upsertWithConflictResolution(tx.learningSession, record, userId);
            break;
        case 'user_question_data':
            await this.upsertWithConflictResolution(tx.userQuestionData, record, userId, ['userId', 'questionId']);
            break;
        case 'notifications':
            await this.upsertWithConflictResolution(tx.notification, record, userId);
            break;
        case 'user_engagement':
            await this.upsertWithConflictResolution(tx.engagement, record, userId, ['userId']);
            break;
        case 'categories':
            // Global data isolation: Only admins can modify categories
            if (role.toUpperCase() === 'ADMIN') {
                await this.upsertWithConflictResolution(tx.category, record, undefined, ['name']);
            }
            break;
    }
  }

  private async upsertWithConflictResolution(model: any, incomingRecord: any, userId?: string, uniqueKeys: string[] = ['id']) {
    const { is_dirty, ...data } = incomingRecord;

    // Security check: ensure the record doesn't claim to belong to another user
    if (userId && data.userId && data.userId !== userId) {
        // Silently drop attempts to modify other users' data
        return;
    }

    // Force set the userId to ensure isolation
    if (userId) data.userId = userId;

    // Convert string dates to Date objects and validate
    const dateFields = ['updatedAt', 'createdAt', 'startTime', 'endTime', 'sendAt', 'lastAttempt'];
    for (const field of dateFields) {
        if (data[field]) {
            const date = new Date(data[field]);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid date format for field: ${field}`);
            }
            data[field] = date;
        }
    }

    const where: any = {};
    for (const key of uniqueKeys) {
        if (data[key] === undefined) {
            // Missing unique key, cannot sync this record
            return;
        }
        where[key] = data[key];
    }

    const existing = await model.findUnique({ where });

    if (!existing) {
        await model.create({ data });
    } else {
        // Conflict resolution: latest changes wins
        // We use timestamps (updatedAt) if available
        const existingUpdatedAt = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const incomingUpdatedAt = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;

        if (incomingUpdatedAt > existingUpdatedAt) {
            await model.update({
                where,
                data
            });
        }
        // If incoming is older or equal, we silently drop the change and keep the server version
    }
  }
}
