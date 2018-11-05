import * as steem from "steem";
import { EffectuatedSetRules, Ruleset, Rule } from "steem-wise-core";
import { NormalizedRulesets } from "./NormalizedRulesets";

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
            backup?: Ruleset;
            modified: boolean;
        };
        publish: { 
            loading: boolean;
            error: string;
            result: string;
        }
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
        // public static deleteRuleset = localName("deleteRuleset");

        public static saveChanges = localName("saveChanges");
        public static revertChanges = localName("revertChanges");
        public static beginRulesetEdit = localName("beginRulesetEdit");
    }

    export class Getters {
        public static isSetRulesModified = localName("isSetRulesModified");
    }
}