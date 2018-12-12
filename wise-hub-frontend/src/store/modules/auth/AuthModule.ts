import ow from "ow";

import { User } from "./User";
import { userInfo } from "os";

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
    export function validateState(state: State) {
        ow(state.username, ow.string.label("state.state"));
        ow(state.user, ow.any(ow.undefined, ow.object.label("state.user")));
        if (state.user) User.validate(state.user);
        ow(state.loading, ow.boolean.label("state.loading"));
        ow(state.error, ow.string.label("state.error"));
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