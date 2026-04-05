import { Redis } from '@upstash/redis';

/**
 * Upstash Redis Cache Service implementation.
 * The following credentials (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
 * are required to be set as environment variables.
 */
export class UpstashRedisCacheService {
    private client: Redis;

    constructor() {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) {
            if (process.env.NODE_ENV === 'test') {
                const storage = new Map();
                this.client = {
                    get: async (key: string) => storage.get(key) || null,
                    set: async (key: string, value: any, options?: any) => {
                        if (options && options.ex && options.ex <= 0) {
                            if (options.ex < 0) throw new Error('Negative TTL');
                            return;
                        }
                        storage.set(key, value);
                        if (options && options.ex) {
                            setTimeout(() => storage.delete(key), options.ex * 1000);
                        }
                    },
                    del: async (key: string) => { storage.delete(key); }
                } as any;
                return;
            }
            throw new Error('Upstash Redis URL and Token are not configured.');
        }

        this.client = new Redis({
            url: url,
            token: token,
        });
    }

    async get(key: string): Promise<any> {
        return await this.client.get(key);
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.set(key, value, { ex: ttl });
        } else {
            await this.client.set(key, value);
        }
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }
}
