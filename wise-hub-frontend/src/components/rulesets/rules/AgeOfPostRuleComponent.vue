<!-- src/components/views/rulesets/rules/age_of_postRuleComponent.vue -->
<template>
    <div class="age_of_post-rule-component">
        <b-input-group>
            <b-input-group-prepend>
                <b-form-select v-model="mode" :options="modes" :disabled="!enabled" class="age_of_post-mode-select" />
            </b-input-group-prepend>
            <b-form-input type="number" class="t-ageofpostrule-input" :disabled="!enabled" min="0" step="1" v-model="value"></b-form-input>
            <b-input-group-append>
                <b-form-select v-model="unit" :options="units" :disabled="!enabled" class="age_of_post-mode-select" />
            </b-input-group-append>
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
import { AgeOfPostRule } from "steem-wise-core";

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
        value: {
            get(): string { return this.rule.value + ""; },
            set(valueStr: string): void {
                const value: number = parseInt(valueStr);
                this.saveRule(_.set(_.cloneDeep(this.rule), "value", value));
            }
        },
        unit: {
            get(): string { return this.rule.unit; },
            set(unit: string): void {
                this.saveRule(_.set(_.cloneDeep(this.rule), "unit", unit));
            }
        },
        units() {
            return _.values(AgeOfPostRule.TimeUnit);
        },
        mode: {
            get(): string { return this.rule.mode; },
            set(mode: string): void {
                this.saveRule(_.set(_.cloneDeep(this.rule), "mode", mode));
            }
        },
        modes() {
            return _.values(AgeOfPostRule.Mode);
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

.age_of_post-mode-select {
    max-width: 6rem;
}
</style>
