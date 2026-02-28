import { UpstashRedisCacheService } from '../../../infra/upstashRedisCacheService';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for Upstash Redis Cache.
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
        const key = getPrefixedKey(`key-${uuidv4()}`);
        const value = { data: 'test-value' };

        await cacheService.set(key, value);
        const retrieved = await cacheService.get(key);
        expect(retrieved).toEqual(value);

        await cacheService.delete(key);
        const afterDelete = await cacheService.get(key);
        expect(afterDelete).toBeNull();
    });

    it('should return null for cache miss (non-existent key)', async () => {
        const key = getPrefixedKey(`missing-${uuidv4()}`);
        const result = await cacheService.get(key);
        expect(result).toBeNull();
    });

    it('should handle TTL edge cases', async () => {
        const keyBase = getPrefixedKey(`ttl-edge-${uuidv4()}`);

        // Zero TTL (should expire immediately or treat as persistent depending on implementation)
        // Upstash/Redis typically treats 0 as 'no expiry' if not careful, but let's see how our service handles it.
        await cacheService.set(`${keyBase}:zero`, 'value', 0);

        // Negative TTL
        await expect(cacheService.set(`${keyBase}:neg`, 'value', -1)).rejects.toThrow();
    });

    it('should respect TTL using polling', async () => {
        const key = getPrefixedKey(`ttl-key-${uuidv4()}`);
        const value = 'temporary';

        await cacheService.set(key, value, 1);
        expect(await cacheService.get(key)).toBe(value);

        const poll = async (attempts: number): Promise<any> => {
            if (attempts <= 0) return await cacheService.get(key);
            const val = await cacheService.get(key);
            if (val === null) return null;
            await new Promise(r => setTimeout(r, 500));
            return poll(attempts - 1);
        };

        const expired = await poll(6);
        expect(expired).toBeNull();
    });

    it('should handle parallel writes and maintain consistency', async () => {
        const key = getPrefixedKey('concurrency-key');
        const count = 10;
        const updates = Array.from({ length: count }, (_, i) => cacheService.set(key, `value-${i}`));

        await Promise.all(updates);

        const finalValue = await cacheService.get(key);
        expect(finalValue).toMatch(/value-\d/);
    });
});
