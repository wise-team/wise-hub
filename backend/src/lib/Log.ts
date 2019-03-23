import { AbstractUniverseLog, PortableEnv } from "universe-log";

export class Log extends AbstractUniverseLog {
    public static log(): Log {
        return Log.INSTANCE;
    }
    private static INSTANCE: Log = new Log();

    private constructor() {
        super({
            levelEnvs: ["WISE_HUB_BACKEND_LOG_LEVEL", "WISE_HUB_LOG_LEVEL", "WISE_LOG_LEVEL"],
            metadata: {
                environment: PortableEnv("WISE_ENVIRONMENT_TYPE"),
                project: "wise-hub",
                module: "wise-hub-backend",
            },
        });
    }

    public initialize() {
        super.init();
    }

    public init() {
        throw new Error("Instead of #init() please call #initialize(debug, verbose) which indirectly overrides init");
    }
}

/*

import { AbstractUniverseLog } from "universe-log";
import * as serializeError from "serialize-error";

export class Log extends AbstractUniverseLog {
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
*/
