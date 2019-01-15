import { Redis } from "./Redis";
import * as IORedis from "ioredis";
import ow from "ow";

export class RedisImpl implements Redis {
    private ioredis: IORedis.Redis;

    public constructor(redisUrl: string) {
        ow(redisUrl, ow.string.nonEmpty.label("redisUrl"));

        this.ioredis = new IORedis(redisUrl);
    }

    public async set(key: string, value: string): Promise<string> {
        ow(key, ow.string.nonEmpty.label("key"));
        ow(value, ow.string.label("value"));

        try {
            return await this.ioredis.set(key, value);
        } catch (error) {
            throw new Redis.RedisError("Error in .set(): " + error, error);
        }
    }

    public async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<string> {
        ow(key, ow.string.nonEmpty.label("key"));
        ow(value, ow.string.label("value"));
        ow(ttlSeconds, ow.number.greaterThan(0).label("ttlSeconds"));

        try {
            return await this.ioredis.set(key, value, "EX", ttlSeconds);
        } catch (error) {
            throw new Redis.RedisError("Error in .setWithTTL(): " + error, error);
        }
    }

    public async get(key: string): Promise<string | undefined> {
        ow(key, ow.string.nonEmpty.label("key"));

        try {
            return (await this.ioredis.get(key)) || undefined;
        } catch (error) {
            throw new Redis.RedisError("Error in .get(): " + error, error);
        }
    }

    public async exists(key: string): Promise<boolean> {
        ow(key, ow.string.nonEmpty.label("key"));

        try {
            return (await this.ioredis.exists(key)) > 0;
        } catch (error) {
            throw new Redis.RedisError("Error in .exists(): " + error, error);
        }
    }

    public async llen(key: string): Promise<number> {
        ow(key, ow.string.nonEmpty.label("key"));

        try {
            return await this.ioredis.llen(key);
        } catch (error) {
            throw new Redis.RedisError("Error in .llen(): " + error, error);
        }
    }

    public async lpush(key: string, entry: string): Promise<string> {
        ow(key, ow.string.nonEmpty.label("key"));
        ow(entry, ow.string.label("entry"));

        try {
            return await this.ioredis.lpush(key, entry);
        } catch (error) {
            throw new Redis.RedisError("Error in .lpush(): " + error, error);
        }
    }

    public async lremAll(key: string, entry: string): Promise<number> {
        ow(key, ow.string.nonEmpty.label("key"));
        ow(entry, ow.string.label("entry"));

        try {
            return await this.ioredis.lrem(key, 0, entry);
        } catch (error) {
            throw new Redis.RedisError("Error in .lremAll(): " + error, error);
        }
    }

    public async rpoplpush(srcListKey: string, targetListKey: string): Promise<string> {
        ow(srcListKey, ow.string.nonEmpty.label("srcListKey"));
        ow(targetListKey, ow.string.nonEmpty.label("targetListKey"));

        try {
            return await this.ioredis.rpoplpush(srcListKey, targetListKey);
        } catch (error) {
            throw new Redis.RedisError("Error in .rpoplpush(): " + error, error);
        }
    }

    public async brpoplpush(srcListKey: string, targetListKey: string, timeoutSeconds: number): Promise<string> {
        ow(srcListKey, ow.string.nonEmpty.label("srcListKey"));
        ow(targetListKey, ow.string.nonEmpty.label("targetListKey"));
        ow(timeoutSeconds, ow.number.label("timeoutSeconds"));

        try {
            return await this.ioredis.brpoplpush(srcListKey, targetListKey, timeoutSeconds);
        } catch (error) {
            throw new Redis.RedisError("Error in .brpoplpush(): " + error, error);
        }
    }

    public async close(): Promise<void> {
        try {
            await this.ioredis.quit();
        } catch (error) {
            throw new Redis.RedisError("Error in .exists(): " + error, error);
        }
    }
}
