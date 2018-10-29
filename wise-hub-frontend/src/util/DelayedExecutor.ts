export class DelayedExecutor {
    private delayMs: number;
    private timeout: any;

    public constructor(delayMs: number) {
        this.delayMs = delayMs;
    }

    public execute(fn: () => Promise<void>) {
        if(this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            fn();
        }, this.delayMs);
    }
}