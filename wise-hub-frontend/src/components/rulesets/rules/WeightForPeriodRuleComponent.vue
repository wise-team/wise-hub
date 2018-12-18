<!-- src/components/views/rulesets/rules/WeightForPeriodRuleComponent.vue -->
<template>
    <div class="weight_for_period-rule-component">
        <b-input-group append="Unit" class="mb-1">
            <b-input-group-prepend>
                <b-form-select v-model="unit" :options="units" :disabled="!enabled" class="weight_for_period-mode-select" />
            </b-input-group-prepend>
            <b-form-input type="number" :disabled="!enabled" min="0" step="1" v-model="period" class="t-rule-weightforperiod-period-input"></b-form-input>
        </b-input-group>
        <b-input-group prepend="Num of full upvotes">
            <b-form-input type="number" :disabled="!enabled" min="0" step="0.1" v-model="weight" class="t-rule-weightforperiod-weight-input"></b-form-input>
        </b-input-group>
        <small class="text-danger">{{ error }}</small>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";
import { Rule } from "steem-wise-core";
import { NormalizedRulesets } from "../../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../../store/modules/rulesets/RulesetsModule";
import * as _ from "lodash";
import { WeightForPeriodRule } from "steem-wise-core";

export default Vue.extend({
    props: [ "ruleId", "enabled" ],
    data() {
        return {
            error: ""
        };
    },
    methods: {
        saveRule(rule: any) {
            try {
                s(this.$store).dispatch(RulesetsModule.Actions.updateRule, rule);
                this.error = "";
            }
            catch (error) {
                this.error = error + ": " + error.message;
                console.error(error);
            }
        }
    },
    computed: {
        rule(): any {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rules[this.ruleId];
        },
        period: {
            get(): string { return this.rule.period + ""; },
            set(periodStr: string): void {
                const period: number = parseInt(periodStr);
                this.saveRule(_.set(_.cloneDeep(this.rule), "period", period));
            }
        },
        weight: {
            get(): string { return (this.rule.weight / 10000) + ""; },
            set(weightStr: string): void {
                const weight: number = Math.round(parseFloat(weightStr) * 10000);
                this.saveRule(_.set(_.cloneDeep(this.rule), "weight", weight));
            }
        },
        unit: {
            get(): string { return this.rule.unit; },
            set(unit: string): void {
                this.saveRule(_.set(_.cloneDeep(this.rule), "unit", unit));
            }
        },
        units() {
            return _.values(WeightForPeriodRule.PeriodUnit);
        }
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst,
        json: (obj: any) => JSON.stringify(obj),
        omitId: (obj: any) => _.omit(obj, "id")
    }
});
</script>

<style>
.rules-scroller {
    overflow-x: scroll;
}

.rules-scroller-viewport {
    white-space: nowrap;
}

.scroll-indicator {
}

.rule {
    display: inline-block;
}

.weight_for_period-mode-select {
    max-width: 6rem;
}
</style>
