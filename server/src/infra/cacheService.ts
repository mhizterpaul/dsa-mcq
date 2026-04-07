import { LRUCache } from 'lru-cache';
import { FileCacheProvider } from './fileCacheProvider';

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
        if (process.env.NODE_ENV === 'test' && !process.env.FORCE_FILE_CACHE) {
            this.provider = new InMemoryCacheProvider({
                max: 5 * 1024 * 1024, // 5MB
                ttl: 1000 * 60 * 60, // 1 hour
            });
        } else {
            // Using FileCacheProvider for persistence/cost efficiency as requested
            this.provider = new FileCacheProvider();
        }
    }

    async get(key: string, token?: string) {
        const scopedKey = token ? `${token}:${key}` : key;
        const value = await this.provider.get(scopedKey);
        if (value) {
            console.log(`[CacheService] Hit: ${scopedKey}`);
        }
        return value;
    }

    async set(key: string, value: any, ttl?: number, token?: string) {
        const scopedKey = token ? `${token}:${key}` : key;
        await this.provider.set(scopedKey, value, ttl);
        console.log(`[CacheService] Set: ${scopedKey}`);
    }

    async delete(key: string, token?: string) {
        const scopedKey = token ? `${token}:${key}` : key;
        if (this.provider.delete) {
            await this.provider.delete(scopedKey);
            console.log(`[CacheService] Delete: ${scopedKey}`);
        }
    }
}

export { CacheService };
