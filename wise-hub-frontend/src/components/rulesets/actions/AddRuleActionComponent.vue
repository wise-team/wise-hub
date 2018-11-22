<!-- src/components/rulesets/actions/AddRulesetActionComponent.vue -->
<template>
    <div>
        <b-dropdown :id="'add-rule-dropdown-' + unique" text="Add rule" class="m-2"
            variant="outline-secondary"
        >
            <b-dropdown-item-button
                v-for="rule in rules" :key="rule.name"
                @click="addRule(rule.defaultRule)"
            >
                <span :style="'color: ' + rule.color + ';'">
                    <font-awesome-icon :icon="rule.icon" />
                    {{ rule.name | ucfirst }}
                </span>
            </b-dropdown-item-button>
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import * as _ from "lodash";
import { s } from "../../../store/store";
import { d, ucfirst, uniqueId } from "../../../util/util";
import { RulesetsModule } from "../../../store/modules/rulesets/RulesetsModule";
import { AuthModuleApiHelper } from "../../../store/modules/auth/AuthModuleApiHelper";
import { NormalizedRulesets } from "../../../store/modules/rulesets/NormalizedRulesets";
import { Rule } from "steem-wise-core";
import * as rules_ from "../rules.const";


export default Vue.extend({
    props: [ "rulesetId" ],
    data() {
        return {
            unique: uniqueId()
        };
    },
    methods: {
        addRule(ruleTemplate: Rule) {
            const rule: any = _.cloneDeep(ruleTemplate);
            rule.id = "rule-" + uniqueId();
            s(this.$store).dispatch(
                RulesetsModule.Actions.addRuleToRuleset,
                {
                    rulesetId: d(this.rulesetId), 
                    rule: rule
                }
            );
        },
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
        rules(): any [] {
            const types = _.values(Rule.Type);
            const mappedRules = types
                .filter((type: string) => type !== "custom_rpc")
                .map((type: string) => {
                    const icon = icons.rule[type] || icons.unknownRule;
                    const name = d(rules_.names[type]);
                    const color = d(rules_.colors[type]);
                    const defaultRule = d(rules_.defaultRules[type]);
                    const r = { name: name, icon: icon, color: color, defaultRule: defaultRule };
                    return r;
                });
            return mappedRules;
        }
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>

</style>
