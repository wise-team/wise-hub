import ow from "ow";
import { WiseSQLProtocol, EffectuatedWiseOperation } from "steem-wise-core";

export namespace StatusModule {
    export const modulePathName = "status";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export interface State {
        accountStats: {
            loadedFor: string;
            voting: {
                loading: boolean;
                value: boolean;
                error: string;
            },
            delegating: {
                loading: boolean;
                value: boolean;
                error: string;
            },
            supporting: {
                loading: boolean;
                value: boolean;
                error: string;
            }
        },
        generalStats: {
            loading: boolean;
            error: string;
            voters: number;
            delegators: number;
            operations: number;
        },
        latestOperations: {
            loading: boolean;
            error: string;
            operations: EffectuatedWiseOperation [];
        }
    }
    export function validateState(state: State) {
        ow(state.accountStats, ow.object.label("state.accountStats"));
        ow(state.accountStats.loadedFor, ow.string.label("state.loadedFor"));
        ow(state.accountStats.voting, ow.object.label("state.accountStats.voting"));
        ow(state.accountStats.voting.loading, ow.boolean.label("state.accountStats.voting.loading"));
        ow(state.accountStats.voting.value, ow.boolean.label("state.accountStats.voting.value"));
        ow(state.accountStats.voting.error, ow.string.label("state.accountStats.voting.error"));
        ow(state.accountStats.delegating, ow.object.label("state.accountStats.delegating"));
        ow(state.accountStats.delegating.loading, ow.boolean.label("state.accountStats.delegating.loading"));
        ow(state.accountStats.delegating.value, ow.boolean.label("state.accountStats.delegating.value"));
        ow(state.accountStats.delegating.error, ow.string.label("state.accountStats.delegating.error"));
        ow(state.accountStats.supporting, ow.object.label("state.accountStats.supporting"));
        ow(state.accountStats.supporting.loading, ow.boolean.label("state.accountStats.supporting.loading"));
        ow(state.accountStats.supporting.value, ow.boolean.label("state.accountStats.supporting.value"));
        ow(state.accountStats.supporting.error, ow.string.label("state.accountStats.supporting.error"));

        ow(state.generalStats, ow.object.label("state.generalStats"));
        ow(state.generalStats.loading, ow.boolean.label("state.generalStats.loading"));
        ow(state.generalStats.error, ow.string.label("state.generalStats.error"));
        ow(state.generalStats.voters, ow.number.finite.greaterThanOrEqual(-1).label("state.generalStats.voters"));
        ow(state.generalStats.delegators, ow.number.finite.greaterThanOrEqual(-1).label("state.generalStats.delegators"));
        ow(state.generalStats.operations, ow.number.finite.greaterThanOrEqual(-1).label("state.generalStats.operations"));

        ow(state.latestOperations, ow.object.label("state.latestOperations"));
        ow(state.latestOperations.loading, ow.boolean.label("state.latestOperations.loading"));
        ow(state.latestOperations.error, ow.string.label("state.latestOperations.error"));
        ow(state.latestOperations.operations, ow.array.label("state.latestOperations.operations").ofType(ow.object));
    }

    /*export interface WiseOperation extends WiseSQLProtocol.Row {
        data: WiseComm;
    }
    export namespace WiseOperation {
        export function validate(op: WiseOperation) {
            ow(op, ow.object.label("op").is(op => WiseSQLProtocol.Row.isRow(op) || `WiseOperation ${op} is not WiseSQLProtocol.Row`);
            ow(op.data)
        }
    }*/


    export class Actions {
        public static initialize = localName("initialize");
        public static setAccountName = localName("setAccountName");
    }
}