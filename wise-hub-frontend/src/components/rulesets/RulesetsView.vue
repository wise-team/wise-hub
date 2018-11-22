<!-- src/components/views/rulesets/RulesetsView.vue -->
<template>
    <div class="rulesets-view">
        <div v-if="voter && delegator" class="rulesets-view-voter-and-delegator">
            <h1>Rulesets for @{{ voter }} by @{{ delegator }}</h1>
        </div>
        <div v-else-if="voter && !delegator" class="rulesets-view-voter">
            <h1>Rulesets for @{{ voter }}</h1>
        </div>
        <div v-else-if="!voter && delegator" class="rulesets-view-delegator">
            <h1>Rulesets by @{{ delegator }}</h1>
        </div>
        <div v-else class="rulesets-view-not-found">
            <h1>Not found</h1>
        </div>

        <loading-control :error="error" :loading="loading" loadingText="Loading rulesets..." />

        <!-- Display proggress of delete -->
        <publish-rulesets-component for="delete" />
        
        <span v-for="setRulesId in setRulesItems" :key="setRulesId">
            <set-rules-component :set-rules-id="setRulesId" />
        </span>

        <div v-if="setRulesItems.length === 0 && !loading" class="p-2 p-sm-5 m-2 m-sm-5">
            <div v-if="canEdit" class="alert alert-primary">
                Looks like you have not created a ruleset yet.
                Use the below form to create new ruleset for someone.
                <br />
                <small>Don't know how to set the rules? <a :href="manualUrl">Read the manual</a></small>.
            </div>
            <div v-else-if="!!delegator" class="alert alert-primary">
                @{{ delegator }} has no rulesets yet.
            </div>
            <div v-else class="alert alert-primary">
                No one created rulesets for @{{ voter }} yet. 
                <span v-if="loggedIn">
                    <router-link :to="'/@' + account + '/rulesets'">
                        Go to your rulesets
                    </router-link>
                    and create one for @{{ voter }}
                 </span>
            </div>
        </div>

        <add-ruleset-action-component v-if="canEdit && !editMode" class="add-rules-component p-2 rounded border bg-light" />

        <b-modal ref="unsavedModalRef" hide-footer title="Unsaved changes">
            <div class="d-block text-center">
                <p>
                    Warning: you are in edit mode. There may be unsaved changes. Please save or reset changes first.
                    Then you will be able to move on.
                </p>
            </div>
            <b-btn class="mt-3" variant="danger" block @click="hideUnsavedModal() && revertChanges()">Reset changes</b-btn>
        </b-modal>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as _ from "lodash";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { urls } from "../../urls";
import { EffectuatedSetRules } from "steem-wise-core";
import { WiseApiHelper } from "../../api/WiseApiHelper";
import { Log } from "../../Log";
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";

import SetRulesComponent from "../rulesets/SetRulesComponent.vue";
import LoadingControl from "../controls/LoadingControl.vue";
import AddRulesetActionComponent from "./actions/AddRulesetActionComponent.vue";
import PublishRulesetsComponent from "./PublishRulesetsComponent.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
            delegator: this.$route.params.delegator ? this.$route.params.delegator : undefined,
            voter: this.$route.params.voter ? this.$route.params.voter : undefined,
            manualUrl: urls.manual
        };
    },
    watch: {
        "$route" (to, from) {
            this.delegator = to.params.delegator ? to.params.delegator : undefined;
            this.voter = to.params.voter ? to.params.voter : undefined;
            this.loadRulesetsIfRequired();
        }
    },
    mounted() {
        this.loadRulesetsIfRequired();
        this.$on("hook:beforeRouteLeave", (to: any, from: any, next: any) => {
            if (this.editMode) {
                next(false);
                this.showUnsavedModal();
            }
            else next();
        });
    },
    methods: {
        loadRulesetsIfRequired() {
            console.log("loadRulesetsIfRequired.for=" + JSON.stringify({ delegator: this.delegator, voter: this.voter }));
            s(this.$store).dispatch(RulesetsModule.Actions.setVoterAndOrDelegator, { delegator: this.delegator, voter: this.voter });
        },
        revertChanges() {
            s(this.$store).dispatch(RulesetsModule.Actions.revertChanges);
        },
        showUnsavedModal () {
            (this.$refs.unsavedModalRef as any).show();
        },
        hideUnsavedModal () {
            (this.$refs.unsavedModalRef as any).hide();
        }
    },
    computed: {
        loading(): boolean {
            return s(this.$store).state.rulesets.loading;
        },
        error(): string {
            return s(this.$store).state.rulesets.error;
        },
        editMode(): boolean {
            return s(this.$store).state.rulesets.edit.rulesetId.length > 0;
        },
        loggedIn(): boolean {
            return s(this.$store).state.auth.username.length > 0;
        },
        canEdit(): boolean {
            return !!this.delegator
                && (s(this.$store).state.auth.username === this.delegator
                || window.location.search.indexOf("forceEdit") !== -1)
                && !this.editMode;
        },
        setRulesItems(): string [] {
            const listOfIds = _.keys(s(this.$store).state.rulesets.normalizedRulesets.entities.setRules);
            return listOfIds.filter(setRulesId => 
                s(this.$store).state.rulesets.normalizedRulesets.entities.setRules[setRulesId].rulesets.length > 0
             || (
                     s(this.$store).state.rulesets.backupNormalizedRulesets.entities.setRules[setRulesId]
                  && s(this.$store).state.rulesets.backupNormalizedRulesets.entities.setRules[setRulesId].rulesets.length > 0
                )
            );
        },
    },
    components: {
        SetRulesComponent,
        LoadingControl,
        AddRulesetActionComponent,
        PublishRulesetsComponent
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>
.add-rules-component {
    max-width: 30rem;
    margin: 1rem auto;
}
</style>
