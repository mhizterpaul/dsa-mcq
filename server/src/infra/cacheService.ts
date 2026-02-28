import { LRUCache } from 'lru-cache';
import { UpstashRedisCacheService } from './upstashRedisCacheService';

interface ICacheProvider {
    get(key: string): Promise<any> | any;
    set(key: string, value: any, ttl?: number): Promise<void> | void;
    delete?(key: string): Promise<void> | void;
}

class InMemoryCacheProvider implements ICacheProvider {
    private cache: LRUCache<string, any>;

    constructor(options: { max: number; ttl: number }) {
        this.cache = new LRUCache(options);
    }

    get(key: string) {
        return this.cache.get(key);
    }

    set(key: string, value: any, ttl?: number) {
        this.cache.set(key, value, { ttl: ttl ? ttl * 1000 : undefined });
    }

    delete(key: string) {
        this.cache.delete(key);
    }
}

class CacheService {
    private provider: ICacheProvider;

    constructor() {
        if (process.env.NODE_ENV === 'test') {
            this.provider = new InMemoryCacheProvider({
                max: 5 * 1024 * 1024, // 5MB
                ttl: 1000 * 60 * 60, // 1 hour
            });
        } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            this.provider = new UpstashRedisCacheService();
        } else {
            this.provider = new InMemoryCacheProvider({
                max: 500 * 1024 * 1024, // 500MB
                ttl: 1000 * 60 * 60, // 1 hour
            });
        }
    }

    async get(key: string) {
        return await this.provider.get(key);
    }

    async set(key: string, value: any, ttl?: number) {
        await this.provider.set(key, value, ttl);
    }

    async delete(key: string) {
        if (this.provider.delete) {
            await this.provider.delete(key);
        }
    }
}

export { CacheService };
