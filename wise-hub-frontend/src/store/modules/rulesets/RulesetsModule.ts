import * as steem from "steem";
import { EffectuatedSetRules, Ruleset, Rule } from "steem-wise-core";
import { nestValidate } from "../../../util/util";
import { NormalizedRulesets } from "./NormalizedRulesets";
import ow from "ow";

export namespace RulesetsModule {
    export const modulePathName = "rulesets";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export interface State {
        loading: boolean;
        error: string | "";
        loadedFor: string;
        delegator?: string;
        voter?: string;
        backupNormalizedRulesets: NormalizedRulesets.Result;
        normalizedRulesets: NormalizedRulesets.Result;
        edit: {
            rulesetId: string;
            backup?: NormalizedRulesets.NormalizedRuleset;
            modified: boolean;
        };
        publish: { 
            loading: boolean;
            error: string;
            result: string;
            for: string;
        }
    }
    export function validateState(state: State) {
        ow(state.loading, ow.boolean.label("state.loading"));
        ow(state.error, ow.string.label("state.error"));
        ow(state.loadedFor, ow.string.label("state.loadedFor"));
        ow(state.delegator, ow.any(ow.undefined, ow.string.label("state.delegator")));
        ow(state.voter, ow.any(ow.undefined, ow.string.label("state.voter")));
        
        ow(state.backupNormalizedRulesets, ow.object.label("state.backupNormalizedRulesets"));
        NormalizedRulesets.Result.validate(state.backupNormalizedRulesets);
        ow(state.normalizedRulesets, ow.object.label("state.normalizedRulesets"));
        NormalizedRulesets.Result.validate(state.normalizedRulesets);
        
        ow(state.edit, ow.object.label("state.edit"));
        ow(state.edit.rulesetId, ow.any(ow.string.empty, ow.string.label("state.edit.rulesetId")
            .is(rulesetId => !!state.normalizedRulesets.entities.rulesets[rulesetId] || `Ruleset '${rulesetId}' is not in the store`)));
        ow(state.edit.backup, ow.any(ow.undefined, ow.object.label("state.edit.backup")
            .is(ruleset => nestValidate(() => NormalizedRulesets.NormalizedRuleset.validate(ruleset as NormalizedRulesets.NormalizedRuleset)))));
        ow(state.edit.modified, ow.boolean.label("state.edit.modified"))

        ow(state.publish.loading, ow.boolean.label("state.publish.loading"));
        ow(state.publish.error, ow.string.label("state.publish.error"));
        ow(state.publish.result, ow.string.label("state.publish.result"));
        ow(state.publish.for, ow.string.label("state.publish.for"));
    }

    export class Actions {
        public static reloadRulesets = localName("reloadRulesets");
        public static setVoterAndOrDelegator = localName("setVoterAndOrDelegator");

        public static addRuleToRuleset = localName("addRuleToRuleset");
        public static updateRule = localName("updateRule");
        public static deleteRule = localName("deleteRuleFromRuleset");

        public static addRulesetToSetRules = localName("addRulesetToSetRules");
        public static renameRuleset = localName("renameRuleset");
        // public static changeRulesetVoter = localName("changeRulesetVoter");
        public static deleteRuleset = localName("deleteRuleset");

        public static saveChanges = localName("saveChanges");
        public static revertChanges = localName("revertChanges");
        public static beginRulesetEdit = localName("beginRulesetEdit");
    }

    export class Getters {
        public static isSetRulesModified = localName("isSetRulesModified");
    }
}