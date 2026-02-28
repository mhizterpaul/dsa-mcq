import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Realtime Service.
 * The following credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
 * are required to be set as environment variables.
 */
export class RealtimeService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key are not configured.');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Subscribe to changes in a specific table.
     * @param table The table name to listen to.
     * @param callback Function to call when a change occurs.
     */
    subscribeToTableChanges(table: string, callback: (payload: any) => void) {
        const channel = this.supabase
            .channel(`public:${table}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();

        return channel;
    }

    /**
     * Broadcast a custom event to a channel.
     * @param channelName The name of the channel.
     * @param event The event name.
     * @param payload The data to broadcast.
     */
    async broadcastEvent(channelName: string, event: string, payload: any) {
        const channel = this.supabase.channel(channelName);
        await channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: event,
                    payload: payload,
                });
            }
        });
    }

    /**
     * Unsubscribe from a channel.
     * @param channel The channel to unsubscribe from.
     */
    async unsubscribe(channel: any) {
        await this.supabase.removeChannel(channel);
    }
}

export const realtimeService = new RealtimeService();
