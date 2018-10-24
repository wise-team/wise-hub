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
import * as _ from "lodash";

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
        rule(): NormalizedRulesets.NormalizedRule {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rules[this.ruleId];
        },
        ruleJson: {
            get(): string {
                return JSON.stringify(
                    _.omit(this.rule, "id")
                );
            },
            set(value: string): void {
                try {
                    const newObj = JSON.parse(value);
                    newObj.id = this.rule.id;
                    s(this.$store).dispatch(RulesetsModule.Actions.updateRule, newObj);
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
        json: (obj: any) => JSON.stringify(obj),
        omitId: (obj: any) => _.omit(obj, "id")
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
