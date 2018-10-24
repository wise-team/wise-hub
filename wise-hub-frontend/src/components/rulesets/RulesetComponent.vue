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
        <div class="card">
            <div class="card-body p-2 p-sm-3 p-xl-4">
                <h4 class="card-title">{{ ruleset.name }}</h4>
                 <horizontal-rule-component
                    v-for="ruleId in ruleset.rules" :key="ruleId"
                    :ruleId="ruleId"
                    :rulesetId="rulesetId"
                    :edit="edit"
                    class="mb-4 mb-md-2 ml-2"
                />
                <p class="text-center">
                     <b-btn @click="addRule()" variant="outline-secondary"
                      size="sm" class="mt-1">
                        <font-awesome-icon :icon="addIcon" /> Add rule
                     </b-btn>
                </p>
            </div>
            <div class="card-footer p-1 bg-secondary text-light rounded">
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

                <div class="collapse-panels">
                    <b-collapse :id="unique + '-collapse-copy'" :accordion="unique + '-options-accordion'">
                        <copy-ruleset-action-component class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-ask'" :accordion="unique + '-options-accordion'" class="p-2">
                        <ask-for-ruleset-action-component class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-rename'" :accordion="unique + '-options-accordion'" class="p-2">
                        <rename-ruleset-action-component class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-delete'" :accordion="unique + '-options-accordion'" class="p-2">
                        <delete-ruleset-action-component :set-rules-id="setRules.id" :ruleset="ruleset" class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-ch-voter'" :accordion="unique + '-options-accordion'" class="p-2">
                        <change-ruleset-voter-action-component class="p-2" />
                    </b-collapse>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst, uniqueId } from "../../util/util";
import { Ruleset, Rule } from "steem-wise-core";
import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";

import BehindPanel from "../controls/BehindPanel.vue";
import RuleComponent from "./RuleComponent.vue";
import HorizontalRuleComponent from "./HorizontalRuleComponent.vue";
import AskForRulesetActionComponent from "./actions/AskForRulesetActionComponent.vue";
import ChangeRulesetVoterActionComponent from "./actions/ChangeRulesetVoterActionComponent.vue";
import CopyRulesetActionComponent from "./actions/CopyRulesetActionComponent.vue";
import DeleteRulesetActionComponent from "./actions/DeleteRulesetActionComponent.vue";
import RenameRulesetActionComponent from "./actions/RenameRulesetActionComponent.vue";

export default Vue.extend({
    props: [ "setRules", "rulesetId" ],
    data() {
        return {
            edit: false,
            unique: uniqueId()
        };
    },
    methods: {
        addRule() {
            s(this.$store).dispatch(
                RulesetsModule.Actions.createNewRule,
                {
                    rulesetId: this.rulesetId, 
                    rule: {
                        id: "rule-" + uniqueId(),
                        rule: Rule.Type.AgeOfPost
                    }
                }
            );
        }
    },
    computed: {
        ruleset(): NormalizedRulesets.NormalizedRuleset {
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rulesets[this.rulesetId];
        },
        isRulesetValid(): boolean {
            return typeof this.ruleset.name !== "undefined"
                && Array.isArray(this.ruleset.rules)
        },
        addIcon() { return icons.add },
    },
    components: {
        RuleComponent,
        HorizontalRuleComponent,
        BehindPanel,
        AskForRulesetActionComponent,
        ChangeRulesetVoterActionComponent,
        CopyRulesetActionComponent,
        DeleteRulesetActionComponent,
        RenameRulesetActionComponent
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
