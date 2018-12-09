import { EffectuatedSetRules, Ruleset, Rule, SetRules, SetRulesForVoter } from "steem-wise-core";
import * as normalizr from "normalizr";
import * as _ from "lodash";

export class NormalizedRulesets {
    private idIncrementer: { n: number } = { n: 0 };
    private setRulesArraySchema: normalizr.Schema;
    private rulesetSchema: normalizr.Schema;

    public constructor() {
        const giveId = (idPrepender: string) => (entity: any) => { if (!entity.id) entity.id = idPrepender + (this.idIncrementer.n++); return entity; };

        const ruleSchema = new normalizr.schema.Entity(
            "rules", {}, { processStrategy: giveId("rule") }
        );
        this.rulesetSchema = new normalizr.schema.Entity(
            "rulesets", { rules: [ ruleSchema ] }, { processStrategy: giveId("ruleset") }
        );
        const setRulesSchema = new normalizr.schema.Entity(
            "setRules", { rulesets: [ this.rulesetSchema ] }, { processStrategy: giveId("setRules") }
        );
        this.setRulesArraySchema = new normalizr.schema.Array(setRulesSchema);
    }

    public normalize(setRArray: SetRules []): NormalizedRulesets.Result  {
        const clonedSetRArray = _.cloneDeep(setRArray); // normalizr changes input data in very not elegant way
        const normalizedData = normalizr.normalize(clonedSetRArray, this.setRulesArraySchema);

        return _.merge(
            {},
            { entities: { rules: {}, rulesets: {}, setRules: {} }, result: [] },
            normalizedData
        );
    }

    public denormalizeSetRules(setRulesIds: string [], normalized: NormalizedRulesets.Result): SetRulesForVoter [] {
        const denormalized = normalizr.denormalize(
            _.cloneDeep(setRulesIds), this.setRulesArraySchema, _.cloneDeep(normalized.entities)
        );

        const denormalizedNoNulls = denormalized.filter((elem: any) => !!elem);

        const clonedDenormalized: EffectuatedSetRules [] = _.cloneDeep(denormalizedNoNulls);
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

    public denormalizeRulesets(rulesetIds: string [], normalized: NormalizedRulesets.Result): Ruleset [] {
        const denormalized = normalizr.denormalize(
            _.cloneDeep(rulesetIds), new normalizr.schema.Array(this.rulesetSchema), _.cloneDeep(normalized.entities)
        );

        const denormalizedNoNulls = denormalized.filter((elem: any) => !!elem);

        const clonedDenormalized: Ruleset [] = _.cloneDeep(denormalizedNoNulls);
        return clonedDenormalized.map((ruleset: Ruleset) => {
            ruleset = _.omit(ruleset, "id");
            ruleset.rules = ruleset.rules.map(rule => _.omit(rule, "id"));
            return ruleset;
        });
    }

    public genIdForRule(): string { return "rule" + (this.idIncrementer.n++) };
    public genIdForRuleset(): string { return "ruleset" + (this.idIncrementer.n++) };
    public getIdForSetRules(): string { return "setRules" + (this.idIncrementer.n++) };
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
        delegator: string;
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