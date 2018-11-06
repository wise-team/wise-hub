<!-- src/components/views/rulesets/rules/VotersRuleComponent.vue -->
<template>
    <div class="voters-rule-component">
        <b-input-group prepend="Mode">
            <b-input-group-prepend>
                <b-form-select v-model="mode" :options="modes" :disabled="!enabled" class="voters-mode-select" />
            </b-input-group-prepend>
            <b-form-input type="text" :disabled="!enabled" v-model="voters"></b-form-input>
        </b-input-group>
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
import { VotersRule } from "steem-wise-core";

export default Vue.extend({
    props: [ "ruleId", "enabled" ],
    data() {
        return {
            error: ""
        };
    },
    methods: {
        saveRule(rule: any) {
            try {
                s(this.$store).dispatch(RulesetsModule.Actions.updateRule, rule);
                this.error = "";
            }
            catch (error) {
                this.error = error + ": " + error.message;
            }
        }
    },
    computed: {
        rule(): any {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rules[this.ruleId];
        },
        voters: {
            get(): string { return this.rule.usernames.join(", "); },
            set(votersStr: string): void {
                const voters: string [] = votersStr.split(",").map(e => e.trim());
                this.saveRule(_.set(_.cloneDeep(this.rule), "usernames", voters));
            }
        },
        mode: {
            get(): string { return this.rule.mode; },
            set(mode: string): void {
                this.saveRule(_.set(_.cloneDeep(this.rule), "mode", mode));
            }
        },
        modes() {
            return _.values(VotersRule.Mode);
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

.voters-mode-select {
    max-width: 6rem;
}
</style>
