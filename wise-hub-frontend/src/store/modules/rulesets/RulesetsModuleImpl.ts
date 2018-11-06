import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import * as _ from "lodash";
import * as steem from "steem";
import { RulesetsModuleApiHelper } from "./RulesetsModuleApiHelper";
import { RulesetsModule as Me } from "./RulesetsModule";
import { d, assertString, uniqueId } from "../../../util/util";
import Wise, { EffectuatedSetRules, Rule, Ruleset, SetRulesForVoter, RulesUpdater, VotersRule, RulePrototyper } from "steem-wise-core";
import { NormalizedRulesets } from "./NormalizedRulesets";
import Vue from "vue";

export namespace RulesetsModuleImpl {

    export const state: Me.State = {
        loading: false,
        error: "",
        loadedFor: "",
        backupNormalizedRulesets: { entities: { rules: {}, rulesets: {}, setRules: {} }, result: [] },
        normalizedRulesets: { entities: { rules: {}, rulesets: {}, setRules: {} }, result: [] },
        edit: {
            rulesetId: "",
            modified: false
        },
        publish: { 
            loading: false,
            error: "",
            result: "",
            for: ""
        },
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
        public static updateEdit =  Me.localName("setEdit");
        public static resetChanges =  Me.localName("resetChanges");
        // public static updateModifiedSetRulesArray =  Me.localName("updateModifiedSetRulesArray");
        public static updatePublishStatus =  Me.localName("updatePublishStatus");
        public static commitChangesToBackupRulesets =  Me.localName("commitChangesToBackupRulesets");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.setStatus](
            state: Me.State, payload: { loading?: boolean; loadedFor?: string; delegator?: string; voter?: string; error?: string; },
        ) {
            if (payload.loadedFor) state.loadedFor = payload.loadedFor;
            if (payload.delegator) state.delegator = payload.delegator;
            if (payload.voter) state.voter = payload.voter;
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

        [Mutations.commitChangesToBackupRulesets](
            state: Me.State
        ) {
            state.backupNormalizedRulesets = _.cloneDeep(state.normalizedRulesets);;
        },

        [Mutations.resetChanges](
            state: Me.State
        ) {
            state.normalizedRulesets = _.cloneDeep(state.backupNormalizedRulesets);;
        },

        [Mutations.updateRule](
            state: Me.State, payload: NormalizedRulesets.NormalizedRule,
        ) {
            const prototypedRule = RulePrototyper.fromUnprototypedRule(_.omit(payload, "id"));
            prototypedRule.validateRuleObject(prototypedRule);
            /*if (state.normalizedRulesets.entities.rules[payload.id]) {
                state.normalizedRulesets.entities.rules[payload.id] = payload;
            }
            else {*/
            //const out = Vue.set(state.normalizedRulesets.entities.rules, payload.id, _.cloneDeep(payload));
            state.normalizedRulesets.entities.rules = { 
                ...state.normalizedRulesets.entities.rules, [payload.id]: payload
            };
            //}
            // console.log("Updated rule");
            // console.log(state.normalizedRulesets.entities);
            //console.log(out);

            /*if (!state.backupNormalizedRulesets.entities.rules[payload.id]
                || !_.isEqual(state.backupNormalizedRulesets.entities.rules[payload.id], payload)) {
                state.changed = true;
            }*/
        },

        [Mutations.updateRuleset](
            state: Me.State, payload: NormalizedRulesets.NormalizedRuleset,
        ) {
            state.normalizedRulesets.entities.rulesets[payload.id] = payload;
            
            //if (state.normalizedRulesets.entities.rulesets[payload.id]) {
            //    state.normalizedRulesets.entities.rulesets[payload.id] = payload;
            //}
            //else {
                //const out = Vue.set(state.normalizedRulesets.entities.rulesets, payload.id, _.cloneDeep(payload));
            //}

            state.normalizedRulesets.entities.rulesets = { 
                ...state.normalizedRulesets.entities.rulesets, [payload.id]: payload
            };

            // console.log("Updated ruleset");
            // console.log(state.normalizedRulesets.entities);
            //console.log(out);

            /*if (!state.backupNormalizedRulesets.entities.rulesets[payload.id]
                || !_.isEqual(state.backupNormalizedRulesets.entities.rulesets[payload.id], payload)) {
                state.changed = true;
            }*/
        },

        [Mutations.updateSetRules](
            state: Me.State, payload: NormalizedRulesets.NormalizedSetRulesForVoter,
        ) {
            //if (state.normalizedRulesets.entities.setRules[payload.id]) {
            //    state.normalizedRulesets.entities.setRules[payload.id] = payload;
            //}
            //else {
            //    Vue.set(state.normalizedRulesets.entities.setRules, payload.id, _.cloneDeep(payload));
            //}

            state.normalizedRulesets.entities.setRules = { 
                ...state.normalizedRulesets.entities.setRules, [payload.id]: payload
            };

            // console.log("Updated setRules");
            // console.log(state.normalizedRulesets.entities);

            /*if (!state.backupNormalizedRulesets.entities.setRules[payload.id]
                || !_.isEqual(state.backupNormalizedRulesets.entities.setRules[payload.id], payload)) {
                state.changed = true;
            }*/
        },

        /*[Mutations.updateModifiedSetRulesArray](
            state: Me.State, payload: { modifiedSetRulesIds: string [] },
        ) {
            console.log("Modofieds="+JSON.stringify(payload));
            state.modifiedSetRules = payload.modifiedSetRulesIds;
        },*/

        [Mutations.updateEdit](
            state: Me.State, payload: { rulesetId: string; backup?: NormalizedRulesets.NormalizedRuleset; modified: boolean; }
        ) {
            state.edit = _.merge({}, state.edit, payload);
        },

        [Mutations.updatePublishStatus](
            state: Me.State, payload: { loading: boolean; error: string; result: string; for: string; }
        ) {
            state.publish = _.merge({}, state.publish, payload);;
        },
    };


