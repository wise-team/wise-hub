import { expect } from "chai";
import "mocha";
import * as sinon from "sinon";

import { Log } from "../Log";
import { Redis } from "../redis/Redis";
import { RedisMock } from "../redis/Redis.mock.test";

import { Heartbeat } from "./Heartbeat";
import { HeartbeatImpl } from "./HeartbeatImpl";

Log.log().initialize();

describe("Heartbeat", () => {
    describe(".beat()", () => {
        it("sets a TTL on a key", async () => {
            const setWithTTLStub = sinon.fake();
            const redis: Redis = new RedisMock();
            redis.setWithTTL = setWithTTLStub;
            const hartbeat: Heartbeat = new HeartbeatImpl(redis, "somename");

            await hartbeat.beat(10);

            expect(setWithTTLStub.calledOnce, "Redis.setWithTTL() called once").to.be.equal(true);
        });

        it("does not throw error", async () => {
            const setWithTTLStub = sinon.fake.throws(new Error("This is intentionally thrown"));
            const redis: Redis = new RedisMock();
            redis.setWithTTL = setWithTTLStub;
            const hartbeat: Heartbeat = new HeartbeatImpl(redis, "somename", () => {
                /* */
            });

            await hartbeat.beat(10);
        });
    });

    describe(".isAlive()", () => {
        it("calls exists on a key", async () => {
            const existsStub = sinon.fake.returns(Promise.resolve(true));
            const redis: Redis = new RedisMock();
            redis.exists = existsStub;
            const hartbeat: Heartbeat = new HeartbeatImpl(redis, "somename");

            await hartbeat.isAlive();

            expect(existsStub.calledOnce, "Redis.exists() called once").to.be.equal(true);
        });
    });
});
