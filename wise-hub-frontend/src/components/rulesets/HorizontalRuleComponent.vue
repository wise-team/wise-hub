<!-- src/components/views/rulesets/HorizontalRuleComponent.vue -->
<template>
    <div class="horizontal-rule-component">
        <span :style="'color: ' + ruleColor + ';'" class="d-flex w-100 justify-content-between">
            <span>
                <font-awesome-icon :icon="ruleIcon" />
                {{ rule.rule }}
            </span>
            <small class="delete-btn" @click="deleteRule()">
                <font-awesome-icon :icon="deleteIcon" /> delete
            </small>
        </span>
        <unknown-rule-component :ruleId="ruleId" :enabled="edit"  />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst, uniqueId } from "../../util/util";
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
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";

export default Vue.extend({
    props: [ "rulesetId", "ruleId", "edit" ],
    data() {
        return {
            
        };
    },
    methods: {
        deleteRule() {
            s(this.$store).dispatch(RulesetsModule.Actions.deleteRule, { rulesetId: this.rulesetId, ruleId: this.ruleId });
        }
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
        deleteIcon() { return icons.delete },
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
.horizontal-rule-component .delete-btn {
    color: #bb5555;
    text-decoration: none;
    cursor: pointer;
}

</style>
