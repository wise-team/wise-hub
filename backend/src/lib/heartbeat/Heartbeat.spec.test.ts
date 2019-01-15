import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as sinon from "sinon";
import * as _ from "lodash";
chaiUse(chaiAsPromised);

import { Heartbeat } from "./Heartbeat";
import { HeartbeatImpl } from "./HeartbeatImpl";
import { Redis } from "../redis/Redis";
import { RedisMock } from "../redis/Redis.mock.test";
import { Log } from "../Log";

Log.log().initialize();

describe("Heartbeat", () => {
    describe(".beat()", () => {
        it("sets a TTL on a key", async () => {
            const setWithTTLStub = sinon.fake();
            const redis: Redis = new RedisMock();
            redis.setWithTTL = setWithTTLStub;
            const hartbeat: Heartbeat = new HeartbeatImpl(redis, "somename");

            await hartbeat.beat(10);

            expect(setWithTTLStub.calledOnce, "Redis.setWithTTL() called once").to.be.true;
        });

        it("does not throw error", async () => {
            const setWithTTLStub = sinon.fake.throws(new Error("This is intentionally thrown"));
            const redis: Redis = new RedisMock();
            redis.setWithTTL = setWithTTLStub;
            const hartbeat: Heartbeat = new HeartbeatImpl(redis, "somename", () => {});

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

            expect(existsStub.calledOnce, "Redis.exists() called once").to.be.true;
        });
    });
});
