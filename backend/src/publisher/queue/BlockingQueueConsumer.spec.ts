import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as sinon from "sinon";
import * as BluebirdPromise from "bluebird";
import * as _ from "lodash";
chaiUse(chaiAsPromised);

import { Log } from "../../lib/Log";
Log.log().initialize();

import { BlockingQueueConsumer } from "./BlockingQueueConsumer";
import { BlockingQueueConsumerImpl } from "./BlockingQueueConsumerImpl";

describe("BlockingQueueConsumer", () => {
    let bqConsumer: BlockingQueueConsumer<TestJob>;

    afterEach(async () => {
        if (bqConsumer) await bqConsumer.stop();
    });

    interface TestJob {
        name: string;
    }

    async function emptyTakeMock(spyFn: () => void): Promise<TestJob | undefined> {
        spyFn();
        await BluebirdPromise.delay(5);
        return undefined;
    }

    async function returningTakeMock(spyFn: () => void): Promise<TestJob | undefined> {
        spyFn();
        await BluebirdPromise.delay(5);
        return { name: "test job" } as TestJob;
    }

    async function throwingTakeMock(spyFn: () => void): Promise<TestJob | undefined> {
        spyFn();
        await BluebirdPromise.delay(5);
        throw new Error("test error");
    }

    async function delayedFnMock(
        spyFn: () => void,
        delayMs: number = 5,
        returningFn: () => any = () => undefined
    ): Promise<any> {
        spyFn();
        await BluebirdPromise.delay(delayMs);
        return returningFn();
    }

    const defaultOptions: BlockingQueueConsumer.Options = {
        sleepAfterErrorMs: 5,
        sleepBeforeNextTakeMs: 5,
    };

    const emptyCallbacks: BlockingQueueConsumer.Callbacks<TestJob> = {
        init: async () => {},
        heartbeat: () => {},
        onError: async (error: Error) => {},
        fallbackLog: (msg: string, error?: Error) => {},
        take: () => returningTakeMock(() => {}),
        process: async (job: TestJob) => {},
        onProcessSuccess: async (job: TestJob) => {},
        onProcessFailure: async (job: TestJob, error?: Error) => {},
    };

    describe(".isRunning()", () => {
        it("returns false if not started", () => {
            bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, emptyCallbacks);
            expect(bqConsumer.isRunning()).to.be.false;
        });

        it("returns true immediately after started", async () => {
            bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, emptyCallbacks);
            bqConsumer.start();
            expect(bqConsumer.isRunning()).to.be.true;
        });

        it("returns false when stopped", async () => {
            bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, emptyCallbacks);
            bqConsumer.start();
            expect(bqConsumer.isRunning()).to.be.true;
            await BluebirdPromise.delay(20);
            bqConsumer.stop();
            await BluebirdPromise.delay(20);
            expect(bqConsumer.isRunning()).to.be.false;
        });
    });

    describe(".stop()", () => {
        it("stops taking", async () => {
            const takeCounter = { count: 0 };
            bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                ...emptyCallbacks,
                take: () => returningTakeMock(() => takeCounter.count++),
            });
            bqConsumer.start();
            expect(bqConsumer.isRunning()).to.be.true;
            await BluebirdPromise.delay(20);
            const countBeforeStop = takeCounter.count;
            bqConsumer.stop();
            await BluebirdPromise.delay(20);
            expect(bqConsumer.isRunning()).to.be.false;
            expect(takeCounter.count).to.be.equal(countBeforeStop);
        });
    });

    describe(".start()", () => {
        describe("Options.sleepAfterErrorMs", () => {
            it("after error sleeps specified amount of time before the next take", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(
                    {
                        sleepAfterErrorMs: 40,
                        sleepBeforeNextTakeMs: 5,
                    },
                    {
                        ...emptyCallbacks,
                        take: () => throwingTakeMock(takeSpy),
                    }
                );
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(takeSpy.callCount).to.be.equal(1);
                await BluebirdPromise.delay(20);
                expect(takeSpy.callCount).to.be.greaterThan(1);
            });
        });
        describe("Options.sleepBeforeNextTakeMs", () => {
            it("sleeps specified amount of time after successful take", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(
                    { sleepAfterErrorMs: 5, sleepBeforeNextTakeMs: 40 },
                    {
                        ...emptyCallbacks,
                        take: () => returningTakeMock(takeSpy),
                    }
                );
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(takeSpy.callCount).to.be.equal(1);
                await BluebirdPromise.delay(20);
                expect(takeSpy.callCount).to.be.greaterThan(1);
            });

            it("does not sleep after empty take", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(
                    { sleepAfterErrorMs: 5, sleepBeforeNextTakeMs: 40 },
                    {
                        ...emptyCallbacks,
                        take: () => emptyTakeMock(takeSpy),
                    }
                );
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(takeSpy.callCount).to.be.greaterThan(2);
            });
        });

        describe("Callbacks.init", () => {
            it("calls init only once after the .start is invoked", async () => {
                const initSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    init: () => initSpy(),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(initSpy.callCount).to.be.equal(1);
            });

            it("stops when .init throws error", async () => {
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    init: () =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                });
                try {
                    bqConsumer.start();
                } catch (error) {
                    // error is expected
                }
                await BluebirdPromise.delay(30);
                expect(bqConsumer.isRunning()).to.be.false;
            });

            it("calls .onError when .init throws error", async () => {
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    init: () =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                    onError: () => delayedFnMock(onErrorSpy),
                });
                try {
                    bqConsumer.start();
                } catch (error) {
                    // error is expected
                }
                await BluebirdPromise.delay(30);
                expect(onErrorSpy.callCount).to.be.equal(1);
            });
        });

        describe("Callbacks.heartbeat", () => {
            it("runs heartbeat before each take", async () => {
                const heartbeatSpy = sinon.fake();
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    heartbeat: heartbeatSpy,
                    take: () => emptyTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(heartbeatSpy.callCount).to.be.equal(takeSpy.callCount);
            });

            it("continues when error in heartbeat occurs", async () => {
                const heartbeatSpy = sinon.fake();
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    heartbeat: heartbeatSpy,
                    take: () => emptyTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(heartbeatSpy.callCount).to.be.equal(takeSpy.callCount);
            });

            it("does not call .onError when error in heartbeat occurs", async () => {
                const heartbeatSpy = sinon.fake.throws(new Error("Test error"));
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    heartbeat: heartbeatSpy,
                    onError: error => onErrorSpy(),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(onErrorSpy.callCount).to.be.equal(0);
            });
        });

        describe("Callbacks.onError", () => {
            it("waits for the onError promise to finish", async () => {
                const takeSpy = sinon.fake();
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    onError: error => delayedFnMock(onErrorSpy, 30).then(() => {}),
                    take: () => throwingTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(20);
                expect(onErrorSpy.callCount).to.be.equal(1);
                expect(takeSpy.callCount).to.be.equal(1);
            });

            it("continues to take after error is thrown in .onError()", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    take: () => throwingTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(20);
                expect(takeSpy.callCount).to.be.greaterThan(1);
            });
        });

        describe("Callbacks.take", () => {
            it("waits for the .take() promise to resolve", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    take: () => delayedFnMock(takeSpy, 20),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(30);
                expect(takeSpy.callCount).to.be.equal(1 /* one called */ + 1 /* the second is awaited by stop */);
            });

            it("continues to take after error is thrown in .take()", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    take: () => emptyTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(20);
                expect(takeSpy.callCount).to.be.greaterThan(1);
            });

            it("calls .onError() after error is thrown in .take()", async () => {
                const takeSpy = sinon.fake();
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    onError: error => delayedFnMock(onErrorSpy, 5),
                    take: () => throwingTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(20);
                await bqConsumer.stop();
                await BluebirdPromise.delay(20);
                expect(onErrorSpy.callCount).to.be.equal(takeSpy.callCount);
            });
        });

        describe("Callbacks.process", () => {
            it("does not wait for the process promise to return, but continues to take", async () => {
                const takeSpy = sinon.fake();
                const processSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    process: job => delayedFnMock(processSpy, 60),
                    take: () => returningTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(takeSpy.callCount).to.be.greaterThan(3);
            });

            it("continues to take after error is thrown in .process()", async () => {
                const takeSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    process: job =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                    take: () => returningTakeMock(takeSpy),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(takeSpy.callCount).to.be.greaterThan(3);
            });

            it("does not call .onError() after error is thrown in .process()", async () => {
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    process: job =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                    onError: error => onErrorSpy(),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(onErrorSpy.callCount).to.be.equal(0);
            });

            it("calls .onProcessFailure() after error is thrown in .process()", async () => {
                const onProcessFailureSpy = sinon.fake();
                const onProcessSuccessSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    process: job =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                    onProcessFailure: error => onProcessFailureSpy(),
                    onProcessSuccess: () => onProcessSuccessSpy(),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(onProcessFailureSpy.callCount).to.be.greaterThan(1);
                expect(onProcessSuccessSpy.callCount).to.be.equal(0);
            });

            it("calls .onProcessSuccess() if no error is thrown in .process()", async () => {
                const onProcessFailureSpy = sinon.fake();
                const onProcessSuccessSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    process: job => delayedFnMock(() => {}, 5),
                    onProcessFailure: error => onProcessFailureSpy(),
                    onProcessSuccess: () => onProcessSuccessSpy(),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(onProcessFailureSpy.callCount).to.be.equal(0);
                expect(onProcessSuccessSpy.callCount).to.be.greaterThan(1);
            });
        });

        describe("Callbacks.onProcessSuccess", () => {
            it("calls .onError() after error is thrown in .onProcessSuccess()", async () => {
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    onError: error => onErrorSpy(),
                    onProcessSuccess: () =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(onErrorSpy.callCount).to.be.greaterThan(1);
                expect(bqConsumer.isRunning()).to.be.true;
            });
        });

        describe("Callbacks.onProcessFailure", () => {
            it("calls .onError() after error is thrown in .onProcessSuccess()", async () => {
                const onErrorSpy = sinon.fake();
                bqConsumer = new BlockingQueueConsumerImpl<TestJob>(defaultOptions, {
                    ...emptyCallbacks,
                    process: async () => {
                        throw new Error("test error");
                    },
                    onError: error => onErrorSpy(),
                    onProcessFailure: () =>
                        delayedFnMock(() => {}, 5, () => {
                            throw new Error("test error");
                        }),
                });
                bqConsumer.start();
                await BluebirdPromise.delay(40);
                expect(onErrorSpy.callCount).to.be.greaterThan(1);
                expect(bqConsumer.isRunning()).to.be.true;
            });
        });
    });
});
