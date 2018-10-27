
export namespace UserModule {
    export const modulePathName = "user";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export interface State {
        username: string;
        loggedIn: boolean;
        error: string;
        loginMethod: "steemconnect" | undefined;
    }

    export class Actions {
        public static setLoggedIn = localName("setLoggedIn");
        public static setUsername = localName("setUsername");
        public static setError = localName("setError");
        public static clearUsername = localName("clearUsername");
    }

    export class Getters {
        public static isLoggedIn: string = localName("isLoggedIn");
    };
}