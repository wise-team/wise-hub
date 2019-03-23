import { expect } from "chai";
import "mocha";
import * as sinon from "sinon";
import { CustomError } from "universe-log";
import * as uuid from "uuid/v4";

import { Log } from "../../lib/Log";
import { Steemconnect } from "../../lib/Steemconnect";
import { UsersManagerMock } from "../../lib/UsersManager.mock.test";
import { UsersManagerI } from "../../lib/UsersManagerI";
import { PublishableOperation } from "../entities/PublishableOperation";
import { PublishJob } from "../entities/PublishJob";
import { StaticConfig } from "../StaticConfig";

import { Broadcaster } from "./Broadcaster";
import { BroadcasterImpl } from "./BroadcasterImpl";

describe("Broadcaster", function() {
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

    function depsMock() {
        const response: Steemconnect.BroadcastResult = {
            id: "34739abc",
            trx_num: Math.floor(Math.random() * 20),
            block_num: Math.floor(Math.random() * 50000 + 10000),
        };

        const job: PublishJob = sampleJob();
        const usersManager: UsersManagerI = new UsersManagerMock();

        const broadcasterParams: Broadcaster.Params = {
            onWarning: (jobInWarning: PublishJob, msg: string, error?: Error) => Log.log().error(msg, error),
            usersManager,
            retryDelaysSeconds: [1, 2],
            broadcastScope: StaticConfig.BROADCAST_SCOPE,
        };

        return { response, job, usersManager, broadcasterParams };
    }

    describe("broadcast", () => {
        it("calls UsersManager.broadcast", async () => {
            const { job, usersManager, response, broadcasterParams } = depsMock();
            usersManager.broadcast = sinon.fake.resolves(response);

            const broadcaster: Broadcaster = new BroadcasterImpl({ ...broadcasterParams });
            await broadcaster.broadcast(job);

            expect((usersManager.broadcast as sinon.SinonSpy).callCount).to.be.equal(1);
        });

        it("calls UsersManager.broadcast with correct delegator", async () => {
            const { job, usersManager, response, broadcasterParams } = depsMock();
            usersManager.broadcast = sinon.fake.resolves(response);

            const broadcaster: Broadcaster = new BroadcasterImpl({ ...broadcasterParams });
            await broadcaster.broadcast(job);

            expect((usersManager.broadcast as sinon.SinonSpy).lastCall.args[0]).to.be.equal(job.delegator);
        });

        it("calls UsersManager.broadcast with correct scope", async () => {
            const { job, usersManager, response, broadcasterParams } = depsMock();
            usersManager.broadcast = sinon.fake.resolves(response);

            const broadcaster: Broadcaster = new BroadcasterImpl({ ...broadcasterParams });
            await broadcaster.broadcast(job);

            expect((usersManager.broadcast as sinon.SinonSpy).lastCall.args[1]).to.have.members([
                "vote",
                "custom_json",
            ]);
        });

        it("returns broadcaster result after successful broadcast", async () => {
            const { job, usersManager, response, broadcasterParams } = depsMock();
            usersManager.broadcast = sinon.fake.resolves(response);

            const broadcaster: Broadcaster = new BroadcasterImpl({ ...broadcasterParams });
            const returnedResponse = await broadcaster.broadcast(job);

            const expectedResponse: Broadcaster.Result = {
                transaction_id: response.id,
                block_num: response.block_num,
                transaction_num: response.trx_num,
            };
            expect(returnedResponse).to.deep.equal(expectedResponse);
        });

        it("throws error when response from steemconnect is invalid", async () => {
            const { job, usersManager, broadcasterParams } = depsMock();
            usersManager.broadcast = sinon.fake.resolves({ not_a_response: "hehe" });

            const broadcaster: Broadcaster = new BroadcasterImpl({ ...broadcasterParams });

            return expect(broadcaster.broadcast(job)).to.be.rejectedWith(Broadcaster.BroadcastError);
        });

        describe("retries", () => {
            const { job, usersManager, broadcasterParams } = depsMock();
            const broadcastCallTimeDeltaMs: number[] = [];
            const broadcastCallCounter = { count: 0 };
            const onWarningSpy = sinon.fake();
            let catchedError: Error | undefined;
            let returnedResponse: object | undefined;

            before(async function() {
                this.timeout(10000);
                const sTime = Date.now();

                usersManager.broadcast = async () => {
                    broadcastCallCounter.count++;
                    broadcastCallTimeDeltaMs.push(Date.now() - sTime);

                    const toThrow = new Error("Reject no " + broadcastCallCounter.count);
                    (toThrow as any).no = broadcastCallCounter.count;
                    throw toThrow;
                };

                const broadcaster: Broadcaster = new BroadcasterImpl({
                    ...broadcasterParams,
                    onWarning: onWarningSpy,
                });
                try {
                    returnedResponse = await broadcaster.broadcast(job);
                } catch (error) {
                    catchedError = error;
                }
            });

            it("waits specified period of time after each failure", async () => {
                expect(broadcastCallTimeDeltaMs[0]).to.be.within(0, 100);

                let expectedCumulativeDelayMs = 0;
                broadcasterParams.retryDelaysSeconds.forEach((delayS, i) => {
                    expectedCumulativeDelayMs += delayS * 1000;
                    expect(broadcastCallTimeDeltaMs[i + 1]).to.be.within(
                        expectedCumulativeDelayMs - 100,
                        expectedCumulativeDelayMs + 100,
                    );
                });
            });

            it("retries specified number of times", async () => {
                expect(broadcastCallCounter.count).to.be.equal(broadcasterParams.retryDelaysSeconds.length + 1);
            });

            it("logs each failure", async () => {
                expect(onWarningSpy.callCount).to.be.equal(broadcasterParams.retryDelaysSeconds.length);
                expect(onWarningSpy.lastCall.args[1]).to.be.instanceOf(Error);
            });

            it("throws only last failure", async () => {
                expect(returnedResponse).to.be.equal(undefined);
                expect(catchedError)
                    .to.instanceOf(Error)
                    .that.has.property("no")
                    .that.is.equal(broadcastCallCounter.count);
            });
        });

        it("returns broadcaster result after successful but retried broadcast", async () => {
            const { job, usersManager, response, broadcasterParams } = depsMock();

            const broadcastCounter = { count: 0 };
            usersManager.broadcast = async () => {
                broadcastCounter.count++;
                if (broadcastCounter.count < 1) throw new Error("intended error");
                return response;
            };

            const broadcaster: Broadcaster = new BroadcasterImpl({
                ...broadcasterParams,
                onWarning: () => {
                    /* */
                },
            });
            const returnedResponse = await broadcaster.broadcast(job);

            const expectedResponse: Broadcaster.Result = {
                transaction_id: response.id,
                block_num: response.block_num,
                transaction_num: response.trx_num,
            };
            expect(returnedResponse).to.deep.equal(expectedResponse);
        });

        it("does not retry on SDKError with .error=server_error", async () => {
            const { job, usersManager, broadcasterParams } = depsMock();

            class SDKError extends CustomError {
                public error = "server_error";

                public constructor(message?: string, cause?: Error) {
                    super(message, cause);
                }
            }

            usersManager.broadcast = sinon.fake.rejects(new SDKError());

            const broadcaster: Broadcaster = new BroadcasterImpl({ ...broadcasterParams });
            try {
                await broadcaster.broadcast(job);
            } catch (error) {
                expect(error.cause.name).to.be.equal("SDKError");
            }
            expect((usersManager.broadcast as sinon.SinonSpy).callCount).to.be.equal(1);
        });
    });
});
