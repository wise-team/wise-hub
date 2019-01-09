import ow from "ow";

export interface BlockingQueueConsumer<T> {
    // constructor(options: BlockingQueueConsumer.Options, callbacks: BlockingQueueConsumer.Callbacks<T>);
    start(): void;
    stop(): Promise<void>;
    isRunning(): boolean;
}

export namespace BlockingQueueConsumer {
    export interface Options {
        sleepAfterErrorMs: number;
        sleepBeforeNextTakeMs: number;
    }

    export namespace Options {
        export function validate(options: Options) {
            ow(options, ow.object.label("options"));
            ow(options.sleepAfterErrorMs, ow.number.positive.label("options.sleepAfterErrorMs"));
            ow(options.sleepBeforeNextTakeMs, ow.number.positive.label("options.sleepBeforeNextTakeMs"));
        }
    }

    export interface Callbacks<T> {
        init: () => Promise<void>;
        heartbeat: () => void;
        onError: (error: Error) => Promise<void>;
        fallbackLog: (msg: string, error?: Error) => void;
        take: () => Promise<T | undefined>;
        process: (job: T) => Promise<void>;
        onProcessSuccess: (job: T) => Promise<void>;
        onProcessFailure: (job: T, error: Error) => Promise<void>;
    }

    export namespace Callbacks {
        export function validate<T>(callbacks: Callbacks<T>) {
            ow(callbacks, ow.object.label("callbacks"));
            ow(callbacks.init, ow.function.label("callbacks.init"));
            ow(callbacks.heartbeat, ow.function.label("callbacks.heartbeat"));
            ow(callbacks.onError, ow.function.label("callbacks.onError"));
            ow(callbacks.fallbackLog, ow.function.label("callbacks.fallbackLog"));
            ow(callbacks.take, ow.function.label("callbacks.take"));
            ow(callbacks.process, ow.function.label("callbacks.process"));
            ow(callbacks.onProcessSuccess, ow.function.label("callbacks.onProcessSuccess"));
            ow(callbacks.onProcessFailure, ow.function.label("callbacks.onProcessFailure"));
        }
    }
}
