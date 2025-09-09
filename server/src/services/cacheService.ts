import { LRUCache } from 'lru-cache';

class CacheService {
    private cache: LRUCache<string, any>;

    constructor() {
        if (process.env.NODE_ENV === 'test') {
            const options = {
                max: 5 * 1024 * 1024, // 5MB
                ttl: 1000 * 60 * 60, // 1 hour
            };
            this.cache = new LRUCache(options);
        } else {
            const options = {
                max: 500 * 1024 * 1024, // 500MB
                ttl: 1000 * 60 * 60, // 1 hour
            };
            this.cache = new LRUCache(options);
        }
    }

    get(key: string) {
        return this.cache.get(key);
    }

    set(key: string, value: any) {
        this.cache.set(key, value);
    }
}

export { CacheService };
