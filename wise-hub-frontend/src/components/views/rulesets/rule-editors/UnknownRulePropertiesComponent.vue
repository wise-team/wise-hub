<!-- src/components/views/rulesets/rules/UnknownRulePropertiesComponent.vue -->
<template>
    <div>
        <textarea>
            { rule | json }
        </textarea>
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
