import { CustomError } from "../../lib/CustomError";

export interface Heartbeat {
    beat(ttlSeconds: number): void; // logs HartbeatError but does not throw
    isAlive(): Promise<boolean>; // throws HartbeatError
}

export namespace Heartbeat {
    export function isHartbeat(o: any): o is Heartbeat {
        return (<Heartbeat>o).beat !== undefined && (<Heartbeat>o).isAlive !== undefined;
    }

    export class HeartbeatError extends CustomError {
        public constructor(message?: string, cause?: Error) {
            super(message, cause);
        }
    }
}
