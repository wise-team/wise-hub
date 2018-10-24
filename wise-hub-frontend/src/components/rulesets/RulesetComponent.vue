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
            <div class="card-body p-2 p-sm-3 p-xl-4">
                <h4 class="card-title">{{ ruleset.name }}</h4>
                 <horizontal-rule-component
                    v-for="ruleId in ruleset.rules" :key="ruleId"
                    :ruleId="ruleId"
                    :edit="edit"
                    class="mb-2 ml-2"
                />
                <p class="text-center">
                     <b-btn v-b-toggle="unique + '-collapse'" variant="outline-secondary"
                      size="sm" class="mt-1">
                        Add rule
                     </b-btn>
                </p>

                <!--<b-btn v-b-toggle="unique + '-collapse'" variant="primary">Toggle Collapse</b-btn>
                <b-collapse :id="unique + '-collapse'" class="mt-2">
                    <behind-panel>
                        <h5>Some options</h5>
                        <span>{{ ruleset | json }}</span>
                    </behind-panel>
                </b-collapse>-->
            </div>
            <div class="card-footer p-1 bg-secondary rounded">
                <b-btn v-b-toggle="unique + '-collapse-copy'" variant="light" size="sm" class="m-1">
                    Copy
                </b-btn>
                <b-btn v-b-toggle="unique + '-collapse-ask'" variant="light" size="sm" class="m-1 mr-3">
                    Ask
                </b-btn>

                <b-btn v-b-toggle="unique + '-collapse-rename'" variant="light" size="sm" class="m-1">
                    Rename
                </b-btn>
                <b-btn v-b-toggle="unique + '-collapse-delete'" variant="light" size="sm" class="m-1">
                    Delete
                </b-btn>
                <b-btn v-b-toggle="unique + '-collapse-ch-voter'" variant="light" size="sm" class="m-1">
                    Ch voter
                </b-btn>

                <b-collapse :id="unique + '-collapse-copy'" class="mt-2">
                    <h5>Copy ruleset</h5>
                </b-collapse>

                <b-collapse :id="unique + '-collapse-ask'" class="mt-2">
                    <h5>Ask a delegator for it</h5>
                </b-collapse>

                <b-collapse :id="unique + '-collapse-rename'" class="mt-2">
                    <h5>Rename ruleset</h5>
                </b-collapse>

                <b-collapse :id="unique + '-collapse-delete'" class="mt-2">
                    <h5>Delete ruleset</h5>
                </b-collapse>

                <b-collapse :id="unique + '-collapse-ch-voter'" class="mt-2">
                    <h5>Change voter</h5>
                </b-collapse>
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
import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";

import BehindPanel from "../controls/BehindPanel.vue";
import RuleComponent from "./RuleComponent.vue";
import HorizontalRuleComponent from "./HorizontalRuleComponent.vue";

export default Vue.extend({
    props: [ "rulesetId" ],
    data() {
        return {
            edit: false,
            unique: uniqueId()
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
        HorizontalRuleComponent,
        BehindPanel
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

.ruleset-component .card-footer {
    border: 2px solid white;
}
</style>
