import { UpstashRedisCacheService } from '../../../infra/upstashRedisCacheService';

/**
 * Integration test for Upstash Redis Cache.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 */
describe('Upstash Redis Cache Integration Test', () => {
    let cacheService: UpstashRedisCacheService;

    beforeAll(() => {
        cacheService = new UpstashRedisCacheService();
    });

    it('should set, get, and delete a value', async () => {
        const key = `test-key-${Date.now()}`;
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

    it('should respect TTL', async () => {
        const key = `test-ttl-key-${Date.now()}`;
        const value = 'temporary';

        // Set with 1 second TTL
        await cacheService.set(key, value, 1);

        const immediate = await cacheService.get(key);
        expect(immediate).toBe(value);

        // Wait for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const expired = await cacheService.get(key);
        expect(expired).toBeNull();
    });
});
