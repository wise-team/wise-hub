import ow from "ow";

import { Heartbeat } from "./Heartbeat";
import { Log } from "../../lib/Log";
import { Redis } from "../../lib/redis/Redis";

export class HeartbeatImpl implements Heartbeat {
    // it contains staticly generated UUIDv4 to clear keyspace and prevent collisions
    private static KEY_BASE: string = "Heartbeat:1937d362-4a3d-482e-bc59-240e274f742d:";
    private redis: Redis;
    private key: string;

    public constructor(redis: Redis, name: string) {
        ow(redis, ow.object.label("redis"));
        ow(name, ow.string.nonEmpty.label("name"));

        this.redis = redis;
        this.key = HeartbeatImpl.KEY_BASE + name;
    }

    public beat(ttlSeconds: number) {
        ow(ttlSeconds, ow.number.integer.greaterThan(0).label("ttlSeconds"));

        // Heartbeat should not return error (this is not a critical service)
        (async () => {
            try {
                await this.redis.setWithTTL(this.key, "ALIVE", ttlSeconds);
            } catch (error) {
                Log.log().logError(Log.level.warn, new Heartbeat.HeartbeatError("Error in .beat(): " + error, error));
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
}
