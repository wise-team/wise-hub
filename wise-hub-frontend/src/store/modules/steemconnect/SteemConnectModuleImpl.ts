import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { SteemConnectApiHelper } from "./SteemConnectApiHelper";

import { SteemConnectModule as Me } from "./SteemConnectModule";
import { StatusModule } from "../status/StatusModule";
import { UserModule } from "../user/UserModule";

export namespace SteemConnectModuleImpl {
    /**
     * State
     */
    const accessToken = SteemConnectApiHelper.getAccessToken();
    export const state: Me.State = {
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
        public static setAccount =  Me.localName("setAccount");
        public static setAccessToken = Me.localName("setAccessToken");
        public static setLoggedIn = Me.localName("setLoggedIn");
        public static setError = Me.localName("setError");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setAccount](
            state: Me.State, payload: { id: string; name: string; json_metadata: string; } | undefined,
        ) {
            state.account = payload;
        },
        [Mutations.setAccessToken](
            state: Me.State, payload: string | undefined,
        ) {
            state.accessToken = payload;
        },
        [Mutations.setLoggedIn](
            state: Me.State, payload: boolean,
        ) {
            state.loggedIn = payload;
        },
        [Mutations.setError](
            state: Me.State, payload: string | undefined,
        ) {
            state.error = payload;
        },
    };

    /**
     * Actions
     */
    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.reset]: (
            { commit, dispatch, state }, payload?: {} | undefined,
        ): void => {
            commit(Mutations.setAccount, undefined);
            commit(Mutations.setLoggedIn, false);
            commit(Mutations.setError, undefined);
        },

        [Me.Actions.initialize]: (
            { commit, dispatch, state }, payload?: {} | undefined,
        ): void => {
            const accessTokenOrFalse = SteemConnectApiHelper.initialize();
            if (!accessTokenOrFalse) {
                commit(Mutations.setAccessToken, undefined);
                commit(Mutations.setLoggedIn, false);
                return;
            }
            const accessToken = accessTokenOrFalse;
            commit(Mutations.setAccessToken, accessToken);
            commit(Mutations.setLoggedIn, true);

            SteemConnectApiHelper.loadAccount()
            .then(
                resultAccount => {
                    if (resultAccount) {
                        commit(Mutations.setAccount, resultAccount);
                        commit(Mutations.setLoggedIn, true);
                        commit(Mutations.setError, undefined);
                        dispatch(StatusModule.Actions.setAccountName, { accountName: resultAccount.name });
                        dispatch(UserModule.Actions.setUsername, { username: resultAccount.name });
                        dispatch(UserModule.Actions.setLoggedIn, { loggedIn: true, loginMethod: "steemconnect" });
                    }
                    else {
                        dispatch(Me.Actions.reset);
                    }
                },
                error => {
                    console.error(error);
                    commit(Mutations.setError, error + "");
                    commit(Mutations.setLoggedIn, false);
                }
            )
        },

        [Me.Actions.logout]: (
            { commit, dispatch, state }, payload: boolean,
        ): void => {
            SteemConnectApiHelper.logout()
            .then(
                result => {
                    dispatch(Me.Actions.reset);
                    commit(Mutations.setLoggedIn, false);
                    dispatch(UserModule.Actions.setLoggedIn, { loggedIn: false });
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
    const getters: GetterTree<Me.State, Me.State> = {
        [Me.Getters.getLoginUrl]: (state: Me.State): string => SteemConnectApiHelper.getLoginUrl(),
        [Me.Getters.isLoggedIn]: (state: Me.State): boolean => state.loggedIn,
        [Me.Getters.isLoading]: (state: Me.State): boolean => state.loggedIn && !state.account,
    };


    /**
     * Module
     */
    export const steemConnectModule: Module<Me.State, any> = {
        state: state,
        mutations: mutations,
        actions: actions,
        getters: getters
    };
};
