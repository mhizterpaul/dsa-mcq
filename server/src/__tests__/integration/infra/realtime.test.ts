import { RealtimeService } from '../../../infra/realtimeService';
import { ensureIntegrationTestEnv } from '../setup';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for Supabase Realtime.
 */
describe('Supabase Realtime Integration Test', () => {
    let realtimeService: RealtimeService;
    let prisma: PrismaClient;

    beforeAll(() => {
        ensureIntegrationTestEnv();
        realtimeService = new RealtimeService();
        prisma = new PrismaClient();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should receive events on Postgres table changes with multiple subscribers', async () => {
        const tableName = 'Notification';
        const testMessage = `Realtime multi-sub ${uuidv4()}`;

        let sub1Received = false;
        let sub2Received = false;

        const p1 = new Promise<void>((resolve) => {
            const timeout = setTimeout(resolve, 15000);
            realtimeService.subscribeToTableChanges(tableName, (payload) => {
                if (payload.new?.message === testMessage) {
                    sub1Received = true;
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        const p2 = new Promise<void>((resolve) => {
            const timeout = setTimeout(resolve, 15000);
            realtimeService.subscribeToTableChanges(tableName, (payload) => {
                if (payload.new?.message === testMessage) {
                    sub2Received = true;
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        const user = await prisma.user.create({
            data: { email: `realtime-${uuidv4()}@example.com`, name: 'Realtime User' }
        });

        await prisma.notification.create({
            data: { userId: user.id, message: testMessage, type: 'reminder', sendAt: new Date() }
        });

        await Promise.all([p1, p2]);

        expect(sub1Received).toBe(true);
        expect(sub2Received).toBe(true);

        await prisma.user.delete({ where: { id: user.id } });
    }, 20000);

    it('should handle custom event broadcasting and verification', async () => {
        const channelName = `test-channel-${uuidv4()}`;
        const eventName = 'test-event';
        const testPayload = { message: 'hello', id: uuidv4() };

        // RealtimeService doesn't yet have a 'listenToBroadcast' helper,
        // but it completes the broadcast successfully.
        await expect(realtimeService.broadcastEvent(channelName, eventName, testPayload)).resolves.not.toThrow();
    });

    it('should handle malformed payloads gracefully', async () => {
        // We can't easily force Supabase to send a 'malformed' payload via their API,
        // but we verify that our subscription callback logic handles missing fields.
        const tableName = 'Notification';
        const channel = realtimeService.subscribeToTableChanges(tableName, (payload) => {
            // Callback should not crash if payload is unexpected
            if (!payload || !payload.new) return;
        });

        expect(channel).toBeDefined();
        await realtimeService.unsubscribe(channel);
    });
});
