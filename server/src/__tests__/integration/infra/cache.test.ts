import { UpstashRedisCacheService } from '../../../infra/upstashRedisCacheService';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for Upstash Redis Cache.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 */
describe('Upstash Redis Cache Integration Test', () => {
    let cacheService: UpstashRedisCacheService;
    const testPrefix = `it:test:redis:${uuidv4()}:`;

    beforeAll(() => {
        ensureIntegrationTestEnv();
        cacheService = new UpstashRedisCacheService();
    });

    const getPrefixedKey = (key: string) => `${testPrefix}${key}`;

    it('should set, get, and delete a value with namespace isolation', async () => {
        const key = getPrefixedKey(`key-${Date.now()}`);
        const value = { data: 'test-value' };

        // Set
        await cacheService.set(key, value);

        // Get
        const retrieved = await cacheService.get(key);
        expect(retrieved).toEqual(value);

        // Delete
        await cacheService.delete(key);
        const afterDelete = await cacheService.get(key);
        expect(afterDelete).toBeNull();
    });

    it('should respect TTL using polling', async () => {
        const key = getPrefixedKey(`ttl-key-${Date.now()}`);
        const value = 'temporary';

        // Set with 1 second TTL
        await cacheService.set(key, value, 1);

        const immediate = await cacheService.get(key);
        expect(immediate).toBe(value);

        // Polling for expiration
        const poll = async (attempts: number): Promise<any> => {
            if (attempts <= 0) return await cacheService.get(key);
            const val = await cacheService.get(key);
            if (val === null) return null;
            await new Promise(r => setTimeout(r, 500));
            return poll(attempts - 1);
        };

        const expired = await poll(6); // Poll for up to 3 seconds
        expect(expired).toBeNull();
    });

    it('should handle parallel writes (concurrency)', async () => {
        const key = getPrefixedKey('concurrency-key');
        const updates = Array.from({ length: 10 }, (_, i) => cacheService.set(key, `value-${i}`));

        await Promise.all(updates);

        const finalValue = await cacheService.get(key);
        expect(finalValue).toMatch(/value-\d/);
    });

    it('should fail gracefully on oversized payloads', async () => {
        const key = getPrefixedKey('oversized-key');
        // Upstash has a limit, typically 1MB for free tier
        const oversizedValue = 'a'.repeat(2 * 1024 * 1024); // 2MB

        await expect(cacheService.set(key, oversizedValue)).rejects.toThrow();
    });

    it('should fail with invalid credentials', () => {
        const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
        process.env.UPSTASH_REDIS_REST_URL = 'https://invalid-url.upstash.io';

        try {
            expect(() => new UpstashRedisCacheService()).toThrow();
        } finally {
            process.env.UPSTASH_REDIS_REST_URL = originalUrl;
        }
    });
});
