
export namespace SteemConnectModule {
    export const modulePathName = "steemConnect";
    export function localName(name: string) {
        return modulePathName + "_" + name;
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

    export class Actions {
        static reset = localName("reset");
        public static initialize = localName("initialize");
        public static logout = localName("logout");
    }

    export class Getters {
        public static getLoginUrl: string = localName("getLoginUrl");
        public static isLoggedIn: string = localName("isLoggedIn");
    };
}