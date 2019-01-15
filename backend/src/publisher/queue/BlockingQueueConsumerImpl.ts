import * as BluebirdPromise from "bluebird";

import { BlockingQueueConsumer } from "./BlockingQueueConsumer";

export class BlockingQueueConsumerImpl<T, R> implements BlockingQueueConsumer<T, R> {
    private options: BlockingQueueConsumer.Options;
    private callbacks: BlockingQueueConsumer.Callbacks<T, R>;
    private stopListeners: (() => void)[] = [];
    private running: boolean = false;

    public constructor(options: BlockingQueueConsumer.Options, callbacks: BlockingQueueConsumer.Callbacks<T, R>) {
        BlockingQueueConsumer.Options.validate(options);
        BlockingQueueConsumer.Callbacks.validate(callbacks);

        this.options = options;
        this.callbacks = callbacks;
    }

    public start() {
        (async () => {
            this.running = true;
            try {
                await this.callbacks.init();

                while (this.running) {
                    try {
                        this.heartbeat();
                        await this.take();
                    } catch (error) {
                        await this.onError(error);
                        await BluebirdPromise.delay(this.options.sleepAfterErrorMs);
                    }
                }
            } catch (error) {
                await this.onError(error);
            } finally {
                this.running = false;
                this.callStopListeners();
            }
        })();
    }

    public async stop(): Promise<void> {
        this.running = false;
        if (this.running) {
            await new Promise((resolve, reject) => {
                const stopListener = () => resolve();
                this.stopListeners.push(stopListener);
            });
        }
    }

    public isRunning(): boolean {
        return this.running;
    }

    private heartbeat() {
        try {
            this.callbacks.heartbeat();
        } catch (error) {
            this.fallbackLog("Error in BlockingQueueConsumer.hartbeat()", error);
        }
    }

    private async take() {
        const item: T | undefined = await this.callbacks.take();
        if (item) {
            this.processItemInSpawnedAsync(item);
            await BluebirdPromise.delay(this.options.sleepBeforeNextTakeMs);
        }
    }

    private async onError(error: Error) {
        try {
            await this.callbacks.onError(error);
        } catch (error) {
            this.fallbackLog("Error in BlockingQueueConsumer.onError()", error);
        }
    }

    private processItemInSpawnedAsync(item: T) {
        (async () => {
            try {
                const result: R = await this.process(item);
                await this.onProcessSuccess(item, result);
            } catch (error) {
                await this.onProcessFailure(item, error);
            }
        })();
    }

    private async process(item: T): Promise<R> {
        return await this.callbacks.process(item);
    }

    private async onProcessSuccess(item: T, result: R) {
        try {
            await this.callbacks.onProcessSuccess(item, result);
        } catch (error) {
            await this.onError(error);
        }
    }

    private async onProcessFailure(item: T, error: Error) {
        try {
            await this.callbacks.onProcessFailure(item, error);
        } catch (error) {
            await this.onError(error);
        }
    }

    private callStopListeners() {
        this.stopListeners.forEach(listener => listener());
    }

    private fallbackLog(msg: string, error?: Error) {
        try {
            this.callbacks.fallbackLog(msg, error);
        } catch (error) {
            console.error("Error in BlockingQueueConsumer.fallbackLog", error);
        }
    }
}
