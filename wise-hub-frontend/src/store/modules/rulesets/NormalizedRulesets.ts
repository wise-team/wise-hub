import { EffectuatedSetRules, Ruleset, Rule, SetRules, SetRulesForVoter } from "steem-wise-core";
import * as normalizr from "normalizr";
import * as _ from "lodash";

export class NormalizedRulesets {
    private idIncrementer: { n: number } = { n: 0 };
    private setRulesArraySchema: normalizr.Schema;

    public constructor() {
        const giveId = (idPrepender: string) => (entity: any) => { if (!entity.id) entity.id = idPrepender + (this.idIncrementer.n++); return entity; };

        const ruleSchema = new normalizr.schema.Entity(
            "rules", {}, { processStrategy: giveId("rule") }
        );
        const rulesetSchema = new normalizr.schema.Entity(
            "rulesets", { rules: [ ruleSchema ] }, { processStrategy: giveId("ruleset") }
        );
        const setRulesSchema = new normalizr.schema.Entity(
            "setRules", { rulesets: [ rulesetSchema ] }, { processStrategy: giveId("setRules") }
        );
        this.setRulesArraySchema = new normalizr.schema.Array(setRulesSchema);
    }

    public normalize(setrArray: SetRules []): NormalizedRulesets.Result  {
        const normalizedData = normalizr.normalize(setrArray, this.setRulesArraySchema);
        return normalizedData;
    }

    public denormalizeSetRules(setRulesIds: string [], normalized: NormalizedRulesets.Result): SetRulesForVoter [] {
        const denormalized = normalizr.denormalize(
            setRulesIds, this.setRulesArraySchema, normalized.entities
        );

        const clonedDenormalized: EffectuatedSetRules [] = _.cloneDeep(denormalized);
        return clonedDenormalized.map((esr: EffectuatedSetRules) => {
            const res: SetRulesForVoter = {
                voter: esr.voter,
                rulesets: esr.rulesets.map((ruleset: Ruleset) => {
                    ruleset = _.omit(ruleset, "id");
                    ruleset.rules = ruleset.rules.map(rule => _.omit(rule, "id"));
                    return ruleset;
                })
            };
            return res;
        });
    }

    public genIdForRule(): string { return "rule" + (this.idIncrementer.n++) };
    public genIdForRuleset(): string { return "ruleset" + (this.idIncrementer.n++) };
    public getIdForSetRules(): string { return "rule" + (this.idIncrementer.n++) };
}

export namespace NormalizedRulesets {
    export type ID = string;

    export interface NormalizedRule extends Rule {
        id: ID;
    }

    export interface NormalizedRuleset {
        id: ID;
        name: string;
        rules: ID [];
    }

    export interface NormalizedSetRulesForVoter {
        id: ID;
        voter: string;
        rulesets: ID [];
    }

    export interface Result {
        result: ID [];
        entities: {
            rules: { [key: string]: NormalizedRule },
            rulesets: { [key: string]: NormalizedRuleset },
            setRules: { [key: string]: NormalizedSetRulesForVoter },
        };
    }
}