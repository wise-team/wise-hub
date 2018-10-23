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
        changed: boolean;
        backupNormalizedRulesets: NormalizedRulesets.Result;
        normalizedRulesets: NormalizedRulesets.Result;
    }

    export class Actions {
        public static loadIfNeeded = localName("loadIfNeeded");

        public static createNewRule = localName("addNewRuleToRuleset");
        public static updateRule = localName("updateRule");
        public static deleteRule = localName("deleteRuleFromRuleset");

        public static createNewRuleset = localName("createNewRuleset");
        public static renameRuleset = localName("renameRuleset");
        public static changeRulesetVoter = localName("changeRulesetVoter");
        public static deleteRuleset = localName("deleteRuleset");
    }
}