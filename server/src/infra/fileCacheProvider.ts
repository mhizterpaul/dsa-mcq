import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface CacheEntry {
    value: any;
    expiresAt: number | null;
}

export class FileCacheProvider {
    private cacheDir: string;
    private maxSize: number; // in bytes

    constructor(cacheDir: string = '.cache', maxSize: number = 50 * 1024 * 1024) {
        this.cacheDir = path.resolve(cacheDir);
        this.maxSize = maxSize;
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    private getFilePath(key: string): string {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return path.join(this.cacheDir, `${hash}.json`);
    }

    async get(key: string): Promise<any> {
        const filePath = this.getFilePath(key);
        if (!fs.existsSync(filePath)) {
            return null;
        }

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const entry: CacheEntry = JSON.parse(data);

            if (entry.expiresAt && entry.expiresAt < Date.now()) {
                this.delete(key);
                return null;
            }

            return entry.value;
        } catch (error) {
            console.error('Error reading cache file:', error);
            return null;
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        const filePath = this.getFilePath(key);
        const entry: CacheEntry = {
            value,
            expiresAt: ttl ? Date.now() + ttl * 1000 : null
        };

        try {
            fs.writeFileSync(filePath, JSON.stringify(entry), 'utf8');
            this.enforceSizeLimit();
        } catch (error) {
            console.error('Error writing cache file:', error);
        }
    }

    async delete(key: string): Promise<void> {
        const filePath = this.getFilePath(key);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                console.error('Error deleting cache file:', error);
            }
        }
    }

    private enforceSizeLimit() {
        const files = fs.readdirSync(this.cacheDir).map(file => {
            const filePath = path.join(this.cacheDir, file);
            const stats = fs.statSync(filePath);
            return { filePath, size: stats.size, mtime: stats.mtimeMs };
        });

        let totalSize = files.reduce((acc, file) => acc + file.size, 0);

        if (totalSize > this.maxSize) {
            // Sort by oldest modified time
            files.sort((a, b) => a.mtime - b.mtime);

            while (totalSize > this.maxSize && files.length > 0) {
                const oldest = files.shift();
                if (oldest) {
                    fs.unlinkSync(oldest.filePath);
                    totalSize -= oldest.size;
                }
            }
        }
    }
}
