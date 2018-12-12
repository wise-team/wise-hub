import { EffectuatedSetRules, Ruleset, Rule, SetRules, SetRulesForVoter } from "steem-wise-core";
import * as normalizr from "normalizr";
import * as _ from "lodash";
import ow from "ow";
import { nestValidate } from "../../../util/util";
import { IsEmail, IsNotEmpty, IsUrl, MaxLength, validateSync } from "class-validator";

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

    export namespace NormalizedRule {
        export function validate(rule: NormalizedRule) {
            ow(rule.id, ow.string.nonEmpty.label(".id"));
            ow(rule, ow.object.label(".").is(rule => Rule.isRule(rule) || `${rule} is not a valid rule`));
        }
    }


    export interface NormalizedRuleset {
        id: ID;
        name: string;
        rules: ID [];
    }

    export namespace NormalizedRuleset {
        export function validate(ruleset: NormalizedRuleset) {
            ow(ruleset.id, ow.string.nonEmpty.label(".id"));
            ow(ruleset.name, ow.string.label(".name"));
            ow(ruleset.rules, ow.array.label(".rules").ofType(ow.string.nonEmpty));
        }
    }


    export interface NormalizedSetRulesForVoter {
        id: ID;
        voter: string;
        delegator: string;
        rulesets: ID [];
    }

    export namespace NormalizedSetRulesForVoter {
        export function validate(srfv: NormalizedSetRulesForVoter) {
            ow(srfv.id, ow.string.nonEmpty.label(".id"));
            ow(srfv.voter, ow.string.label(".voter"));
            ow(srfv.delegator, ow.string.label(".delegator"));
            ow(srfv.rulesets, ow.array.label(".rulesets").ofType(ow.string.nonEmpty));
        }
    }


    export interface Result {
        result: ID [];
        entities: {
            rules: { [key: string]: NormalizedRule },
            rulesets: { [key: string]: NormalizedRuleset },
            setRules: { [key: string]: NormalizedSetRulesForVoter },
        };
    }

    export namespace Result {
        export function validate(result: Result) {
            ow(result.result, ow.array.label(".result").ofType(
                ow.string.nonEmpty.is(srfvId => !!result.entities.setRules[srfvId] || `SetRules#${srfvId} is not in the store`)
            ));
            
            ow(result.entities, ow.object.label(".entities").hasKeys("rules", "rulesets", "setRules"));
            ow(result.entities.rules, ow.object.label(".entities.rules")
                .valuesOfType(ow.object.is(rule => nestValidate(() => NormalizedRule.validate(rule as NormalizedRule)))));

            ow(result.entities.rulesets, ow.object.label(".entities.rulesets")
                .valuesOfType(ow.object
                    .is(ruleset => nestValidate(() => NormalizedRuleset.validate(ruleset as NormalizedRuleset)))
                    .is(ruleset => (ruleset as NormalizedRuleset).rules
                        .filter(ruleId => !result.entities.rules[ruleId]).length == 0 || `Not all rules of ruleset ${ruleset} are in the store`)
                ));
            

            ow(result.entities.setRules, ow.object.label(".entities.setRules")
                .valuesOfType(ow.object
                    .is(srfv => nestValidate(() => NormalizedSetRulesForVoter.validate(srfv as NormalizedSetRulesForVoter)))
                    .is(srfv => (srfv as NormalizedSetRulesForVoter).rulesets
                        .filter(rulesetId => !result.entities.rulesets[rulesetId]).length == 0 || `Not all rulesets of setRules #${(srfv as any).id} are in the store`)
                ));
        }
    }
}