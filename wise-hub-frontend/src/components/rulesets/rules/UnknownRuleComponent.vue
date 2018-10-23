<!-- src/components/views/rulesets/rules/UnknownRuleComponent.vue -->
<template>
    <div class="unknown-rule-component">
        <div class="input-group">
            <input type="text" class="form-control" 
                :disabled="!enabled"
                v-model="ruleJson"
            />
        </div>
        <small class="text-danger">{{ error }}</small>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";
import { Rule } from "steem-wise-core";
import { NormalizedRulesets } from "../../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../../store/modules/rulesets/RulesetsModule";


export default Vue.extend({
    props: [ "ruleId", "enabled" ],
    data() {
        return {
            error: ""
        };
    },
    methods: {
    },
    computed: {
        ruleJson: {
            get(): string {
                return JSON.stringify(s(this.$store).state.rulesets.normalizedRulesets.entities.rules[this.ruleId]);
            },
            set(value: string): void {
                try {
                    this.$store.dispatch(RulesetsModule.Actions.updateRule, JSON.parse(value));
                    this.error = "";
                }
                catch (error) {
                    this.error = error + ": " + error.message;
                }
            }
        }
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str)
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
