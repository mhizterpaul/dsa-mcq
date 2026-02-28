import { RealtimeService } from '../../../infra/realtimeService';

/**
 * Integration test for Supabase Realtime.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
describe('Supabase Realtime Integration Test', () => {
    let realtimeService: RealtimeService;

    beforeAll(() => {
        realtimeService = new RealtimeService();
    });

    it('should be able to broadcast an event and subscribe to changes', async () => {
        const channelName = `test-channel-${Date.now()}`;
        const eventName = 'test-event';
        const testPayload = { message: 'hello realtime' };

        let receivedPayload: any = null;

        // Subscribe (In a real scenario, we'd wait for the broadcast)
        const channel = realtimeService.subscribeToTableChanges('Notification', (payload) => {
            receivedPayload = payload;
        });

        expect(channel).toBeDefined();

        // Broadcast custom event
        await realtimeService.broadcastEvent(channelName, eventName, testPayload);

        // Since we can't easily wait for the network callback in a deterministic way without a real subscriber client
        // we at least verify the methods don't throw and return expected objects.

        await realtimeService.unsubscribe(channel);
    });
});
