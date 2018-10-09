import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { StatusApiHelper } from "./StatusApiHelper";
import { StatusModule as Me } from "./StatusModule";
import { d, assertString } from "../../../util/util";

export namespace StatusModuleImpl {

    export const state: Me.State = {
        accountStats: {
            loadedFor: "",
            voting: {
                loading: true,
                value: false,
                error: ""
            },
            delegating: {
                loading: true,
                value: false,
                error: ""
            },
            supporting: {
                loading: true,
                value: false,
                error: ""
            }
        },
        generalStats: {
            loading: true,
            error: "",
            voters: -1,
            delegators: -1,
            operations: -1,
        }
    };
    export const persistentPaths: string [] = [
        
    ];




    /**
     * Mutations
     */
    // do not export as these mutations are private
    class Mutations {
        public static setAccountStatsLoadedFor =  Me.localName("setAccountStatsLoadedFor");
        public static setAccountStatsVoting = Me.localName("setAccountStatsVoting");
        public static setAccountStatsDelegating = Me.localName("setAccountStatsDelegating");
        public static setAccountStatsSupporting = Me.localName("setAccountStatsSupporting");
        public static setGeneralStats = Me.localName("setGeneralStats");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setAccountStatsLoadedFor](
            state: Me.State, payload: string,
        ) {
            state.accountStats.loadedFor = payload;
        },

        [Mutations.setAccountStatsVoting](
            state: Me.State, payload: { loading: boolean; value: boolean; error: string; },
        ) {
            state.accountStats.voting = payload;
        },

        [Mutations.setAccountStatsDelegating](
            state: Me.State, payload: { loading: boolean; value: boolean; error: string; },
        ) {
            state.accountStats.delegating = payload;
        },

        [Mutations.setAccountStatsSupporting](
            state: Me.State, payload: { loading: boolean; value: boolean; error: string; },
        ) {
            state.accountStats.supporting = payload;
        },

        [Mutations.setGeneralStats](
            state: Me.State, payload: { loading: boolean; error: string; voters: number; delegators: number; operations: number; },
        ) {
            state.generalStats = payload;
        },
    };

    /**
     * Actions
     */
    class PrivateActions {
        public static loadAccountStats = Me.localName("__loadAccountStats");
    }

    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.initialize]: (
            { commit, dispatch, state }, payload: {},
        ): void => {
            StatusApiHelper.loadGeneralStats()
            .then(
                result => commit(Mutations.setGeneralStats, 
                    { loading: false, error: "", delegators: result.delegators, voters: result.voters, operations: result.operations }
                ),
                error => commit(Mutations.setGeneralStats, 
                    { loading: false, error: error.message, delegators: -1, voters: -1, operations: -1 }
                )
            );
        },

        [Me.Actions.setAccountName]: (
            { commit, dispatch, state }, payload: { accountName: string },
        ): void => {
            if (payload.accountName !== state.accountStats.loadedFor) {
                commit(Mutations.setAccountStatsLoadedFor, d(assertString(payload.accountName)));
                dispatch(PrivateActions.loadAccountStats);
            }
        },

        [PrivateActions.loadAccountStats]: (
            { commit, dispatch, state }, payload?: {} | undefined,
        ): void => {
            commit(Mutations.setAccountStatsVoting, { loading: true, value: false, error: "" });
            StatusApiHelper.isVoting(state.accountStats.loadedFor).then(
                result => {
                    commit(Mutations.setAccountStatsVoting, { loading: false, value: result, error: "" });
                },
                error => {
                    commit(Mutations.setAccountStatsVoting, { loading: false, value: false, error: error + "" });
                }
            );

            commit(Mutations.setAccountStatsDelegating, { loading: true, value: false, error: "" });
            StatusApiHelper.isDelegating(state.accountStats.loadedFor).then(
                result => {
                    commit(Mutations.setAccountStatsDelegating, { loading: false, value: result, error: "" });
                },
                error => {
                    commit(Mutations.setAccountStatsDelegating, { loading: false, value: false, error: error + "" });
                }
            );

            commit(Mutations.setAccountStatsSupporting, { loading: true, value: false, error: "" });
            StatusApiHelper.isSupporting(state.accountStats.loadedFor).then(
                result => {
                    commit(Mutations.setAccountStatsSupporting, { loading: false, value: result, error: "" });
                },
                error => {
                    commit(Mutations.setAccountStatsSupporting, { loading: false, value: false, error: error });
                }
            );
        },
    };


    /**
     * Getters
     */
    export class Getters {

    };

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
