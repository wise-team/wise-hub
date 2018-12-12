<!-- src/components/views/rulesets/rules/expiration_dateRuleComponent.vue -->
<template>
    <div class="expiration_date-rule-component">
        <b-input-group prepend="Expire ruleset">
            <b-form-input type="datetime-local" :disabled="!enabled" v-model="date"></b-form-input>
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
import { ExpirationDateRule } from "steem-wise-core";

export default Vue.extend({
    props: [ "ruleId", "enabled" ],
    data() {
        return {
            error: ""
        };
    },
    methods: {
        catchError(fn:() => any) {
            try { this.error = ""; fn(); }
            catch (error) {  this.error = error + ": " + error.message; console.error(error); }
        },
        saveRule(rule: any) {
            s(this.$store).dispatch(RulesetsModule.Actions.updateRule, rule);
            this.error = "";
        }
    },
    computed: {
        rule(): any {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rules[this.ruleId];
        },
        date: {
            get(): string { 
                const utc = new Date(d(this.rule.date));
                return new Date(utc.getTime() - (utc.getTimezoneOffset() * 60000)).toISOString().slice(0, -1);
            },
            set(dateLocal: string): void { this.catchError(() => {
                const dateUtc = new Date(dateLocal).toISOString();
                this.saveRule(_.set(_.cloneDeep(this.rule), "date", dateUtc));
                this.error = "";
            }); }
        },
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

.expiration_date-mode-select {
    max-width: 6rem;
}
</style>
