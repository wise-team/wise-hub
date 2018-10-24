import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import * as _ from "lodash";
import { RulesetsModuleApiHelper } from "./RulesetsModuleApiHelper";
import { RulesetsModule as Me } from "./RulesetsModule";
import { d, assertString } from "../../../util/util";
import { EffectuatedSetRules, Rule, Ruleset } from "steem-wise-core";
import { NormalizedRulesets } from "./NormalizedRulesets";

export namespace RulesetsModuleImpl {

    export const state: Me.State = {
        loading: false,
        error: "",
        loadedFor: "",
        changed: false,
        backupNormalizedRulesets: { entities: { rules: {}, rulesets: {}, setRules: {} }, result: [] },
        normalizedRulesets: { entities: { rules: {}, rulesets: {}, setRules: {} }, result: [] }
    };
    export const persistentPaths: string [] = [
        
    ];


    /**
     * Mutations
     */
    // do not export as these mutations are private
    class Mutations {
        public static setStatus =  Me.localName("setStatus");
        public static setNormalizedRulesets =  Me.localName("setNormalizedRulesets");
    
        public static updateRule =  Me.localName("updateRule");
        public static updateRuleset =  Me.localName("updateRuleset");
        public static updateSetRules =  Me.localName("updateSetRules");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setStatus](
            state: Me.State, payload: { loading?: boolean; loadedFor?: string; error?: string; },
        ) {
            if (payload.loadedFor) state.loadedFor = payload.loadedFor;
            if (typeof payload.loading !== "undefined") {
                state.loading = payload.loading;
            }
            if (payload.error) state.error = payload.error;
        },

        [Mutations.setNormalizedRulesets](
            state: Me.State, payload: NormalizedRulesets.Result,
        ) {
            state.normalizedRulesets = payload;
            state.backupNormalizedRulesets = _.cloneDeep(payload);
        },

        [Mutations.updateRule](
            state: Me.State, payload: NormalizedRulesets.NormalizedRule,
        ) {
            state.normalizedRulesets.entities.rules[payload.id] = payload;
            if (!state.backupNormalizedRulesets.entities.rules[payload.id]
                || !_.isEqual(state.backupNormalizedRulesets.entities.rules[payload.id], payload)) {
                state.changed = true;
            }
        },

        [Mutations.updateRuleset](
            state: Me.State, payload: NormalizedRulesets.NormalizedRuleset,
        ) {
            state.normalizedRulesets.entities.rulesets[payload.id] = payload;
            if (!state.backupNormalizedRulesets.entities.rulesets[payload.id]
                || !_.isEqual(state.backupNormalizedRulesets.entities.rulesets[payload.id], payload)) {
                state.changed = true;
            }
        },

