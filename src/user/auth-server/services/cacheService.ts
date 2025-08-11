import { LRUCache } from 'lru-cache';

const options = {
  max: 1.5 * 1024 * 1024 * 1024, // 1.5GB
  ttl: 1000 * 60 * 60, // 1 hour
};

const cache = new LRUCache(options);

export default cache;
