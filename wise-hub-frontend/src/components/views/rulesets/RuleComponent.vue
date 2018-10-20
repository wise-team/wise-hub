<!-- src/components/views/rulesets/RuleComponent.vue -->
<template>
    <div class="rule bg-light">
        <div class="rule-icon" :style="'color: ' + ruleColor + ';'">
            <font-awesome-icon :icon="ruleIcon" />
        </div>
        <div class="rule-title" :style="'background-color: ' + ruleColor + ';'">{{ rule.rule }}</div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";
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

export default Vue.extend({
    props: [ "rule" ],
    data() {
        return {
            
        };
    },
    methods: {
    },
    computed: {
        ruleIcon(): any {
            const ruleType: string = this.rule.rule;
            const sIcon: any = icons.rule[ruleType];
            return sIcon || icons.unknownRule;
        },
        ruleColor(): string {
            const ruleType: string = this.rule.rule;
            return colors[ruleType] || "black";
        },
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
    }
});
</script>

<style>
.rule {
    width: 12rem;
    height: 12rem;
    text-align: center;
}

.rule .rule-icon {
    font-size: 4rem;
    margin: 0;
    padding: 0;
    line-height: 1.3;
}

.rule .rule-title {
    font-weight: bold;
    color: white;
}
</style>
