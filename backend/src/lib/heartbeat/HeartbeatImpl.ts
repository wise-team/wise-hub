import ow from "ow";

import { Redis } from "../../lib/redis/Redis";

import { Heartbeat } from "./Heartbeat";

export class HeartbeatImpl implements Heartbeat {
    // it contains staticly generated UUIDv4 to clear keyspace and prevent collisions
    private static KEY_BASE: string = "u1937d362-4a3d-482e-bc59-240e274f742d:heartbeat";
    private redis: Redis;
    private key: string;
    private logFn: (msg: string, error?: Error) => void;

    public constructor(
        redis: Redis,
        name: string,
        // tslint:disable no-console
        logFn: (msg: string, error?: Error) => void = (msg: string, error?: Error) => console.error(msg, error),
        // tslint:enable no-console
    ) {
        ow(redis, ow.object.label("redis"));
        ow(name, ow.string.nonEmpty.label("name"));
        ow(logFn, ow.function.label("logFn"));

        this.redis = redis;
        this.key = HeartbeatImpl.KEY_BASE + name;
        this.logFn = logFn;
    }

    public beat(ttlSeconds: number) {
        ow(ttlSeconds, ow.number.integer.greaterThan(0).label("ttlSeconds"));

        // Heartbeat should not return error (this is not a critical service)
        (async () => {
            try {
                await this.redis.setWithTTL(this.key, "ALIVE", ttlSeconds);
            } catch (error) {
                this.log("Error in .beat(): " + error, error);
            }
        })();
    }

    public async isAlive(): Promise<boolean> {
        try {
            return await this.redis.exists(this.key);
        } catch (error) {
            throw new Heartbeat.HeartbeatError("Error in .isAlive(): " + error, error);
        }
    }

    private log(msg: string, error?: Error) {
        try {
            this.logFn(msg, error);
        } catch (error) {
            // tslint:disable no-console
            console.error("Error in HeartbeatImpl.log()", error);
            // tslint:enable no-console
        }
    }
}
