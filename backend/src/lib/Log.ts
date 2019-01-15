import { AbstractLog } from "steem-wise-core";
import * as serializeError from "serialize-error";

export class Log extends AbstractLog {
    private static INSTANCE: Log = new Log();

    private constructor() {
        super("wise-hub-backend");
    }

    public initialize() {
        super.init([process.env.WISE_HUB_BACKEND_LOG_LEVEL, process.env.WISE_LOG_LEVEL, "info"]);
    }

    public init() {
        throw new Error("Instead of #init() please call #initialize(debug, verbose) which indirectly overrides init");
    }

    public logError(debugInfo: string, error?: Error, attachement: any = undefined): void {
        const stack = new Error().stack;
        this.error(
            JSON.stringify({
                logMsgType: "error",
                logger: { name: this.getName(), stack: stack },
                debug: { info: debugInfo },
                attachement: attachement,
                ...(error ? serializeError(error) : {}),
            })
        );
    }

    public static log(): Log {
        return Log.INSTANCE;
    }
}
