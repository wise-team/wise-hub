<!-- src/components/views/rulesets/rules/VotingPowerRuleComponent.vue -->
<template>
    <div class="voting_power-rule-component">
        <b-input-group prepend="Mode" append="%">
            <b-input-group-prepend>
                <b-form-select v-model="mode" :options="modes" :disabled="!enabled" class="voting_power-mode-select" />
            </b-input-group-prepend>
            <b-form-input type="number" :disabled="!enabled" min="0" max="100" v-model="voting_power"></b-form-input>
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
import { VotingPowerRule } from "steem-wise-core";

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
        voting_power: {
            get(): string { return (this.rule.value / 100) + ""; },
            set(valueStr: string): void {
                const value: number = Math.round(parseFloat(valueStr) * 100);
                this.saveRule(_.set(_.cloneDeep(this.rule), "value", value));
            }
        },
        mode: {
            get(): string { return this.rule.mode; },
            set(mode: string): void {
                this.saveRule(_.set(_.cloneDeep(this.rule), "mode", mode));
            }
        },
        modes() {
            return _.values(VotingPowerRule.Mode);
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

.voting_power-mode-select {
    max-width: 6rem;
}
</style>
