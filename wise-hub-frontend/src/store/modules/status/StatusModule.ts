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
        }
    }

    export class Actions {
        public static setAccountName = localName("setAccountName");
    }
}