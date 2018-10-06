
export namespace SteemConnectModule {
    export const modulePathName = "steemConnect";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export class Actions {
        static reset = modulePathName + "_reset";
        public static initialize = modulePathName + "_initialize";
        public static logout = modulePathName + "_logout";
    }

    export interface State {
        account: {
            id: string;
            name: string;
            json_metadata: string; 
        } | undefined;
        accessToken: string | undefined;
        loggedIn: boolean;
        error: string | undefined;
    }
}