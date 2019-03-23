import { CustomError } from "universe-log";

export interface RedisDualQueue {
    isWaitingQueueEmpty(): Promise<boolean>;
    isProcessingQueueEmpty(): Promise<boolean>;

    pushAllFromProcessingQueueToWaitingQueue(): Promise<void>;
    pushToWaitingQueue(entry: string): Promise<void>;
    popFromWaitingQueuePushToProcessingQueue(timeoutSeconds: number): Promise<string | undefined>;
    removeFromProcessingQueue(entry: string): Promise<void>;
}

export namespace RedisDualQueue {
    export function isRedisDualQueue(obj: any): obj is RedisDualQueue {
        const o = obj as RedisDualQueue;
        return (
            o.isWaitingQueueEmpty !== undefined &&
            o.isProcessingQueueEmpty !== undefined &&
            o.pushToWaitingQueue !== undefined &&
            o.popFromWaitingQueuePushToProcessingQueue !== undefined &&
            o.removeFromProcessingQueue !== undefined
        );
    }

    export class RedisDualQueueError extends CustomError {
        public constructor(message?: string, cause?: Error) {
            super(message, cause);
        }
    }
}
