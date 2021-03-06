<!-- src/components/views/rulesets/rules/WeightRuleComponent.vue -->
<template>
    <div class="weight-rule-component">
        <b-input-group prepend="Minimal weight" append="%" class="mb-1">
            <b-form-input type="number" :disabled="!enabled" min="-100" max="100" step="0.1" v-model="min" class="t-rule-weight-min-input"></b-form-input>
        </b-input-group>
        <b-input-group prepend="Maximal weight" append="%">
            <b-form-input type="number" :disabled="!enabled" min="-100" max="100" step="0.1" v-model="max" class="t-rule-weight-max-input"></b-form-input>
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
import { WeightRule } from "steem-wise-core";

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
        min: {
            get(): string { return (this.rule.min / 100) + ""; },
            set(minStr: string): void {
                const min: number = Math.round(parseFloat(minStr) * 100);
                this.saveRule(_.set(_.cloneDeep(this.rule), "min", min));
            }
        },
        max: {
            get(): string { return (this.rule.max / 100) + ""; },
            set(maxStr: string): void {
                const max: number = Math.round(parseFloat(maxStr) * 100);
                this.saveRule(_.set(_.cloneDeep(this.rule), "max", max));
            }
        },
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

.weight-mode-select {
    max-width: 6rem;
}
</style>
