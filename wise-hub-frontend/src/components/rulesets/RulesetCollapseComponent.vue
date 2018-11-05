<!-- src/components/views/rulesets/RulesetCollapseComponent.vue -->
<template>
    <div v-if="!isRulesetValid">
        <b-alert show variant="warning">
            <p>Ruleset element has invalid structure</p>
            <hr />
            <pre>{{ ruleset | json }}</pre>
        </b-alert>
    </div>
    <div v-else class="ruleset-collapse-component">
        <h4 :class="editingOther ? 'text-muted' : 'toggle-title cursor-pointer'">
            <span @click="toggleOpen()" >
                {{ ruleset.name }}
                <font-awesome-icon v-if="opened" :icon="dropupIcon" />
                <font-awesome-icon v-else :icon="dropdownIcon" />
            </span>
            <small v-if="opened && canEdit">
                &nbsp;
                <b-button size="sm" variant="primary" @click="initiateEdit()">edit</b-button>
                &nbsp;
                <b-button size="sm" variant="warning" @click="initiateDelete()">delete</b-button>
            </small>
        </h4>
        <b-collapse :id="unique + '-collapse-delete'" v-model="deleteOpened">
            <div class="ml-md-3 pb-3">
                <delete-ruleset-action-component :set-rules-id="setRules.id" :ruleset="ruleset" class="p-2 rounded bg-e6" />
            </div>
        </b-collapse>

        <b-collapse :id="unique + '-collapse-edit'" v-model="opened">
            <div class="ml-md-3 pb-3">
                <ruleset-editor-component
                    :set-rules="setRules"
                    :rulesetId="rulesetId"
                    :edit="edit"
                    class="mb-3"
                />
                <p class="text-right" v-if="edit">
                    <b-button variant="secondary" :disabled="!(modified && !saveLoading)" @click="revertChanges()">
                        Revert changes
                    </b-button>
                    <b-button variant="primary" :disabled="!(modified && !saveLoading)" @click="saveChanges()">
                        Save to blockchain
                    </b-button>
                </p>
                
                <publish-rulesets-component />
            </div>
        </b-collapse>
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

import RulesetEditorComponent from "./RulesetEditorComponent.vue";
import DeleteRulesetActionComponent from "./actions/DeleteRulesetActionComponent.vue";
import PublishRulesetsComponent from "./PublishRulesetsComponent.vue";

export default Vue.extend({
    props: [ "setRules", "rulesetId" ],
    data() {
        return {
            opened: false as boolean,
            deleteOpened: false as boolean,
            unique: uniqueId(),
        };
    },
    methods: {
        toggleOpen() {
            if (this.edit) this.opened = true;
            else if (this.editingOther) this.opened = false;
            else this.opened = !this.opened;
        },
        initiateEdit() {
            if (this.edit) {
                s(this.$store).dispatch(RulesetsModule.Actions.revertChanges);
            }
            else if (!this.editingOther) {
                s(this.$store).dispatch(RulesetsModule.Actions.beginRulesetEdit, { rulesetId: this.rulesetId });
            }
        },
        initiateDelete() {
            this.deleteOpened = !this.deleteOpened;
        },
        saveChanges() {
            s(this.$store).dispatch(RulesetsModule.Actions.saveChanges);
        },
        revertChanges() {
            s(this.$store).dispatch(RulesetsModule.Actions.revertChanges);
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
        canEdit(): boolean {
            return (s(this.$store).state.auth.username === this.setRules.delegator
                || window.location.search.indexOf("forceEdit") !== -1)
                && !this.editingOther;
        },
        saveLoading(): boolean {
            return s(this.$store).state.rulesets.publish.loading;
        },
        modified(): boolean { return d(s(this.$store).state.rulesets.edit.modified); },
        edit(): boolean { return d(s(this.$store).state.rulesets.edit.rulesetId) === this.rulesetId; },
        editingOther(): boolean {
            return s(this.$store).state.rulesets.edit.rulesetId.length > 0 
            && d(s(this.$store).state.rulesets.edit.rulesetId) !== this.rulesetId;
        },
        successIcon() { return icons.success; },
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
        dropdownIcon() { return icons.dropdown; },
        dropupIcon() { return icons.dropup; },
    },
    components: {
        RulesetEditorComponent,
        DeleteRulesetActionComponent,
        PublishRulesetsComponent
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
