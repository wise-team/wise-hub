import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as uuid from "uuid/v4";
import * as sinon from "sinon";
import * as BluebirdPromise from "bluebird";
import * as _ from "lodash";
chaiUse(chaiAsPromised);

import { CustomError } from "../../lib/CustomError";
import { PublishJob } from "../entities/PublishJob";
import { PublisherLog } from "./PublisherLog";
import { PublisherLogImpl } from "./PublisherLogImpl";
import { Log } from "../../lib/Log";
import { PublishableOperation } from "../entities/PublishableOperation";
import { Broadcaster } from "../broadcaster/Broadcaster";
Log.log().initialize();

describe("PublisherLog", () => {
    function constructMock() {
        const logSpy = sinon.fake();
        const fallbackLogSpy = sinon.fake();
        const publisherLog: PublisherLog = new PublisherLogImpl({
            log: async (msg: PublisherLog.Message) => {
                await BluebirdPromise.delay(7);
                logSpy(msg);
            },
            fallbackLog: (msg: string, error?: Error) => fallbackLogSpy(msg, error),
        });
        return { logSpy, fallbackLogSpy, publisherLog };
    }

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
                        '["v2:confirm_vote",{"voter":"steemprojects1","tx_id":"fc9efa1bbfde56d0562d77abc8395cd9567dd0a7","accepted":true,"msg":""}]',
                },
            ],
            [
                "vote",
                {
                    voter: account,
                    author: "author_" + uuid(),
                    permlink: "permlink-" + uuid(),
                    weight: Math.random() * 20000 - 10000,
                },
            ],
        ];

        return { delegator: "delegator-" + uuid(), ops: ops };
    }

    [
        {
            fnName: "logJobStart",
            caller: async (publisherLog: PublisherLog, job: PublishJob) => await publisherLog.logJobStart(job),
        },
        {
            fnName: "logJobSuccess",
            caller: async (publisherLog: PublisherLog, job: PublishJob) =>
                await publisherLog.logJobSuccess(job, {
                    transaction_id: "564tgrfwed",
                    transaction_num: 0,
                    block_num: 1,
                }),
        },
        {
            fnName: "logJobFailure",
            caller: async (publisherLog: PublisherLog, job: PublishJob) =>
                await publisherLog.logJobFailure(job, new Error("some error")),
        },
        {
            fnName: "logBroadcasterWarning",
            caller: async (publisherLog: PublisherLog, job: PublishJob) =>
                await publisherLog.logBroadcasterWarning(job, "some desc to this error"),
        },
    ].forEach(test =>
        describe(test.fnName, () => {
            it("populates message 'delegator' field", async () => {
                const mock = constructMock(),
                    job: PublishJob = sampleJob();

                await test.caller(mock.publisherLog, job);

                expect(mock.logSpy.callCount).to.be.equal(1);
                expect(mock.logSpy.firstCall.args[0].delegator).to.be.equal(job.delegator);
            });

            it("puts @delegator into msg", async () => {
                const mock = constructMock(),
                    job: PublishJob = sampleJob();

                await test.caller(mock.publisherLog, job);

                expect(mock.logSpy.firstCall.args[0].msg).to.include("@" + job.delegator);
            });

            it("populates message 'time' field", async () => {
                const mock = constructMock(),
                    job: PublishJob = sampleJob();

                await test.caller(mock.publisherLog, job);

                expect(mock.logSpy.firstCall.args[0].time).to.be.approximately(Date.now(), 1000);
            });

            it("puts transaction type list into msg", async () => {
                const mock = constructMock(),
                    job: PublishJob = sampleJob();

                await test.caller(mock.publisherLog, job);

                expect(mock.logSpy.firstCall.args[0].msg)
                    .to.include("custom_json")
                    .and.include("vote");
            });

            it("puts vote permlink, author and weight into msg", async () => {
                const mock = constructMock(),
                    job: PublishJob = sampleJob();

                await test.caller(mock.publisherLog, job);

                expect(mock.logSpy.firstCall.args[0].msg)
                    .to.include((job.ops[1][1] as { author: string }).author)
                    .and.include((job.ops[1][1] as { permlink: string }).permlink)
                    .and.include((job.ops[1][1] as { weight: number }).weight);
            });

            it("logs error using fallback log instead of rethrowing", async () => {
                const fallbackLogSpy = sinon.fake();
                const publisherLog: PublisherLog = new PublisherLogImpl({
                    log: async (msg: PublisherLog.Message) => {
                        await BluebirdPromise.delay(7);
                        throw new Error("Test error");
                    },
                    fallbackLog: (msg: string, error?: Error) => fallbackLogSpy(msg, error),
                });

                await test.caller(publisherLog, sampleJob());

                expect(fallbackLogSpy.callCount).to.be.greaterThan(1);
                expect(fallbackLogSpy.lastCall.args[1]).to.be.instanceOf(Error);
            });
        })
    );

    describe("logJobSuccess", () => {
        it("puts transaction data (trx_id, trx_num, block_num) into msg", async () => {
            const mock = constructMock(),
                job: PublishJob = sampleJob();
            const result: Broadcaster.Result = {
                transaction_id: "trxId" + uuid(),
                transaction_num: Math.floor(Math.random() * 200000),
                block_num: Math.floor(Math.random() * 200000),
            };

            await mock.publisherLog.logJobSuccess(job, result);

            expect(mock.logSpy.firstCall.args[0].msg).to.include(result.transaction_id);
            expect(mock.logSpy.firstCall.args[0].msg).to.include(result.transaction_num);
            expect(mock.logSpy.firstCall.args[0].msg).to.include(result.block_num);
        });

        it("populates message 'transaction' field", async () => {
            const mock = constructMock(),
                job: PublishJob = sampleJob();
            const result: Broadcaster.Result = {
                transaction_id: "trxId" + uuid(),
                transaction_num: Math.floor(Math.random() * 200000),
                block_num: Math.floor(Math.random() * 200000),
            };

            await mock.publisherLog.logJobSuccess(job, result);

            expect(mock.logSpy.firstCall.args[0].transaction.trx_id).to.be.equal(result.transaction_id);
            expect(mock.logSpy.firstCall.args[0].transaction.block_num).to.be.equal(result.block_num);
            expect(mock.logSpy.firstCall.args[0].transaction.trx_num).to.be.equal(result.transaction_num);
        });
    });

    describe("logJobFailure", () => {
        class TestCustomError extends CustomError {
            public constructor(msg: string, cause?: Error) {
                super(msg, cause);
            }
        }

        it("puts error name and error message into msg", async () => {
            const mock = constructMock(),
                job: PublishJob = sampleJob();
            const testError: TestCustomError = new TestCustomError("some msg");

            await mock.publisherLog.logJobFailure(job, testError);

            expect(mock.logSpy.firstCall.args[0].msg)
                .to.include(testError.name)
                .and.include(testError.message);
        });

        it("populates message 'error' field", async () => {
            const mock = constructMock(),
                job: PublishJob = sampleJob();
            const testError: TestCustomError = new TestCustomError("some msg");

            await mock.publisherLog.logJobFailure(job, testError);

            expect(mock.logSpy.firstCall.args[0].error)
                .to.include(testError.name)
                .and.include(testError.message);
        });
    });

    describe("logBroadcasterWarning", () => {
        it("puts supplied message into msg", async () => {
            const mock = constructMock(),
                job: PublishJob = sampleJob();
            const testMsg = "some msg " + uuid();

            await mock.publisherLog.logBroadcasterWarning(job, testMsg);

            expect(mock.logSpy.firstCall.args[0].msg).to.include(testMsg);
        });
    });
});
