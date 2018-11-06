<!-- src/components/views/rulesets/HorizontalRuleComponent.vue -->
<template>
    <div class="horizontal-rule-component">
        <span :style="'color: ' + ruleColor + ';'" class="d-flex w-100 justify-content-between">
            <span>
                <font-awesome-icon :icon="ruleIcon" />
                {{ ruleName | ucfirst }}
            </span>
            <small v-if="edit" class="delete-btn" @click="deleteRule()">
                <font-awesome-icon :icon="deleteIcon" /> delete
            </small>
        </span>

        <authors-rule-component v-if="rule.rule === 'authors'" :ruleId="ruleId" :enabled="edit"  />
        <tags-rule-component v-else-if="rule.rule === 'tags'" :ruleId="ruleId" :enabled="edit"  />
        <voters-rule-component v-else-if="rule.rule === 'voters'" :ruleId="ruleId" :enabled="edit"  />
        <weight-rule-component v-else-if="rule.rule === 'weight'" :ruleId="ruleId" :enabled="edit"  />
        <first-post-rule-component v-else-if="rule.rule === 'first_post'" :ruleId="ruleId" :enabled="edit"  />
        <expiration-date-rule-component v-else-if="rule.rule === 'expiration_date'" :ruleId="ruleId" :enabled="edit"  />
        <voting-power-rule-component v-else-if="rule.rule === 'voting_power'" :ruleId="ruleId" :enabled="edit"  />
        <payout-rule-component v-else-if="rule.rule === 'payout'" :ruleId="ruleId" :enabled="edit"  />
        <votes-count-rule-component v-else-if="rule.rule === 'votes_count'" :ruleId="ruleId" :enabled="edit"  />
        <weight-for-period-rule-component v-else-if="rule.rule === 'weight_for_period'" :ruleId="ruleId" :enabled="edit"  />
        <age-of-post-rule-component v-else-if="rule.rule === 'age_of_post'" :ruleId="ruleId" :enabled="edit"  />
        <unknown-rule-component v-else :ruleId="ruleId" :enabled="edit"  />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst, uniqueId } from "../../util/util";
import { Rule } from "steem-wise-core";
import * as rules from "./rules.const";
import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";

import UnknownRuleComponent from "./rules/UnknownRuleComponent.vue";
import AuthorsRuleComponent from "./rules/AuthorsRuleComponent.vue";
import TagsRuleComponent from "./rules/TagsRuleComponent.vue";
import VotersRuleComponent from "./rules/VotersRuleComponent.vue";
import WeightRuleComponent from "./rules/WeightRuleComponent.vue";
import FirstPostRuleComponent from "./rules/FirstPostRuleComponent.vue";
import ExpirationDateRuleComponent from "./rules/ExpirationDateRuleComponent.vue";
import VotingPowerRuleComponent from "./rules/VotingPowerRuleComponent.vue";
import VotesCountRuleComponent from "./rules/VotesCountRuleComponent.vue";
import PayoutRuleComponent from "./rules/PayoutRuleComponent.vue";
import WeightForPeriodRuleComponent from "./rules/WeightForPeriodRuleComponent.vue";
import AgeOfPostRuleComponent from "./rules/AgeOfPostRuleComponent.vue";


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
            return rules.colors[ruleType] || "black";
        },
        ruleName(): string {
            const ruleType: string = this.rule.rule;
            return rules.names[ruleType] || ruleType;
        },
        deleteIcon() { return icons.delete },
    },
    components: {
        UnknownRuleComponent,
        AuthorsRuleComponent,
        TagsRuleComponent,
        VotersRuleComponent,
        WeightRuleComponent,
        FirstPostRuleComponent,
        ExpirationDateRuleComponent,
        VotingPowerRuleComponent,
        VotesCountRuleComponent,
        PayoutRuleComponent,
        WeightForPeriodRuleComponent,
        AgeOfPostRuleComponent,
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
