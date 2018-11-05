import { EffectuatedWiseOperation } from "steem-wise-core";

// this works since webpack outputs all compiled code into User
export interface DaemonLogEntry {
    time?: number;
    msg: string;
    error?: string;
    transaction?: {
        trx_id: string;
        block_num: number;
        trx_num: number;
    };
    wiseOp?: EffectuatedWiseOperation;
    [ x: string ]: any;
}