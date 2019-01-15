import { RedisDualQueue } from "./RedisDualQueue";

export class RedisDualQueueMock implements RedisDualQueue {
    public async isWaitingQueueEmpty(): Promise<boolean> {
        throw new Error("Unmocked method");
    }

    public async isProcessingQueueEmpty(): Promise<boolean> {
        throw new Error("Unmocked method");
    }

    public async pushAllFromProcessingQueueToWaitingQueue(): Promise<void> {
        throw new Error("Unmocked method");
    }

    public async pushToWaitingQueue(entry: string): Promise<void> {
        throw new Error("Unmocked method");
    }

    public async popFromWaitingQueuePushToProcessingQueue(timeoutSeconds: number): Promise<string | undefined> {
        throw new Error("Unmocked method");
    }

    public async removeFromProcessingQueue(entry: string): Promise<void> {
        throw new Error("Unmocked method");
    }
}
