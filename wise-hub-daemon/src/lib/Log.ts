import { AbstractLog } from "steem-wise-core";

export class Log extends AbstractLog {
    private static INSTANCE: Log = new Log();

    private constructor() {
        super("wise-hub-daemon");
    }

    public initialize() {
        super.init([
            process.env.WISE_HUB_DAEMON_LOG_LEVEL,
            process.env.WISE_LOG_LEVEL,
            "info"
        ]);
    }

    public init() {
        throw new Error("Instead of #init() please call #initialize(debug, verbose) which indirectly overrides init");
    }

    public static log(): Log {
        return Log.INSTANCE;
    }
}
