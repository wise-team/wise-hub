<!-- src/components/views/rulesets/PublishRulesetsComponent.vue -->
<template>
    <div v-if="forMe" class="publish-rulesets-component">
        <b-alert variant="primary" :show="loading">
            <font-awesome-icon :icon="loadingIcon" spin /> Saving...
        </b-alert>
        <b-alert variant="danger" :show="error.length > 0">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </b-alert>
        <b-alert variant="success" :show="result.length > 0">
            <font-awesome-icon :icon="successIcon" /> {{ result }}
        </b-alert>
    </div>
    <div v-else></div>
</template>

<script lang="ts">
import Vue from "vue";
import * as _ from "lodash";
import * as steem from "steem";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, ucfirst, uniqueId } from "../../util/util";
import { DelayedExecutor } from "../../util/DelayedExecutor";

import { NormalizedRulesets } from "../../store/modules/rulesets/NormalizedRulesets";
import { RulesetsModule } from "../../store/modules/rulesets/RulesetsModule";
import { Wise, RulesUpdater, SetRulesForVoter } from "steem-wise-core";

const generateOpsExecutor = new DelayedExecutor(1200);

export default Vue.extend({
    props: [ "for" ],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        loading(): boolean {
            return s(this.$store).state.rulesets.publish.loading;
        },
        error(): string {
            return s(this.$store).state.rulesets.publish.error;
        },
        result(): string {
            return s(this.$store).state.rulesets.publish.result;
        },
        forMe(): boolean {
            return s(this.$store).state.rulesets.publish.for === this.for;
        },
        successIcon() { return icons.success; },
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst,
        json: (str: string) => JSON.stringify(str, undefined, 2)
    }
});
</script>

<style>
.blockchain-ops {
    overflow-x: scroll;
    max-width: 100%;
    display: block;
}
</style>
