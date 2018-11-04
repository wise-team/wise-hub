import { User } from "./User";

export namespace AuthModule {
    export const modulePathName = "auth";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export interface State {
        username: string;
        user: User | undefined;
        loading: boolean;
        error: string;
    }

    export class Actions {
        public static initialize = localName("initialize");
        public static saveSettings = localName("saveSettings");
        public static logout = localName("logout");
    }

    export class Getters {
        public static isLoggedIn: string = localName("loggedIn");
    };
}