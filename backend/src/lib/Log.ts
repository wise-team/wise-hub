import { AbstractLog } from "steem-wise-core";

export class Log extends AbstractLog {
    private static INSTANCE: Log = new Log();

    private constructor() {
        super("wise-hub-backend");
    }

    public initialize() {
        super.init([
            process.env.WISE_HUB_BACKEND_LOG_LEVEL,
            process.env.WISE_LOG_LEVEL,
            "info"
        ]);
    }

    public init() {
        throw new Error("Instead of #init() please call #initialize(debug, verbose) which indirectly overrides init");
    }

    public logError(exceptionMsg: string, error: Error, attachement: any = undefined): void {
        this.error(JSON.stringify({ logMsgType: "error", logger: this.getName(), ...error, msg: exceptionMsg, attachement: attachement }));
    }

    public static log(): Log {
        return Log.INSTANCE;
    }
}
