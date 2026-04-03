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
                this.client = {} as any;
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
