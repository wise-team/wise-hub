<!-- src/components/views/rulesets/EffectuatedRetRulesComponent.vue -->
<template>
    <div v-if="!setRulesValid">
        <b-alert show variant="warning">
            EffectuatedSetRules element has invalid structure
            <hr />
            <pre>{{ setRules | json }}</pre>
        </b-alert>
    </div>
    <div v-else class="mb-5">
        <h4 class="p-2 mb-3 mt-1 rounded effectuatedsetrulescomponent-title">
            <font-awesome-icon :icon="delegatorIcon" /> {{ setRules.delegator }}
             &nbsp;&nbsp;&#8594;&nbsp;&nbsp;
             <font-awesome-icon :icon="voterIcon" /> {{ setRules.voter }}
        </h4>
            
        <ruleset-component
            v-for="ruleset in setRules.rulesets" :key="ruleset.name + ''"
            :ruleset="ruleset" :effectuatedSetRules="setRules"
            class="ml-2 mb-4"
        />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";
import { EffectuatedSetRules } from "steem-wise-core";

import RulesetComponent from "./RulesetComponent.vue";

export default Vue.extend({
    props: [ "setRules" ],
    data() {
        return {
            
        };
    },
    methods: {
    },
    computed: {
        setRulesValid(): boolean {
            return EffectuatedSetRules.isEffectuatedSetRules(this.setRules);
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
.effectuatedsetrulescomponent-title {
    color: white;
    background-color: #6b11ff;
}
</style>
