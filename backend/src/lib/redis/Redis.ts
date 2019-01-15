import { CustomError } from "../../lib/CustomError";

export interface Redis {
    set(key: string, value: string): Promise<string>;
    setWithTTL(key: string, value: string, ttlSeconds: number): Promise<string>;
    get(key: string): Promise<string | undefined>;
    exists(key: string): Promise<boolean>;
    llen(key: string): Promise<number>;
    lpush(key: string, entry: string): Promise<string>;
    lremAll(key: string, entry: string): Promise<number>;
    rpoplpush(srcListKey: string, targetListKey: string): Promise<string>;
    brpoplpush(srcListKey: string, targetListKey: string, timeoutSeconds: number): Promise<string>;
    close(): Promise<void>;
}

export namespace Redis {
    export function isRedis(o: any): o is Redis {
        return (
            (<Redis>o).set !== undefined &&
            (<Redis>o).setWithTTL !== undefined &&
            (<Redis>o).get !== undefined &&
            (<Redis>o).exists !== undefined &&
            (<Redis>o).close !== undefined
        );
    }

    export class RedisError extends CustomError {
        public constructor(msg: string, cause?: Error) {
            super(msg, cause);
        }
    }
}
