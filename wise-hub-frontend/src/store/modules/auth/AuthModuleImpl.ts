import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

import { AuthModule as Me } from "./AuthModule";
import { User, UserSettings } from "./User";
import { AuthModuleApiHelper } from "./AuthModuleApiHelper";
import { d, assertString } from "../../../util/util";

export namespace AuthModuleImpl {
    /**
     * State
     */
    export const state: Me.State = {
        username: "",
        user: undefined,
        loading: true,
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
        public static setUser = Me.localName("setUser");
        public static setLoading = Me.localName("setLoading");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setUsername](
            state: Me.State, payload: { username: string; },
        ) {
            state.username = d(payload.username);
        },
        [Mutations.setError](
            state: Me.State, payload: { error: string; },
        ) {
            state.error = assertString(d(payload.error));
        },
        [Mutations.setLoading](
            state: Me.State, payload: { loading: boolean },
        ) {
            state.loading = d(payload.loading);
        },
        [Mutations.setUser](
            state: Me.State, payload: { user: User | undefined },
        ) {
            state.user = payload.user;
        },
    };

    /**
     * Actions
     */
    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.initialize]: (
            { commit, dispatch, state }, payload: { username: string },
        ): void => {
            (async () => {
                try {
                    commit(Mutations.setError, { error: "" });
                    commit(Mutations.setLoading, { loading: true });

                    const user: User | false = await AuthModuleApiHelper.getUser();
                    if (user) {
                        commit(Mutations.setUser, { user: user });
                        commit(Mutations.setLoading, { loading: false });
                        commit(Mutations.setUsername, { username: user.account });
                    }
                    else {
                        commit(Mutations.setUser, { user: undefined });
                        commit(Mutations.setLoading, { loading: false });
                        commit(Mutations.setUsername, { username: "" });
                    }
                }
                catch(error) {
                    commit(Mutations.setError, { error: error + "" });
                    commit(Mutations.setUser, { user: undefined });
                    commit(Mutations.setLoading, { loading: false });
                    commit(Mutations.setUsername, { username: "" });
                }
            })();
        },

        [Me.Actions.saveSettings]: async (
            { commit, dispatch, state }, payload: { settings: UserSettings },
        ) => {
            const settings = d(payload.settings);
            console.log("AuthModule.Acrtions.saveSettings.payload=" + JSON.stringify(payload));
            await AuthModuleApiHelper.saveUserSettings(settings);
            await dispatch(Me.Actions.initialize);
        },

        [Me.Actions.logout]: (
            { commit, dispatch, state }, payload: { username: string },
        ): void => {
            (async () => {
                try {
                    commit(Mutations.setError, { error: "" });
                    commit(Mutations.setLoading, { loading: true });

                    const user = await AuthModuleApiHelper.logout();
                    commit(Mutations.setUser, { user: undefined });
                    commit(Mutations.setLoading, { loading: false });
                    commit(Mutations.setUsername, { username: "" });
                }
                catch(error) {
                    commit(Mutations.setError, { error: error + "" });
                    commit(Mutations.setLoading, { loading: false });
                }
            })();
        },
    };


    /**
     * Getters
     */
    const getters: GetterTree<Me.State, Me.State> = {
        [Me.Getters.isLoggedIn]: (state: Me.State): boolean => !!state.user
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
