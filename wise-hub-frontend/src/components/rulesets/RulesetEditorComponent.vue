<!-- src/components/views/rulesets/RulesetEditorComponent.vue -->
<template>
    <div v-if="!isRulesetValid">
        <b-alert show variant="warning">
            <p>Ruleset element has invalid structure</p>
            <hr />
            <pre>{{ ruleset | json }}</pre>
        </b-alert>
    </div>
    <div v-else class="ruleset-component">
        <p class="text-right">
            <small v-if="modified" class="text-danger">*to be saved</small>
        </p>
        <h3 v-if="!edit"><small class="text-muted">title:</small> {{ ruleset.name }}</h3>
        <b-input-group v-else size="lg" prepend="Name" placeholder="Ruleset name" class="mb-4 mb-md-2 t-ruleseteditor-rulesetname-input">
            <b-form-input type="text" v-model="rulesetName" :disabled="!edit"></b-form-input>
        </b-input-group>

        <horizontal-rule-component
            v-for="ruleId in rules" :key="ruleId"
            :ruleId="ruleId"
            :rulesetId="rulesetId"
            :edit="edit"
            class="mb-4 mb-md-2"
        />
        <p class="text-center" v-if="edit">
            <!--<b-btn @click="addRule()" variant="outline-secondary"
            size="sm" class="mt-1">
                <font-awesome-icon :icon="addIcon" /> Add rule
            </b-btn>-->
            <add-rule-action-component :rulesetId="rulesetId" />
        </p>
        <p v-if="rulesToBeDeleted.length > 0" class="text-muted">
            <strong>The following rules will be deleted from blockchain:</strong>
            <ul>
                <li v-for="rule in rulesToBeDeleted" :key="rule.id">
                    <strong>{{ rule.rule }}</strong>
                    ( <i>{{ rule | omitId | json }}</i> ) 
                    <b-link @click="revertRuleDeletion(rule)" style="display: inline-block;">Revert deletion</b-link>
                </li>
            </ul>
        </p>
                <!--
            <div class="card-footer p-1 bg-secondary text-light rounded">
                <b-btn v-if="canVote" v-b-toggle="unique + '-collapse-vote'" 
                    variant="primary" size="sm" class="m-1 mr-3" 
                    disabled v-b-tooltip.hover title="This feature is not implemented yet. Stay tuned!"
                >
                    Vote
                </b-btn>
                <b-btn v-b-toggle="unique + '-collapse-copy'" variant="light" size="sm" class="m-1" 
                    disabled v-b-tooltip.hover title="This feature is not implemented yet. Stay tuned!"
                >
                    Copy
                </b-btn>
                <b-btn v-b-toggle="unique + '-collapse-ask'" variant="light" size="sm" class="m-1 mr-3" 
                    disabled  v-b-tooltip.hover title="This feature is not implemented yet. Stay tuned!"
                >
                    Ask
                </b-btn>

                <b-btn v-if="canEdit" v-b-toggle="unique + '-collapse-rename'" variant="light" size="sm" class="m-1">
                    Rename
                </b-btn>
                <b-btn v-if="canEdit" v-b-toggle="unique + '-collapse-delete'" variant="light" size="sm" class="m-1">
                    Delete
                </b-btn>
                <b-btn v-if="canEdit" v-b-toggle="unique + '-collapse-ch-voter'" variant="light" size="sm" class="m-1">
                    Ch voter
                </b-btn>

                <div class="collapse-panels">
                    <b-collapse :id="unique + '-collapse-vote'" :accordion="unique + '-options-accordion'">
                        <h5>Vote</h5>
                        <p>Vote action. TODO</p>
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-copy'" :accordion="unique + '-options-accordion'">
                        <copy-ruleset-action-component class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-ask'" :accordion="unique + '-options-accordion'" class="p-2">
                        <ask-for-ruleset-action-component class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-rename'" :accordion="unique + '-options-accordion'" class="p-2">
                        <rename-ruleset-action-component :set-rules-id="setRules.id" :ruleset="ruleset" class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-delete'" :accordion="unique + '-options-accordion'" class="p-2">
                        <delete-ruleset-action-component :set-rules-id="setRules.id" :ruleset="ruleset" class="p-2" />
                    </b-collapse>

                    <b-collapse :id="unique + '-collapse-ch-voter'" :accordion="unique + '-options-accordion'" class="p-2">
                        <change-ruleset-voter-action-component :set-rules-id="setRules.id" :ruleset="ruleset" class="p-2" />
                    </b-collapse>
                </div>
            </div>
        </div>-->
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
import * as _ from "lodash";

import HorizontalRuleComponent from "./HorizontalRuleComponent.vue";
import AddRuleActionComponent from "./actions/AddRuleActionComponent.vue";

export default Vue.extend({
    props: [ "setRules", "rulesetId", "modified", "edit" ],
    data() {
        return {
            unique: uniqueId(),
            error: ""
        };
    },
    methods: {
        revertRuleDeletion(rule: NormalizedRulesets.NormalizedRule) {
            s(this.$store).dispatch(
                RulesetsModule.Actions.addRuleToRuleset,
                {
                    rulesetId: this.rulesetId, 
                    rule: rule
                }
            );
        }
    },
    computed: {
        ruleset(): NormalizedRulesets.NormalizedRuleset {
            const ruleset = s(this.$store).state.rulesets.normalizedRulesets.entities.rulesets[this.rulesetId];
            // console.log("Seems like ruleset has changed: ");
            // console.log(ruleset);
            return ruleset;
        },
        rules(): string [] {
            // console.log("Seems like rules has changed");
            return s(this.$store).state.rulesets.normalizedRulesets.entities.rulesets[this.rulesetId].rules;
        },
        rulesetBackup(): NormalizedRulesets.NormalizedRuleset | undefined {
            return s(this.$store).state.rulesets.backupNormalizedRulesets.entities.rulesets[this.rulesetId];
        },
        rulesToBeDeleted(): NormalizedRulesets.NormalizedRule [] {
            if (!this.rulesetBackup) return [];
            return this.rulesetBackup.rules.filter(ruleId => this.ruleset.rules.indexOf(ruleId) < 0)
            .map(ruleId => s(this.$store).state.rulesets.backupNormalizedRulesets.entities.rules[ruleId]);
        },
        isRulesetValid(): boolean {
            return typeof this.ruleset.name !== "undefined"
                && Array.isArray(this.ruleset.rules)
        },
        rulesetName: {
            get(): string {
                return this.ruleset.name;
            },
            set(value: string): void {
                try {
                    s(this.$store).dispatch(RulesetsModule.Actions.renameRuleset, { rulesetId: this.ruleset.id, name: value });
                }
                catch (error) {
                    this.error = error + ": " + error.message;
                    console.error(error);
                }
            }
        },
        addIcon() { return icons.add },
    },
    components: {
        HorizontalRuleComponent,
        AddRuleActionComponent,
    },
    filters: {
        ucfirst: ucfirst,
        json: (obj: any) => JSON.stringify(obj, undefined, 2),
        omitId: (obj: any) => _.omit(obj, "id")
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
