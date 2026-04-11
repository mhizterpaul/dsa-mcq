import { FileCacheProvider } from '../../../infra/fileCacheProvider';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

describe('FileCacheProvider Integration Test', () => {
    let cacheService: FileCacheProvider;
    const cacheDir = '.test-cache';

    beforeAll(() => {
        cacheService = new FileCacheProvider(cacheDir, 1024); // 1KB limit for testing
    });

    afterAll(() => {
        if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
        }
    });

    it('should set, get, and delete a value', async () => {
        const key = `key-${uuidv4()}`;
        const value = { data: 'test-value' };

        await cacheService.set(key, value);
        const retrieved = await cacheService.get(key);
        expect(retrieved).toEqual(value);

        await cacheService.delete(key);
        const afterDelete = await cacheService.get(key);
        expect(afterDelete).toBeNull();
    });

    it('should respect TTL', async () => {
        const key = `ttl-key-${uuidv4()}`;
        const value = 'temporary';

        await cacheService.set(key, value, 1); // 1 second TTL
        expect(await cacheService.get(key)).toBe(value);

        await new Promise(r => setTimeout(r, 1100));

        const expired = await cacheService.get(key);
        expect(expired).toBeNull();
    });

    it('should enforce size limit (evict oldest)', async () => {
        const smallCache = new FileCacheProvider('.small-cache', 100); // 100 bytes limit

        const key1 = 'key1';
        const val1 = 'a'.repeat(60); // Entry will be > 60 bytes with JSON wrapper
        await smallCache.set(key1, val1);
        expect(await smallCache.get(key1)).toBe(val1);

        await new Promise(r => setTimeout(r, 10)); // Ensure mtime difference

        const key2 = 'key2';
        const val2 = 'b'.repeat(60);
        await smallCache.set(key2, val2);

        // key1 should be evicted
        expect(await smallCache.get(key1)).toBeNull();
        expect(await smallCache.get(key2)).toBe(val2);

        if (fs.existsSync('.small-cache')) {
            fs.rmSync('.small-cache', { recursive: true, force: true });
        }
    });
});
