<!-- src/components/views/rulesets/HorizontalRuleComponent.vue -->
<template>
    <div class="horizontal-rule-component">
        <span :style="'color: ' + ruleColor + ';'">
            <font-awesome-icon :icon="ruleIcon" />
            {{ rule.rule }}
        </span>
        <unknown-rule-component :ruleId="ruleId" :enabled="edit"  />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { Rule } from "steem-wise-core";

const colors = {
    [Rule.Type.AgeOfPost]: "#007bff",
    [Rule.Type.Authors]: "#28a745",
    [Rule.Type.CustomRPC]: "#17a2b8",
    [Rule.Type.ExpirationDate]: "#dc3545",
    [Rule.Type.FirstPost]: "#ffc107",
    [Rule.Type.Payout]: "#28a745",
    [Rule.Type.Tags]: "#dc3545",
    [Rule.Type.Voters]: "#ffc107",
    [Rule.Type.VotesCount]: "#dc3545",
    [Rule.Type.VotingPower]: "#dc3545",
    [Rule.Type.Weight]: "#007bff",
    [Rule.Type.WeightForPeriod]: "#ffc107"
} as { [x: string]: any; };

const editors = {

};

import UnknownRuleComponent from "./rules/UnknownRuleComponent.vue";
import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";

export default Vue.extend({
    props: [ "ruleId", "edit" ],
    data() {
        return {
            
        };
    },
    methods: { 
    },
    computed: {
        rule(): NormalizedRulesets.NormalizedRule {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rules[this.ruleId];
        },
        ruleIcon(): any {
            const ruleType: string = this.rule.rule;
            return icons.rule[ruleType] || icons.unknownRule;
        },
        ruleColor(): string {
            const ruleType: string = this.rule.rule;
            return colors[ruleType] || "black";
        },
    },
    components: {
        UnknownRuleComponent
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
    }
});
</script>

<style>
</style>
