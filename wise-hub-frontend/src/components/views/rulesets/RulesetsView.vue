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
        
        <span v-for="effSetRules in rulesets" :key="effSetRules.moment + ''">
            <effectuated-set-rules-component v-if="effSetRules.rulesets.length > 0" :set-rules="effSetRules" />
        </span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";
import { EffectuatedSetRules } from "steem-wise-core";
import { WiseApiHelper } from "../../../api/WiseApiHelper";

import EffectuatedSetRulesComponent from "./EffectuatedSetRulesComponent.vue";
import LoadingControl from "../../controls/LoadingControl.vue";
import { Log } from "../../../Log";

export default Vue.extend({
    props: [],
    data() {
        return {
            delegator: this.$route.params.delegator ? this.$route.params.delegator : undefined,
            voter: this.$route.params.voter ? this.$route.params.voter : undefined,
            rulesetsLoadedFor: "",
            loading: false,
            error: "",
            rulesets: [] as EffectuatedSetRules []
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
            if (this.rulesetsLoadedFor != this.voter + "$" + this.delegator) {
                this.rulesetsLoadedFor = this.voter + "$" + this.delegator;
                this.loading = true;
                (async () => {
                    try {
                        const result: EffectuatedSetRules []
                            = await WiseApiHelper.loadRulesets({ voter: this.voter, delegator: this.delegator });
                        this.rulesets = result;
                        this.loading = false;
                        this.loadRulesetsIfRequired();
                    }
                    catch (error) {
                        this.error = error + ": " + error.message;
                        this.loading = false;
                        Log.log().exception(Log.level.error, error);
                    }
                })();
                
            }
        }
    },
    computed: {
    },
    components: {
        EffectuatedSetRulesComponent,
        LoadingControl
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>

</style>
