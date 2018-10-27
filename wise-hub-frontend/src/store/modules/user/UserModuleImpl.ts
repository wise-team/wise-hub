import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

import { UserModule as Me } from "./UserModule";

export namespace UserModuleImpl {
    /**
     * State
     */
    export const state: Me.State = {
        username: "",
        loggedIn: false,
        loginMethod: undefined,
        error: "",
    };
    export const persistentPaths: string [] = [
        "username"
    ];



    /**
     * Mutations
     */
    // do not export as these mutations are private
    class Mutations {
        public static setUsername =  Me.localName("setUsername");
        public static setError =  Me.localName("setError");
        public static setLoggedIn = Me.localName("setLoggedIn");
        public static setLoginMethod = Me.localName("setLoginMethod");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setUsername](
            state: Me.State, payload: { username: string; },
        ) {
            state.username = payload.username;
        },
        [Mutations.setError](
            state: Me.State, payload: { error: string; },
        ) {
            state.error = payload.error;
        },
        [Mutations.setLoggedIn](
            state: Me.State, payload: { loggedIn: boolean },
        ) {
            state.loggedIn = payload.loggedIn;
        },
        [Mutations.setLoginMethod](
            state: Me.State, payload: { loginMethod: "steemconnect" | undefined },
        ) {
            state.loginMethod = payload.loginMethod;
        },
    };

    /**
     * Actions
     */
    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.setUsername]: (
            { commit, dispatch, state }, payload: { username: string },
        ): void => {
            commit(Mutations.setUsername, { username: payload.username });
            if (payload.username.length === 0) commit(Mutations.setLoggedIn, false);
        },

        [Me.Actions.clearUsername]: (
            { commit, dispatch, state },
        ): void => {
            commit(Mutations.setUsername, { username: "" });
            commit(Mutations.setLoggedIn, { loggedIn: false });
        },

        [Me.Actions.setLoggedIn]: (
            { commit, dispatch, state }, payload: { loggedIn: boolean, loginMethod: "steemconnect" },
        ): void => {
            commit(Mutations.setLoggedIn,  { loggedIn: payload.loggedIn });
            commit(Mutations.setLoginMethod,  { loginMethod: payload.loginMethod });
        },

        [Me.Actions.setError]: (
            { commit, dispatch, state }, payload: { error: string },
        ): void => {
            commit(Mutations.setError, { error: payload.error });
        },
    };


    /**
     * Getters
     */
    const getters: GetterTree<Me.State, Me.State> = {
    };


    /**
     * Module
     */
    export const module: Module<Me.State, any> = {
        state: state,
        mutations: mutations,
        actions: actions,
        getters: getters
    };
};
