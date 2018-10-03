import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { SteemConnectApiHelper } from "./SteemConnectApiHelper";

export namespace SteemConnectModule {
    export const modulePathName = "steemConnect";

    /**
     * State
     */
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

    const accessToken = SteemConnectApiHelper.getAccessToken();
    export const state: State = {
        account: undefined,
        accessToken: accessToken ? accessToken : "",
        loggedIn: !!accessToken,
        error: "",
    };
    export const persistentPaths: string [] = [
        
    ];




    /**
     * Mutations
     */
    // do not export as these mutations are private
    class Mutations {
        public static setAccount =  modulePathName + "_setAccount";
        public static setAccessToken = modulePathName + "_setAccessToken";
        public static setLoggedIn = modulePathName + "_setLoggedIn";
        public static setError = modulePathName + "_setError";
    }

    const mutations: MutationTree<State> = {
        [Mutations.setAccount](
            state: State, payload: { id: string; name: string; json_metadata: string; } | undefined,
        ) {
            state.account = payload;
        },
        [Mutations.setAccessToken](
            state: State, payload: string | undefined,
        ) {
            state.accessToken = payload;
        },
        [Mutations.setLoggedIn](
            state: State, payload: boolean,
        ) {
            state.loggedIn = payload;
        },
        [Mutations.setError](
            state: State, payload: string | undefined,
        ) {
            state.error = payload;
        },
    };

    /**
     * Actions
     */
    export class Actions {
        static reset = modulePathName + "_reset";
        public static initialize = modulePathName + "_initialize";
        public static logout = modulePathName + "_logout";
    }

    const actions: ActionTree<State, State> = {
        [Actions.reset]: (
            { commit, dispatch, state }, payload?: {} | undefined,
        ): void => {
            commit(Mutations.setAccount, undefined);
            commit(Mutations.setLoggedIn, false);
            commit(Mutations.setError, undefined);
        },

        [Actions.initialize]: (
            { commit, dispatch, state }, payload?: {} | undefined,
        ): void => {
            SteemConnectApiHelper.initialize()
            .then(
                result => {
                    if (result && result.account) {
                        commit(Mutations.setAccount, result.account);
                        commit(Mutations.setAccessToken, result.accessToken);
                        commit(Mutations.setLoggedIn, true);
                        commit(Mutations.setError, undefined);
                    }
                    else {
                        dispatch(Actions.reset);
                    }
                },
                error => {
                    console.error(error);
                    commit(Mutations.setError, error + "");
                    commit(Mutations.setLoggedIn, false);
                }
            )
        },
        [Actions.logout]: (
            { commit, dispatch, state }, payload: boolean,
        ): void => {
            SteemConnectApiHelper.logout()
            .then(
                result => {
                    dispatch(Actions.reset);
                    commit(Mutations.setLoggedIn, false);
                },
                error => {
                    console.error(error);
                    commit(Mutations.setError, error + "");
                    commit(Mutations.setLoggedIn, false);
                }
            );
        },
    };


    /**
     * Getters
     */
    export class Getters {
        public static getLoginUrl: string = modulePathName + "_getLoginUrl";
        public static isLoggedIn: string = modulePathName + "_isLoggedIn";
    };

    const getters: GetterTree<State, State> = {
        [Getters.getLoginUrl]: (state: State): string => SteemConnectApiHelper.getLoginUrl(),
        [Getters.isLoggedIn]: (state: State): boolean => state.loggedIn,
    };


    /**
     * Module
     */
    export const steemConnectModule: Module<State, any> = {
        state: state,
        mutations: mutations,
        actions: actions,
        getters: getters
    };
};