        [Mutations.updateSetRules](
            state: Me.State, payload: NormalizedRulesets.NormalizedSetRulesForVoter,
        ) {
            state.normalizedRulesets.entities.setRules[payload.id] = payload;
            if (!state.backupNormalizedRulesets.entities.setRules[payload.id]
                || !_.isEqual(state.backupNormalizedRulesets.entities.setRules[payload.id], payload)) {
                state.changed = true;
            }
        },
    };


    /**
     * Actions
     */
    class PrivateActions {
    }

    const normalizer = new NormalizedRulesets();
    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.setVoterAndOrDelegator]: (
            { commit, dispatch, state }, payload: { delegator?: string; voter?: string; },
        ): void => {
            (async () => {
                try {
                    if (! payload.delegator && ! payload.voter)
                        throw new Error("You have to specify the voter, the delegator, or both");
                    
                    const loadFor = payload.delegator + "_" + payload.voter;
                    if (state.loadedFor !== loadFor) {
                        commit(Mutations.setStatus, { loading: true, loadedFor: loadFor });

                        const result: EffectuatedSetRules [] = await RulesetsModuleApiHelper
                            .loadRulesets({ delegator: payload.delegator, voter: payload.voter });

                        const normalized: NormalizedRulesets.Result = normalizer.normalize(result);
                        commit(Mutations.setNormalizedRulesets, normalized);
                        commit(Mutations.setStatus, { loading: false, error: "" });
                    }
                }
                catch (error) {
                    commit(Mutations.setStatus, { loading: false, error: error + ": " + error.message });
                }
            })();
        },

        [Me.Actions.updateRule]: (
            { commit, dispatch, state }, payload: NormalizedRulesets.NormalizedRule,
        ): void => {
            commit(Mutations.updateRule, payload);
        },

        [Me.Actions.deleteRule]: (
            { commit, dispatch, state }, payload: { rulesetId: NormalizedRulesets.ID, ruleId: NormalizedRulesets.ID },
        ): void => {
            _.unset(state.normalizedRulesets.entities.rules, payload.ruleId);

            const newRuleset: NormalizedRulesets.NormalizedRuleset
                = _.cloneDeep(state.normalizedRulesets.entities.rulesets[payload.rulesetId]);
            const ruleIndex = newRuleset.rules.indexOf(payload.ruleId);

            if (ruleIndex < 0) {
                throw new Error("Rule with id " + payload.ruleId + " does not belong to ruleset with id " + newRuleset.id);
            }
            newRuleset.rules.splice(ruleIndex, 1);

            commit(Mutations.updateRuleset, newRuleset);
        },

        [Me.Actions.createNewRule]: (
            { commit, dispatch, state }, payload: { rulesetId: NormalizedRulesets.ID, rule: NormalizedRulesets.NormalizedRule },
        ): void => {
            commit(Mutations.updateRule, payload.rule);

            const newRuleset: NormalizedRulesets.NormalizedRuleset
                = _.cloneDeep(state.normalizedRulesets.entities.rulesets[payload.rulesetId]);
            newRuleset.rules.push(payload.rule.id);
            commit(Mutations.updateRuleset, newRuleset);
        },

        [Me.Actions.createNewRuleset]: (
            { commit, dispatch, state }, payload: { ruleset: NormalizedRulesets.NormalizedRuleset, voter: string },
        ): void => {
            commit(Mutations.updateRuleset, payload.ruleset);

            let targetSetRules: NormalizedRulesets.NormalizedSetRulesForVoter | undefined = undefined;
            const targetSetRulesOpt = _.values(state.normalizedRulesets.entities.setRules).filter(
                (setRules: NormalizedRulesets.NormalizedSetRulesForVoter) => setRules.voter === payload.voter
            );
            if (targetSetRulesOpt.length > 0) targetSetRules = _.cloneDeep(targetSetRulesOpt[0]);
            if (targetSetRules) {
                targetSetRules.rulesets.push(payload.ruleset.id);
                commit(Mutations.updateSetRules, targetSetRules);
            }
            else {
                targetSetRules = {
                    id: normalizer.getIdForSetRules(),
                    voter: payload.voter,
                    rulesets: [ payload.ruleset.id ]
                };
                commit(Mutations.updateSetRules, targetSetRules);
            }
        },

        [Me.Actions.deleteRuleset]: (
            { commit, dispatch, state }, payload: { setRulesId: NormalizedRulesets.ID, rulesetId: NormalizedRulesets.ID },
        ): void => {
            _.unset(state.normalizedRulesets.entities.rulesets, payload.rulesetId);

            const newSetRules: NormalizedRulesets.NormalizedSetRulesForVoter
                = _.cloneDeep(state.normalizedRulesets.entities.setRules[payload.setRulesId]);
            const rulesetIndex = newSetRules.rulesets.indexOf(payload.rulesetId);
            if (rulesetIndex < 0) {
                throw new Error("Ruleset with id " + payload.rulesetId + " does not belong to set rules with id " + payload.setRulesId);
            }
            newSetRules.rulesets.splice(rulesetIndex);
             
            commit(Mutations.updateSetRules, newSetRules);
        },

        [Me.Actions.renameRuleset]: (
            { commit, dispatch, state }, payload: { rulesetId: NormalizedRulesets.ID, name: string },
        ): void => {
            const newRuleset: NormalizedRulesets.NormalizedRuleset
                = _.cloneDeep(state.normalizedRulesets.entities.rulesets[payload.rulesetId]);
            newRuleset.name = name;
            commit(Mutations.updateRuleset, newRuleset);
        },

        [Me.Actions.changeRulesetVoter]: (
            { commit, dispatch, state }, payload: { setRulesId: string, rulesetId: NormalizedRulesets.ID, voter: string; },
        ): void => {
            if (state.normalizedRulesets.entities.setRules[payload.setRulesId].voter === payload.voter) return;

            const oldSetRules = state.normalizedRulesets.entities.setRules[payload.setRulesId];
            const rulesetIndex = oldSetRules.rulesets.indexOf(payload.rulesetId);
            if (rulesetIndex > 0) oldSetRules.rulesets.splice(rulesetIndex, 1);
            commit(Mutations.updateSetRules, oldSetRules);

            let targetSetRules: NormalizedRulesets.NormalizedSetRulesForVoter | undefined = undefined;
            const targetSetRulesOpt = _.values(state.normalizedRulesets.entities.setRules).filter(
                (setRules: NormalizedRulesets.NormalizedSetRulesForVoter) => setRules.voter === payload.voter
            );
            if (targetSetRulesOpt.length > 0) targetSetRules = _.cloneDeep(targetSetRulesOpt[0]);
            if (targetSetRules) {
                targetSetRules.rulesets.push(payload.rulesetId);
                commit(Mutations.updateSetRules, targetSetRules);
            }
            else {
                targetSetRules = {
                    id: normalizer.getIdForSetRules(),
                    voter: payload.voter,
                    rulesets: [ payload.rulesetId ]
                };
                commit(Mutations.updateSetRules, targetSetRules);
            }
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
