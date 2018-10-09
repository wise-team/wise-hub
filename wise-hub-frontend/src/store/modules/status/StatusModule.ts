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
            operations: WiseOperation[];
        }
    }

    export interface WiseOperation {
        id: number;
        block_num: number;
        transaction_num: number;
        transaction_id: string;
        timestamp: string;
        moment: string;
        voter: string;
        delegator: string;
        operation_type: "confirm_vote" | "send_voteorder" | "set_rules";
        data: any;
    }

    export class Actions {
        public static initialize = localName("initialize");
        public static setAccountName = localName("setAccountName");
    }
}