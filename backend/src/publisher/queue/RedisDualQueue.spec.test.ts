import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as sinon from "sinon";
import * as BluebirdPromise from "bluebird";
import * as _ from "lodash";
chaiUse(chaiAsPromised);
import * as uuid from "uuid/v4";

import { Log } from "../../lib/Log";
Log.log().initialize();

import { RedisMock } from "../../lib/redis/Redis.mock.test";
import { RedisDualQueue } from "./RedisDualQueue";
import { RedisDualQueueImpl } from "./RedisDualQueueImpl";

describe("RedisDualQueue", () => {
    function mock() {
        const waitingQueueKey = "waiting-queue-key-" + uuid();
        const processingQueueKey = "processing-queue-key-" + uuid();
        const redisMock = new RedisMock();
        const redisDualQueue: RedisDualQueue = new RedisDualQueueImpl(redisMock, {
            waitingQueueKey,
            processingQueueKey,
        });

        return { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue };
    }

    describe("isWaitingQueueEmpty", () => {
        it("returns true when queue is empty", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.llen = sinon.fake.returns(0);

            const ret = await redisDualQueue.isWaitingQueueEmpty();

            expect((redisMock.llen as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.llen as sinon.SinonSpy).lastCall.args[0]).to.be.equal(waitingQueueKey);
            expect(ret).to.be.equal(true);
        });

        it("returns false when queue is not empty", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.llen = sinon.fake.returns(1);

            const ret = await redisDualQueue.isWaitingQueueEmpty();

            expect((redisMock.llen as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.llen as sinon.SinonSpy).lastCall.args[0]).to.be.equal(waitingQueueKey);
            expect(ret).to.be.equal(false);
        });
    });

    describe("isProcessingQueueEmpty", () => {
        it("returns true when queue is empty", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.llen = sinon.fake.returns(0);

            const ret = await redisDualQueue.isProcessingQueueEmpty();

            expect((redisMock.llen as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.llen as sinon.SinonSpy).lastCall.args[0]).to.be.equal(processingQueueKey);
            expect(ret).to.be.equal(true);
        });

        it("returns false when queue is not empty", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.llen = sinon.fake.returns(1);

            const ret = await redisDualQueue.isProcessingQueueEmpty();

            expect((redisMock.llen as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.llen as sinon.SinonSpy).lastCall.args[0]).to.be.equal(processingQueueKey);
            expect(ret).to.be.equal(false);
        });
    });

    describe("pushAllFromProcessingQueueToWaitingQueue", () => {
        it("calls Redis.rpoplpush", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            const rpoplpushStub = sinon.stub().returns(undefined);
            redisMock.rpoplpush = rpoplpushStub;

            const ret = await redisDualQueue.pushAllFromProcessingQueueToWaitingQueue();

            expect(rpoplpushStub.callCount).to.be.equal(1);
        });

        it("calls Redis.rpoplpush from processing queue to waiting queue", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            const rpoplpushStub = sinon.stub().returns(undefined);
            redisMock.rpoplpush = rpoplpushStub;

            const ret = await redisDualQueue.pushAllFromProcessingQueueToWaitingQueue();

            expect(rpoplpushStub.lastCall.args[0]).to.be.equal(processingQueueKey);
            expect(rpoplpushStub.lastCall.args[1]).to.be.equal(waitingQueueKey);
        });

        it("calls Redis.rpoplpush until there are any elements in processing queue", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            const rpoplpushStub = sinon.stub();
            rpoplpushStub.onCall(0).resolves("elem1");
            rpoplpushStub.onCall(1).resolves("elem2");
            rpoplpushStub.onCall(2).resolves("elem3");
            rpoplpushStub.resolves(undefined);
            redisMock.rpoplpush = rpoplpushStub;

            const ret = await redisDualQueue.pushAllFromProcessingQueueToWaitingQueue();

            expect(rpoplpushStub.callCount).to.be.equal(4);
        });
    });

    describe("popFromWaitingQueuePushToProcessingQueue", () => {
        it("calls Redis.brpoplpush from waitingQueue to processingQueue", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.brpoplpush = sinon.fake.resolves(undefined);

            const ret = await redisDualQueue.popFromWaitingQueuePushToProcessingQueue(2);

            expect((redisMock.brpoplpush as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.brpoplpush as sinon.SinonSpy).lastCall.args[0]).to.be.equal(waitingQueueKey);
            expect((redisMock.brpoplpush as sinon.SinonSpy).lastCall.args[1]).to.be.equal(processingQueueKey);
            expect((redisMock.brpoplpush as sinon.SinonSpy).lastCall.args[2]).to.be.equal(2);
        });
    });

    describe("removeFromProcessingQueue", () => {
        it("throws when not supplied with string", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            return expect(
                redisDualQueue.removeFromProcessingQueue({
                    i_am: "an object",
                    not_a: "string",
                } as any)
            ).to.be.rejectedWith(Error);
        });

        it("calls Redis.lremAll from processingQueue", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.lremAll = sinon.fake.resolves(1);

            const ret = await redisDualQueue.removeFromProcessingQueue("an elem");

            expect((redisMock.lremAll as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.lremAll as sinon.SinonSpy).lastCall.args[0]).to.be.equal(processingQueueKey);
            expect((redisMock.lremAll as sinon.SinonSpy).lastCall.args[1]).to.be.equal("an elem");
        });

        it("throws when no elements are removed", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.lremAll = sinon.fake.resolves(0);

            return expect(redisDualQueue.removeFromProcessingQueue("an elem")).to.be.rejectedWith(
                RedisDualQueue.RedisDualQueueError
            );
        });
    });

    describe("pushToWaitingQueue", () => {
        it("throws when not supplied with string", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            return expect(
                redisDualQueue.pushToWaitingQueue({ i_am: "an object", not_a: "string" } as any)
            ).to.be.rejectedWith(Error);
        });

        it("calls Redis.lpush to waitingQueue", async () => {
            const { waitingQueueKey, processingQueueKey, redisMock, redisDualQueue } = mock();
            redisMock.lpush = sinon.fake.resolves(1);

            const ret = await redisDualQueue.pushToWaitingQueue("an elem");

            expect((redisMock.lpush as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((redisMock.lpush as sinon.SinonSpy).lastCall.args[0]).to.be.equal(waitingQueueKey);
            expect((redisMock.lpush as sinon.SinonSpy).lastCall.args[1]).to.be.equal("an elem");
        });
    });
});
