<!-- src/components/views/rulesets/RulesetComponent.vue -->
<template>
    <div v-if="!isRulesetValid">
        <b-alert show variant="warning">
            <p>Ruleset element has invalid structure</p>
            <hr />
            <pre>{{ ruleset | json }}</pre>
        </b-alert>
    </div>
    <div v-else class="ruleset-component">
        <!--<div class="mb-2">
            <span class="text-muted h5">{{ ruleset.name }}&nbsp;</span>
            <span class="ruleset-options">
                <b-dropdown size="sm" variant="link" text="Options" right>
                    <b-dropdown-item>Rename</b-dropdown-item>
                    <b-dropdown-item>Edit</b-dropdown-item>
                    <b-dropdown-item>Change voter</b-dropdown-item>
                    <b-dropdown-item>Delete</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item>Copy</b-dropdown-item>
                    <b-dropdown-item>Ask a delegator</b-dropdown-item>
                </b-dropdown>
            </span>
        </div>

        <h orizontal-rule-component
            v-for="(rule, index) in ruleset.rules" :key="index"
            :rule="rule"
            class="mb-2 ml-2"
        />-->
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{{ ruleset.name }}</h5>
                 <horizontal-rule-component
                    v-for="ruleId in ruleset.rules" :key="ruleId"
                    :ruleId="ruleId"
                    :edit="edit"
                    class="mb-2 ml-2"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst, uniqueId } from "../../util/util";
import { Ruleset } from "steem-wise-core";

import RuleComponent from "./RuleComponent.vue";
import HorizontalRuleComponent from "./HorizontalRuleComponent.vue";
import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";

export default Vue.extend({
    props: [ "rulesetId" ],
    data() {
        return {
            edit: false
        };
    },
    methods: {
    },
    computed: {
        ruleset(): NormalizedRulesets.NormalizedRuleset {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rulesets[this.rulesetId];
        },
        isRulesetValid(): boolean {
            return typeof this.ruleset.name !== "undefined"
                && Array.isArray(this.ruleset.rules)
        },
    },
    components: {
        RuleComponent,
        HorizontalRuleComponent
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
    }
});
</script>

<style>
.ruleset-component .ruleset-options {
    float: right;
}
</style>
