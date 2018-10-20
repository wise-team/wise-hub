<!-- src/components/views/rulesets/HorizontalRuleComponent.vue -->
<template>
    <div class="horizontal-rule-component">
        <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1" :style="'color: ' + ruleColor + ';'">
                    <font-awesome-icon :icon="ruleIcon" />
                </span>
                <span class="input-group-text" id="basic-addon1" :style="'color: ' + ruleColor + ';'">
                    {{ rule.rule }}
                </span>
            </div>
            <input type="text" class="form-control" :placeholder="JSON.stringify(rule)" aria-label="Username" aria-describedby="basic-addon1" disabled>
        </div>
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

const editors = {

};

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
</style>
