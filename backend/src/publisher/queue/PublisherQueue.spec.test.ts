// tslint:disable no-unused-expression
import { expect } from "chai";
import "mocha";
import * as sinon from "sinon";
import * as uuid from "uuid/v4";

import { Log } from "../../lib/Log";
import { PublishableOperation } from "../entities/PublishableOperation";

import { PublisherQueue } from "./PublisherQueue";
import { PublisherQueueImpl } from "./PublisherQueueImpl";
import { RedisDualQueue } from "./RedisDualQueue";
import { RedisDualQueueMock } from "./RedisDualQueue.mock.test";
Log.log().initialize();

describe("PublisherQueue", () => {
    function sampleJob() {
        const account = "account" + uuid();
        const ops: PublishableOperation[] = [
            [
                "custom_json",
                {
                    required_auths: [],
                    required_posting_auths: [account],
                    id: "wise",
                    json:
                        '["v2:confirm_vote",{"voter":"steemprojects1","tx_id":' +
                        '"fc9efa1bbfde56d0562d77abc8395cd9567dd0a7","accepted":true,"msg":""}]',
                },
            ],
            [
                "vote",
                {
                    voter: account,
                    author: "author_" + uuid(),
                    permlink: "permlink-" + uuid(),
                    weight: Math.floor(Math.random() * 20000 - 10000),
                },
            ],
        ];

        return { delegator: "delegator-" + uuid(), ops };
    }

    describe("resetProcessingQueue", () => {
        it("calls RedisDualQueue.pushAllFromProcessingQueueToWaitingQueue", async () => {
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.pushAllFromProcessingQueueToWaitingQueue = sinon.fake();
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);

            await publisherQueue.resetProcessingQueue();

            expect((redisDualQueue.pushAllFromProcessingQueueToWaitingQueue as sinon.SinonSpy).calledOnce).to.be.equal(
                true,
            );
        });
    });

    describe("scheduleJob", () => {
        it("calls RedisDualQueue.pushToWaitingQueue with stringified json", async () => {
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.pushToWaitingQueue = sinon.fake();
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);

            await publisherQueue.scheduleJob(sampleJob());

            expect((redisDualQueue.pushToWaitingQueue as sinon.SinonSpy).calledOnce).to.be.equal(true);
            expect(() => JSON.parse((redisDualQueue.pushToWaitingQueue as sinon.SinonSpy).lastCall.args[0])).to.not
                .throw;
        });
    });

    describe("takeJob", () => {
        it("calls RedisDualQueue.popFromWaitingQueuePushToProcessingQueue", async () => {
            const job = sampleJob();
            const jobModifiedStr = JSON.stringify({ ...job, unexpectedField: "something" });
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.popFromWaitingQueuePushToProcessingQueue = sinon.fake.resolves(jobModifiedStr);
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);

            await publisherQueue.takeJob(1);

            expect((redisDualQueue.popFromWaitingQueuePushToProcessingQueue as sinon.SinonSpy).calledOnce).to.be.equal(
                true,
            );
        });

        it("attaches redisStringifiedEntry to returned JobEntry and freezes the object", async () => {
            const job = sampleJob();
            const jobModifiedStr = JSON.stringify({ ...job, unexpectedField: "something" });
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.popFromWaitingQueuePushToProcessingQueue = sinon.fake.resolves(jobModifiedStr);
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);

            const returned = await publisherQueue.takeJob(1);
            if (!returned) throw new Error("Taken job is undefined");

            expect(() => JSON.parse(returned.redisStringifiedEntry)).to.throw;
            expect(returned.redisStringifiedEntry).to.be.equal(jobModifiedStr);
            expect(Object.isFrozen(returned)).to.be.equal(true);
        });
    });

    describe("finishJob", () => {
        const job = sampleJob();
        const jobEntry: PublisherQueue.JobEntry = {
            ...job,
            redisStringifiedEntry: JSON.stringify(job),
        };

        it("calls RedisDualQueue.removeFromProcessingQueue with stringified json", async () => {
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.removeFromProcessingQueue = sinon.fake();
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);

            await publisherQueue.finishJob(jobEntry);

            expect((redisDualQueue.removeFromProcessingQueue as sinon.SinonSpy).calledOnce).to.be.equal(true);
            expect(() => JSON.parse((redisDualQueue.removeFromProcessingQueue as sinon.SinonSpy).lastCall.args[0])).to
                .not.throw;
        });

        it("accepts PublisherQueue.JobEntry", async () => {
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.removeFromProcessingQueue = sinon.fake();
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);

            await publisherQueue.finishJob(Object.freeze(jobEntry));
        });

        it("does not accept PublishJob", async () => {
            const redisDualQueue: RedisDualQueue = new RedisDualQueueMock();
            redisDualQueue.removeFromProcessingQueue = sinon.fake();
            const publisherQueue: PublisherQueue = new PublisherQueueImpl(redisDualQueue);
            try {
                await publisherQueue.finishJob(Object.freeze(job as any));
                throw new Error("Should throw");
            } catch (error) {
                expect(error.name).to.be.equal("ArgumentError");
            }
        });
    });
});
