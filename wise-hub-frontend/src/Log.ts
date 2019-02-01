import { AbstractUniverseLog } from "universe-log";
import { Wise } from "steem-wise-core";

export class Log extends AbstractUniverseLog {
    private static INSTANCE: Log = new Log();

    private constructor() {
        super("wise-hub");
    }

    public init() {
        super.init([
            (window as any).WISE_HUB_LOG_LEVEL,
            (window as any).WISE_LOG_LEVEL,
            "info"
        ]);
        Wise.getLog().init();
    }

    public static log(): Log {
        return Log.INSTANCE;
    }
}

Log.log().init();