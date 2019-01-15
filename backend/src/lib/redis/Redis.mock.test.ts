import { Redis } from "./Redis";

export class RedisMock implements Redis {
    public constructor() {}

    public async set(key: string, value: string): Promise<string> {
        throw new Error("Unmocked method called");
    }

    public async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<string> {
        throw new Error("Unmocked method called");
    }

    public async get(key: string): Promise<string | undefined> {
        throw new Error("Unmocked method called");
    }

    public async exists(key: string): Promise<boolean> {
        throw new Error("Unmocked method called");
    }

    public async llen(key: string): Promise<number> {
        throw new Error("Unmocked method called");
    }

    public async lpush(key: string, entry: string): Promise<string> {
        throw new Error("Unmocked method called");
    }

    public async lremAll(key: string, entry: string): Promise<number> {
        throw new Error("Unmocked method called");
    }

    public async rpoplpush(srcListKey: string, targetListKey: string): Promise<string> {
        throw new Error("Unmocked method called");
    }

    public async brpoplpush(srcListKey: string, targetListKey: string, timeoutSeconds: number): Promise<string> {
        throw new Error("Unmocked method called");
    }

    public async close(): Promise<void> {
        throw new Error("Unmocked method called");
    }
}