    /**
     * Actions
     */
    class PrivateActions {
        //public static determineChanges =  Me.localName("determineChanges");
        public static checkIfModified =  Me.localName("checkIfModified");
    }

    const normalizer = new NormalizedRulesets();
    // const delayedOperationsTBPUpdater = new DelayedExecutor(1100);

    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.setVoterAndOrDelegator]: (
            { commit, dispatch, state }, payload: { delegator?: string; voter?: string; },
        ): void => {
            (async () => {
                try {
                    // console.log("In module payload=" + JSON.stringify(payload) + ", payload.delegator=" + payload.delegator);
                    if (typeof payload.delegator === "undefined" && typeof payload.voter === "undefined") {
                        // console.log("Both type to undefined, issue error!");
                        throw new Error("You have to specify the voter, the delegator, or both");
                    }
                    
                    const loadFor = payload.delegator + "_" + payload.voter;
                    if (state.loadedFor !== loadFor) {
                        dispatch(Me.Actions.reloadRulesets, { voter: payload.voter, delegator: payload.delegator });
                    }
                }
                catch (error) {
                    commit(Mutations.setStatus, { loading: false, error: error + "" });
                }
            })();
        },

        [Me.Actions.reloadRulesets]: (
            { commit, dispatch, state }, payload: { delegator?: string; voter?: string; },
        ): void => {
            (async () => {
                try {
                    const loadFor = payload.delegator + "_" + payload.voter;
                    commit(Mutations.setStatus, 
                        { loading: true, delegator: payload.delegator, voter: payload.voter, loadedFor: loadFor }
                    );

                    const result: EffectuatedSetRules [] = await RulesetsModuleApiHelper
                        .loadRulesets({ delegator: payload.delegator, voter: payload.voter });

                    const normalized: NormalizedRulesets.Result = normalizer.normalize(result);
                    commit(Mutations.setNormalizedRulesets, normalized);
                    commit(Mutations.setStatus, { loading: false, error: "" });
                    commit(Mutations.updateEdit, { rulesetId: "", modified: false });
                }
                catch (error) {
                    commit(Mutations.setStatus, { loading: false, error: error });
                }
            })();
        },

        [Me.Actions.updateRule]: (
            { commit, dispatch, state }, payload: NormalizedRulesets.NormalizedRule,
        ): void => {
            commit(Mutations.updateRule, payload);
            if (!_.isEqual(payload.rule, state.normalizedRulesets.entities.rules[payload.id])) {
                dispatch(PrivateActions.checkIfModified);
            }
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
            dispatch(PrivateActions.checkIfModified);
        },

        [Me.Actions.addRuleToRuleset]: (
            { commit, dispatch, state }, payload: { rulesetId: NormalizedRulesets.ID, rule: NormalizedRulesets.NormalizedRule },
        ): void => {
            commit(Mutations.updateRule, payload.rule);

            const newRuleset: NormalizedRulesets.NormalizedRuleset
                = _.cloneDeep(state.normalizedRulesets.entities.rulesets[payload.rulesetId]);
            newRuleset.rules.push(payload.rule.id);
            commit(Mutations.updateRuleset, newRuleset);
            dispatch(PrivateActions.checkIfModified);
        },

        [Me.Actions.addRulesetToSetRules]: (
            { commit, dispatch, state }, payload: { ruleset: NormalizedRulesets.NormalizedRuleset, setRulesId?: string, voter?: string },
        ): void => {
            if (payload.ruleset.rules.length === 0) {
                const rule = {
                    id: uniqueId(),
                    rule: "first_post"
                };
                commit(Mutations.updateRule, rule);
                payload.ruleset.rules = [ rule.id ];
            }
            commit(Mutations.updateRuleset, payload.ruleset);

            let targetSetRules: NormalizedRulesets.NormalizedSetRulesForVoter | undefined = undefined;
            if (payload.voter) {
                const targetSetRulesOpt = _.values(state.normalizedRulesets.entities.setRules).filter(
                    (setRules: NormalizedRulesets.NormalizedSetRulesForVoter) => setRules.voter === payload.voter
                );
                if (targetSetRulesOpt.length > 0) targetSetRules = _.cloneDeep(targetSetRulesOpt[0]);
            }
            else if(payload.setRulesId) {
                targetSetRules = _.cloneDeep(state.normalizedRulesets.entities.setRules[payload.setRulesId]);
            }


            if (targetSetRules) {
                targetSetRules.rulesets.push(payload.ruleset.id);
                commit(Mutations.updateSetRules, targetSetRules);
            }
            else {
                if (!state.delegator) throw new Error("State.delegator is not specified");
                targetSetRules = {
                    id: normalizer.getIdForSetRules(),
                    voter: d(payload.voter),
                    delegator: state.delegator,
                    rulesets: [ payload.ruleset.id ]
                };
                commit(Mutations.updateSetRules, targetSetRules);
            }
            dispatch(PrivateActions.checkIfModified);
            dispatch(Me.Actions.beginRulesetEdit, { rulesetId: d(payload.ruleset.id) });
        },

        /*[Me.Actions.deleteRuleset]: (
            { commit, dispatch, state }, payload: { setRulesId: NormalizedRulesets.ID, rulesetId: NormalizedRulesets.ID },
        ): void => {
            _.unset(state.normalizedRulesets.entities.rulesets, payload.rulesetId);

            const newSetRules: NormalizedRulesets.NormalizedSetRulesForVoter
                = _.cloneDeep(state.normalizedRulesets.entities.setRules[payload.setRulesId]);
            const rulesetIndex = newSetRules.rulesets.indexOf(payload.rulesetId);
            if (rulesetIndex < 0) {
                throw new Error("Ruleset with id " + payload.rulesetId + " does not belong to set rules with id " + payload.setRulesId);
            }
            newSetRules.rulesets.splice(rulesetIndex, 1);
             
            commit(Mutations.updateSetRules, newSetRules);
            dispatch(PrivateActions.determineChanges);
        },*/

        [Me.Actions.renameRuleset]: async (
            { commit, dispatch, state }, payload: { rulesetId: NormalizedRulesets.ID, name: string },
        ): Promise<void> => {            
            const newRuleset: NormalizedRulesets.NormalizedRuleset
                = _.cloneDeep(state.normalizedRulesets.entities.rulesets[payload.rulesetId]);
            const oldName = d(newRuleset.name);
            newRuleset.name = d(payload.name);
            commit(Mutations.updateRuleset, newRuleset);
            if (payload.name !== oldName) dispatch(PrivateActions.checkIfModified);
        },

        /*[Me.Actions.changeRulesetVoter]: (
            { commit, dispatch, state }, payload: { setRulesId: string, rulesetId: NormalizedRulesets.ID, voter: string; },
        ): void => {
            if (state.normalizedRulesets.entities.setRules[payload.setRulesId].voter === payload.voter) return;


            const oldSetRules = _.cloneDeep(state.normalizedRulesets.entities.setRules[payload.setRulesId]);
            const rulesetIndex = oldSetRules.rulesets.indexOf(payload.rulesetId);
            if (rulesetIndex >= 0) oldSetRules.rulesets.splice(rulesetIndex, 1);
            else throw new Error("Cannot find ruleset with id " + payload.rulesetId + " in setRules with id " + payload.setRulesId);
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
                    delegator: oldSetRules.delegator,
                    rulesets: [ payload.rulesetId ]
                };
                commit(Mutations.updateSetRules, targetSetRules);
            }
            dispatch(PrivateActions.determineChanges);
        },*/

        /*[PrivateActions.determineChanges]: (
            { commit, dispatch, state, rootState },
        ): void => {
            (async () => {
                try {
                    const modifiedSetRulesIds: string [] = 
                        _.values(state.normalizedRulesets.entities.setRules).filter(setRules => {
                            const backupSetRules = state.backupNormalizedRulesets.entities.setRules[setRules.id];
                            return (
                                !backupSetRules
                                || _.xor(setRules.rulesets, backupSetRules.rulesets).length > 0
                                || setRules.rulesets.filter(rulesetId => {
                                    const ruleset = state.normalizedRulesets.entities.rulesets[rulesetId];
                                    const backupRuleset = state.backupNormalizedRulesets.entities.rulesets[rulesetId];
                                    return !backupRuleset
                                        || !_.isEqual(_.omit(ruleset, "id", "rules"), _.omit(backupRuleset, "id", "rules"))
                                        || _.xor(ruleset.rules, backupRuleset.rules).length > 0
                                        || ruleset.rules.filter(ruleId => {
                                            const rule = state.normalizedRulesets.entities.rules[ruleId];
                                            const backupRule = state.backupNormalizedRulesets.entities.rules[ruleId];
                                            return !backupRule
                                                || !_.isEqual(_.omit(rule, "id"), _.omit(backupRule, "id"));
                                        }).length > 0
                                }).length > 0
                            );
                        })
                        .map(setRules => setRules.id);
                    commit(Mutations.updateModifiedSetRulesArray, { modifiedSetRulesIds: modifiedSetRulesIds });
                    
                    /*delayedOperationsTBPUpdater.execute(async () => {
                        try {
                            const protocol = Wise.constructDefaultProtocol();
                            const delegator = d((rootState as any).user.username);
                            const opsForAll: { [ setRulesId: string ]: { ops: steem.OperationWithDescriptor []; error: string; }} = {};

                            const denormalizedSRFV: SetRulesForVoter [] = normalizer.denormalizeSetRules(
                                modifiedSetRulesIds, state.normalizedRulesets
                            );
                            denormalizedSRFV.forEach((srfv, index) => {
                                try {
                                    const opsForVoter = RulesUpdater.getUploadRulesetsForVoterOps(
                                        protocol, delegator, srfv.voter, srfv.rulesets
                                    );
                                    opsForAll[modifiedSetRulesIds[index]] = { ops: opsForVoter, error: "" };
                                }
                                catch(error) {
                                    opsForAll[modifiedSetRulesIds[index]] = { ops: [], error: error + "" };
                                }
                            });
                            commit(Mutations.updateOperationsToBePublished, { loading: false, error: "", operations: opsForAll });
                        }
                        catch(error) {
                            console.error(error);
                            commit(Mutations.updateOperationsToBePublished, { loading: false, error: error + "", operations: {} });
                        }
                    });* /
                }
                catch(error) {
                    console.error(error);
                }
            })();
        },*/

        [PrivateActions.checkIfModified]: (
            { commit, dispatch, state, rootState },
        ): void => {
            // if (state.edit.rulesetId.length === 0) return commit(Mutations.updateEdit, { modified: false });
            // if (!state.edit.backup) return commit(Mutations.updateEdit, { modified: true });

            /*const rulesetId = state.edit.rulesetId;
            // const ruleset = state.normalizedRulesets.entities.rulesets[rulesetId];
            const backupRuleset = state.edit.backup;
            const denormalizedRuleset = d(normalizer.denormalizeRulesets([ rulesetId ], state.normalizedRulesets)[0]);
            const modified = !_.isEqual(backupRuleset, denormalizedRuleset);*/
            const modified = !_.isEqual(state.normalizedRulesets, state.backupNormalizedRulesets);
            console.log("MODIFIED=" + modified);
            commit(Mutations.updateEdit, { modified: modified });
        },

        [Me.Actions.beginRulesetEdit]: (
            { commit, dispatch, state, rootState }, payload: { rulesetId: NormalizedRulesets.ID },
        ): void => {
            if (state.edit.rulesetId.length > 0) throw new Error("Already editing " + state.edit.rulesetId);
            commit(Mutations.updateEdit, { modified: false, rulesetId: payload.rulesetId });
        },

        [Me.Actions.revertChanges]: (
            { commit, dispatch, state, rootState }
        ): void => {
            if (state.edit.rulesetId.length === 0) throw new Error("Not in edit mode");
            commit(Mutations.resetChanges);
            commit(Mutations.updateEdit, { modified: false, rulesetId: "" });
            dispatch(PrivateActions.checkIfModified);
        },

        [Me.Actions.saveChanges]: (
            { commit, dispatch, state, rootState }, payload: { for: string }
        ): void => {
            commit(Mutations.updatePublishStatus, { loading: true, error: "", result : "", for: d(payload.for) });
            (async () => {
                try {
                    if (state.edit.rulesetId.length === 0) throw new Error("Not in edit mode");

                    const rulesetId = state.edit.rulesetId;
                    const setRulesId = d(_.values(state.normalizedRulesets.entities.setRules)
                    .filter((sr: NormalizedRulesets.NormalizedSetRulesForVoter) => sr.rulesets.indexOf(rulesetId) !== -1)[0].id);

                    const denormalizedSRFV: SetRulesForVoter [] = normalizer.denormalizeSetRules(
                        [ setRulesId ], state.normalizedRulesets
                    );
                    if (denormalizedSRFV.length !== 1) throw new Error("Incorrect number of elements returned after denormalization");
                    const srfv = denormalizedSRFV[0];
                    const result = await RulesetsModuleApiHelper.saveSetRules(srfv);
                    commit(Mutations.updatePublishStatus, { 
                        loading: false, error: "",
                        result : "Rulesets successfully published, transaction: " + result.id + " in block " + result.block_num
                    });
                    commit(Mutations.updateEdit, { modified: false, rulesetId: "" });
                    commit(Mutations.commitChangesToBackupRulesets);
                }
                catch(error) {
                    commit(Mutations.updatePublishStatus, { loading: false, error: error + "", result : "", for: d(payload.for) })
                    console.error(error);
                }
            })();
        },

        [Me.Actions.deleteRuleset]: (
            { commit, dispatch, state, rootState }, payload: { rulesetId: string }
        ): void => {
            commit(Mutations.updatePublishStatus, { loading: true, error: "", result : "", for: "delete" });
            (async () => {
                try {
                    if (state.edit.rulesetId.length > 0) throw new Error("Cannot delete in edit mode");
                    const rulesetId = d(payload.rulesetId);
                    const setRulesId = d(_.values(state.normalizedRulesets.entities.setRules)
                    .filter((sr: NormalizedRulesets.NormalizedSetRulesForVoter) => sr.rulesets.indexOf(rulesetId) !== -1)[0].id);
                    const newSetRules: NormalizedRulesets.NormalizedSetRulesForVoter
                        = _.cloneDeep(state.normalizedRulesets.entities.setRules[setRulesId]);

                    const rulesetIndex = newSetRules.rulesets.indexOf(payload.rulesetId);
                    if (rulesetIndex < 0) {
                        throw new Error("Ruleset with id " + payload.rulesetId + " does not belong to set rules with id " + setRulesId);
                    }
                    newSetRules.rulesets.splice(rulesetIndex, 1);
                    commit(Mutations.updateSetRules, newSetRules);

                    const denormalizedSRFV: SetRulesForVoter [] = normalizer.denormalizeSetRules(
                        [ setRulesId ], state.normalizedRulesets
                    );
                    if (denormalizedSRFV.length !== 1) throw new Error("Incorrect number of elements returned after denormalization");
                    const srfv = denormalizedSRFV[0];
                    const result = await RulesetsModuleApiHelper.saveSetRules(srfv);
                    commit(Mutations.updatePublishStatus, { 
                        loading: false, error: "",
                        result : "SetRules for @" + srfv.voter + " successfully published, transaction: " + result.id + " in block " + result.block_num
                    });
                    commit(Mutations.updateEdit, { modified: false, rulesetId: "" });
                    commit(Mutations.commitChangesToBackupRulesets);
                }
                catch(error) {
                    commit(Mutations.updatePublishStatus, { loading: false, error: error + "", result : "", for: "delete" })
                    console.error(error);
                }
            })();
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
