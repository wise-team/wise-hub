<!-- src/components/views/rulesets/RulesetComponent.vue -->
<template>
    <div v-if="!isRulesetValid">
        <b-alert show variant="warning">
            <p>Ruleset element has invalid structure</p>
            <hr />
            <pre>{{ ruleset | json }}</pre>
        </b-alert>
    </div>
    <div v-else class="card shadow-sm mb-3">
        <div class="card-header">
            {{ ruleset.name }}
        </div>
        <div class="card-body rules-scroller">
            <div class="rules-scroller-viewport">
                <rule-component
                    v-for="(rule, index) in ruleset.rules" :key="index"
                    :rule="rule"
                    class="mr-3 rule rounded shadow-sm border"
                />
            </div>
        </div>
        <div class="card-footer">
            <small class="text-muted">block no {{ effectuatedSetRules.moment.blockNum }}, trx no {{ effectuatedSetRules.moment.transactionNum }}</small>
            <span class="float-right text-muted scroll-indicator">&#8596;</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";
import { Ruleset } from "steem-wise-core";

import RuleComponent from "./RuleComponent";

export default Vue.extend({
    props: [ "ruleset", "effectuatedSetRules" ],
    data() {
        return {
            
        };
    },
    methods: {
    },
    computed: {
        isRulesetValid(): boolean {
            return Ruleset.isRuleset(this.ruleset);
        },
    },
    components: {
        RuleComponent
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
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
</style>
