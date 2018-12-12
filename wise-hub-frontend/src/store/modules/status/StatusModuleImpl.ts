import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { StatusApiHelper } from "./StatusApiHelper";
import { StatusModule as Me } from "./StatusModule";
import { d, assertString } from "../../../util/util";
import { EffectuatedWiseOperation } from "steem-wise-core";
import ow from "ow";

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
        },
        latestOperations: {
            loading: true,
            error: "",
            operations: []
        }
    };
    Me.validateState(state);
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
        public static setLatestOperations = Me.localName("setLatestOperations");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setAccountStatsLoadedFor](
            state: Me.State, payload: string,
        ) {
            ow(payload, ow.string.label("payload"));

            state.accountStats.loadedFor = payload;
            Me.validateState(state);
        },

        [Mutations.setAccountStatsVoting](
            state: Me.State, payload: { loading: boolean; value: boolean; error: string; },
        ) {
            ow(payload.loading, ow.boolean.label("payload.loading"));
            ow(payload.value, ow.boolean.label("payload.value"));
            ow(payload.error, ow.string.label("payload.error"));

            state.accountStats.voting = payload;
            Me.validateState(state);
        },

        [Mutations.setAccountStatsDelegating](
            state: Me.State, payload: { loading: boolean; value: boolean; error: string; },
        ) {
            ow(payload.loading, ow.boolean.label("payload.loading"));
            ow(payload.value, ow.boolean.label("payload.value"));
            ow(payload.error, ow.string.label("payload.error"));

            state.accountStats.delegating = payload;
            Me.validateState(state);
        },

        [Mutations.setAccountStatsSupporting](
            state: Me.State, payload: { loading: boolean; value: boolean; error: string; },
        ) {
            ow(payload.loading, ow.boolean.label("payload.loading"));
            ow(payload.value, ow.boolean.label("payload.value"));
            ow(payload.error, ow.string.label("payload.error"));

            state.accountStats.supporting = payload;
            Me.validateState(state);
        },

        [Mutations.setGeneralStats](
            state: Me.State, payload: { loading: boolean; error: string; voters: number; delegators: number; operations: number; },
        ) {
            ow(payload.loading, ow.boolean.label("payload.loading"));
            ow(payload.voters, ow.number.finite.label("payload.voters"));
            ow(payload.delegators, ow.number.finite.label("payload.delegators"));
            ow(payload.operations, ow.number.finite.label("payload.operations"));
            ow(payload.error, ow.string.label("payload.error"));

            state.generalStats = payload;
            Me.validateState(state);
        },

        [Mutations.setLatestOperations](
            state: Me.State, payload: { loading: boolean; error: string; operations: EffectuatedWiseOperation []; },
        ) {
            ow(payload.loading, ow.boolean.label("payload.loading"));
            ow(payload.operations, ow.array.label("payload.operations").ofType(ow.object));
            ow(payload.error, ow.string.label("payload.error"));

            state.latestOperations = payload;
            Me.validateState(state);
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

            StatusApiHelper.loadLatestOperations()
            .then(
                result => commit(Mutations.setLatestOperations, 
                    { loading: false, error: "", operations: result }
                ),
                error => commit(Mutations.setLatestOperations, 
                    { loading: false, error: error.message, operations: [] }
                )
            );
        },

        [Me.Actions.setAccountName]: (
            { commit, dispatch, state }, payload: { accountName: string },
        ): void => {
            ow(payload.accountName, ow.string.minLength(3).label("payload.accountName"));

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
