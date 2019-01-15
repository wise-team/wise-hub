import { CustomError } from "../../lib/CustomError";

export interface RedisDualQueue {
    isWaitingQueueEmpty(): Promise<boolean>;
    isProcessingQueueEmpty(): Promise<boolean>;

    pushAllFromProcessingQueueToWaitingQueue(): Promise<void>;
    pushToWaitingQueue(entry: string): Promise<void>;
    popFromWaitingQueuePushToProcessingQueue(timeoutSeconds: number): Promise<string | undefined>;
    removeFromProcessingQueue(entry: string): Promise<void>;
    removeFromProcessingQueueAndPushBackToWaitingQueue(entry: string): Promise<void>;
}

export namespace RedisDualQueue {
    export function isRedisDualQueue(obj: any): obj is RedisDualQueue {
        const o = <RedisDualQueue>obj;
        return (
            o.isWaitingQueueEmpty !== undefined &&
            o.isProcessingQueueEmpty !== undefined &&
            o.pushToWaitingQueue !== undefined &&
            o.popFromWaitingQueuePushToProcessingQueue !== undefined &&
            o.removeFromProcessingQueue !== undefined &&
            o.removeFromProcessingQueueAndPushBackToWaitingQueue !== undefined
        );
    }
    export class RedisDualQueueError extends CustomError {
        public constructor(message?: string, cause?: Error) {
            super(message, cause);
        }
    }
}