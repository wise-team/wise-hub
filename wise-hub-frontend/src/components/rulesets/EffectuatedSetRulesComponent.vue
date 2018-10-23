<!-- src/components/views/rulesets/EffectuatedRetRulesComponent.vue -->
<template>
    <div v-if="!setRulesValid">
        <b-alert show variant="warning">
            EffectuatedSetRules element has invalid structure
            <hr />
            <pre>{{ setRules | json }}</pre>
        </b-alert>
    </div>
    <div v-else class="mb-5 effectuatedsetrulescomponent">
        <h4 class="p-2 pt-3 mb-3 mt-3 rounded esrc-title">
            <span class="esrc-wise-icon">
                <img src="/assets/images/wise/full-color-emblem.svg" alt="Wise icon" />
            </span>

            <font-awesome-icon :icon="delegatorIcon" /> {{ setRules.delegator }}
             &nbsp;&nbsp;&#8594;&nbsp;&nbsp;
             <font-awesome-icon :icon="voterIcon" /> {{ setRules.voter }}
        </h4>
            
        <ruleset-component
            v-for="rulesetId in setRules.rulesets" :key="rulesetId"
            :rulesetId="rulesetId"
            class="ml-2 mb-4"
        />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { EffectuatedSetRules } from "steem-wise-core";

import RulesetComponent from "./RulesetComponent.vue";
import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";

export default Vue.extend({
    props: [ "setRulesId" ],
    data() {
        return {
            
        };
    },
    methods: {
    },
    computed: {
        setRulesValid(): boolean {
            return typeof this.setRules.voter !== "undefined"
                && Array.isArray(this.setRules.rulesets)
        },
        setRules(): NormalizedRulesets.NormalizedSetRulesForVoter {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.setRules[this.setRulesId];
        },
        delegatorIcon() { return icons.delegator },
        voterIcon() { return icons.voter },
    },
    components: {
        RulesetComponent
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
    }
});
</script>

<style>
.effectuatedsetrulescomponent .esrc-title {
    color: #6b11ff;
}

.effectuatedsetrulescomponent .esrc-wise-icon {
    position: relative;
}

.effectuatedsetrulescomponent .esrc-wise-icon img {
    position: absolute;
    height: 4rem;
    left: -4.75rem;
    top: -1rem;
}

</style>
