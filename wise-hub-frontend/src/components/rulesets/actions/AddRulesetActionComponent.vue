<!-- src/components/rulesets/actions/AddRulesetActionComponent.vue -->
<template>
    <div>
        <h4>Add new ruleset</h4>
        <b-input-group prepend="@" class="mb-2">
            <b-form-input type="text" v-model="voter" placeholder="Voter"></b-form-input>
        </b-input-group>
        <p class="text-right">
            <b-button variant="primary" :disabled="voter.length === 0 && loading" @click="addRuleset()">
                <font-awesome-icon v-if="loading" :icon="loadingIcon" spin />
                Add ruleset for @{{ voter }}
            </b-button>
        </p>
        <b-alert variant="danger" :show="error.length > 0">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </b-alert>
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
import { FirstPostRule } from "steem-wise-core";

const funnyRulesetBegins: string [] = [
    "new", "funny", "severe", "non trivial", "grand", "smart", "wise", "clever", "sapient", "visionary",
    "fast", "rapid", "quick-and-dirty", "blazing", "fiery", "strong", "amusing", "hilarious", "entertaining",
    "enormous", "Very important", "ASAP", "very", "true"
];

export default Vue.extend({
    props: [ ],
    data() {
        return {
            voter: "",
            error: "",
            loading: false
        };
    },
    methods: {
        addRuleset() {
            if (this.voter.length === 0) return;
            if (this.loading) return;
            (async () => {
            try {
                this.loading = true;
                this.error = "";

                const accountExists = await AuthModuleApiHelper.accountExists(this.voter);
                if (!accountExists) throw new Error("Account @" + this.voter + " does not exist");

                const rulesetName = _.sample(funnyRulesetBegins) + " ruleset for " + ucfirst(this.voter);
                const ruleset: NormalizedRulesets.NormalizedRuleset  = {
                    id: uniqueId(),
                    name: ucfirst(rulesetName),
                    rules: []
                };
                s(this.$store).dispatch(RulesetsModule.Actions.addRulesetToSetRules, { 
                    voter: this.voter,
                    ruleset: ruleset
                });

                this.voter = "";
                this.loading = false;
            }
            catch (error) {
                this.error = error + "";
                this.loading = false;
            }
            })();
        },
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; }
    },
    components: {
    },
});
</script>

<style>

</style>
