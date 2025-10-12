import { NextApiResponse } from 'next';
import { CacheService } from '../infra/cacheService';

let cacheService: CacheService;

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export const rateLimiter = (options: RateLimitOptions) => {
  return async (userId: string, res: NextApiResponse, cache?: CacheService) => {
    if (!cacheService) {
        cacheService = cache ?? new CacheService();
    }

    const key = `rate-limit:${userId}`;
    const current = (await cacheService.get(key)) as number[] | undefined;
    const now = Date.now();
    const windowStart = now - options.windowMs;

    const requests = (current || [])
        .map(Number)
        .filter((timestamp: number) => timestamp > windowStart);

    requests.push(now);

    const ttl = Math.ceil((windowStart + options.windowMs - now) / 1000);

    await cacheService.set(key, requests, ttl);

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - requests.length));

    if (requests.length > options.max) {
      res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
      return true; // Rate limit exceeded
    }

    return false; // Not rate limited
  };
};