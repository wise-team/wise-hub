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
        
        <span v-for="setRulesId in setRulesItems" :key="setRulesId">
            <set-rules-component :set-rules-id="setRulesId" />
        </span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { EffectuatedSetRules } from "steem-wise-core";
import { WiseApiHelper } from "../../api/WiseApiHelper";

import SetRulesComponent from "../rulesets/SetRulesComponent.vue";
import LoadingControl from "../controls/LoadingControl.vue";
import { Log } from "../../Log";
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";

export default Vue.extend({
    props: [],
    data() {
        return {
            delegator: this.$route.params.delegator ? this.$route.params.delegator : undefined,
            voter: this.$route.params.voter ? this.$route.params.voter : undefined,
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
    },
    methods: {
        loadRulesetsIfRequired() {
            s(this.$store).dispatch(RulesetsModule.Actions.setVoterAndOrDelegator, { delegator: this.delegator, voter: this.voter });
        }
    },
    computed: {
        loading(): boolean {
            console.log("Loading=" + s(this.$store).state.rulesets.loading);
            return s(this.$store).state.rulesets.loading;
        },
        error(): string {
            return s(this.$store).state.rulesets.error;
        },
        setRulesItems(): string [] {
            const listOfIds = s(this.$store).state.rulesets.normalizedRulesets.result;
            return listOfIds.filter(setRulesId => 
                s(this.$store).state.rulesets.normalizedRulesets.entities.setRules[setRulesId].rulesets.length > 0);
        },
    },
    components: {
        SetRulesComponent,
        LoadingControl
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>

</style>
