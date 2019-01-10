import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
chaiUse(chaiAsPromised);
import "mocha";
import * as sinon from "sinon";
import * as Docker from "dockerode";
import * as _ from "lodash";
import * as uuid from "uuid/v4";
import * as BluebirdPromise from "bluebird";
import { exec, ChildProcess } from "child_process";
import { Log } from "../Log";
Log.log().initialize();

import { Redis } from "../redis/Redis";
import { RedisImpl } from "./RedisImpl";
import { RedisMock } from "./RedisMock";

describe("Redis", function() {
    this.timeout(10000);
    let redis: Redis;
    let redis2: Redis;

    const docker = new Docker();
    let redisContainer: Docker.Container;
    const SERVICE_NAME = "redis-in-boundarytest-" + Date.now();
    const PORT = 6379;
    before(async function() {
        this.timeout(60000);

        redisContainer = await docker.createContainer({
            Image: "redis:alpine",
            name: `${SERVICE_NAME}`,
            HostConfig: {
                PortBindings: {
                    "6379/tcp": [
                        {
                            HostIp: "",
                            HostPort: `${PORT}`,
                        },
                    ],
                },
            },
        });
        await redisContainer.start();
        await BluebirdPromise.delay(1000);

        redis = new RedisImpl(`redis://localhost:${PORT}/`);
        redis2 = new RedisImpl(`redis://localhost:${PORT}/`);
    });

    after(async function() {
        try {
            await redis.close();
        } catch (error) {
            console.error(error);
        }

        try {
            await redis2.close();
        } catch (error) {
            console.error(error);
        }
        this.timeout(10000);
        await redisContainer.stop();
        await BluebirdPromise.delay(1000);
        await redisContainer.remove();
        console.log("Gentle shutdown finished");
    });

    describe(".set()", () => {
        it("sets the proper key with proper value", async () => {
            const key = "random:key:" + Date.now();
            const value = "somevalue" + Math.random();
            const resp = await redis.set(key, value);
            expect(resp).to.be.equal("OK");

            const returned = await redis.get(key);
            expect(returned).to.be.equal(value);
        });

        it("changed value is immediately available", async () => {
            const key = "random:key:" + Date.now();
            const value = "somevalue" + Math.random();
            const resp = await redis.set(key, value);
            expect(resp).to.be.equal("OK");

            const returned = await redis.get(key);
            expect(returned).to.be.equal(value);

            const value2 = "another value " + Math.random();
            const respOfSecondSet = await redis.set(key, value2);
            expect(respOfSecondSet).to.be.equal("OK");

            const returned2 = await redis.get(key);
            expect(returned2).to.be.equal(value2);
        });
    });

    describe(".setWithTTL()", () => {
        it("key becomes non-existent after TTL time", async () => {
            const ttlSeconds = 2;
            const key = "random:key:" + Date.now() + "" + Math.random();
            const value = "value";

            const resp = await redis.setWithTTL(key, value, ttlSeconds);
            expect(resp).to.be.equal("OK");

            const returnedBeforeExpire = await redis.get(key);
            expect(returnedBeforeExpire).to.be.equal(value);

            await BluebirdPromise.delay(ttlSeconds * 1000 + 100);

            const returnedAfterExpire = await redis.get(key);
            expect(returnedAfterExpire).to.be.undefined.and.not.be.null;
        });
    });

    describe(".get()", () => {
        it("returns undefined instead of null for non-existent key", async () => {
            const returnedAfterExpire = await redis.get("nonexistentkey:" + Math.random() + ":" + Date.now());
            expect(returnedAfterExpire).to.be.undefined.and.not.be.null;
        });
    });

    describe(".exists()", () => {
        it("Returns true when key exists", async () => {
            const key = "nonexistentkey:" + Math.random() + ":" + Date.now();
            await redis.set(key, "a value");
            const returnedAfterExpire = await redis.exists(key);
            expect(returnedAfterExpire).to.be.equal(true);
        });

        it("Returns false when key does not exist", async () => {
            const key = "nonexistentkey:" + Math.random() + ":" + Date.now();
            await redis.set(key, "a value");
            const returnedAfterExpire = await redis.exists("other key");
            expect(returnedAfterExpire).to.be.equal(false);
        });
    });

    describe(".llen()", () => {
        it("returns 0 for non-existent list", async () => {
            const key = "nonexistentkey:" + uuid();
            const returnedLen = await redis.llen(key);
            expect(returnedLen).to.be.equal(0);
        });

        it("returns correct length for the list that had added emenents", async () => {
            const key = "nonexistentkey:" + uuid();
            const desiredLen = Math.floor(Math.random() * 5 + 1);
            for (let i = 0; i < desiredLen; i++) await redis.lpush(key, Math.random() + "");
            const returnedLen = await redis.llen(key);
            expect(returnedLen).to.be.equal(desiredLen);
        });

        it("returns 0 for list that exists but was emptied", async () => {
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "v1");
            await redis.lpush(key, "v2");
            await redis.lpush(key, "v3");
            await redis.lremAll(key, "v1");
            await redis.lremAll(key, "v2");
            await redis.lremAll(key, "v3");
            const returnedLen = await redis.llen(key);
            expect(returnedLen).to.be.equal(0);
        });
    });

    describe(".lpush()", () => {
        it("pushes element to non-existent list", async () => {
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "elem");
            expect(await redis.llen(key)).to.be.equal(1);
        });

        it("pushes two same elements", async () => {
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "elem");
            await redis.lpush(key, "elem");
            expect(await redis.llen(key)).to.be.equal(2);
        });
    });

    describe(".lremAll()", () => {
        it("removes an element", async () => {
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "elem");
            expect(await redis.llen(key)).to.be.equal(1);
        });

        it("removes all occurances of element", async () => {
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "elem");
            await redis.lpush(key, "elem2");
            await redis.lpush(key, "elem2");
            await redis.lremAll(key, "elem2");
            expect(await redis.llen(key)).to.be.equal(1);
        });
    });

    describe(".brpoplpush()", () => {
        it("pops the last element from the queue", async () => {
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "elem1");
            await redis.lpush(key, "elem2");
            await redis.lpush(key, "elem3");
            await redis.lpush(key, "elem4");
            expect(await redis.brpoplpush(key, "key2:" + uuid(), 0)).to.be.equal("elem1");
        });

        it("pops the last element and pushes to another queue", async () => {
            const key1 = "nonexistentlist1:" + uuid();
            const key2 = "nonexistentlist2:" + uuid();
            await redis.lpush(key1, "elem1");
            await redis.lpush(key1, "elem2");
            await redis.lpush(key2, "elem3");
            await redis.lpush(key2, "elem4");
            await redis.brpoplpush(key1, key2, 0);
            expect(await redis.llen(key1)).to.be.equal(1);
            expect(await redis.llen(key2)).to.be.equal(3);
        });

        it("waits for element", async function() {
            this.timeout(4000);
            const key = "nonexistentkey:" + uuid();
            await redis.lpush(key, "elem1");
            expect(await redis.brpoplpush(key, "key2:" + uuid(), 2)).to.be.equal("elem1");
            const resp = await BluebirdPromise.all([
                redis.brpoplpush(key, "key2:" + uuid(), 2),
                redis2.lpush(key, "elem2"),
            ]);
            expect(resp[0]).to.be.equal("elem2");
        });
    });
});
