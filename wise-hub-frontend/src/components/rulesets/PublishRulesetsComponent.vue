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
        <b-alert variant="info" :show="result.length > 0 && daemonEnabled">
            <h4>Is your daemon enabled?</h4>
            <p>
                Your daemon on wise hub is disabled.
                You can enable the daemon in the
                <router-link :to="'/@' + username + '/daemon'">Daemon settings panel</router-link>.
            </p>
            <p>
                <small><i>
                    For advanced users:
                    If you want to run the daemon on your own server please read the
                    <a :href="daemonInstallationInstructionsLink">daemon installation instructions</a>.
                    If you are already running the daemon on your server, ignore the message.
                </i></small>
            </p>
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
import { UserSettings } from "../../store/modules/auth/User";

const generateOpsExecutor = new DelayedExecutor(1200);

export default Vue.extend({
    props: [ "for" ],
    data() {
        return {
            daemonInstallationInstructionsLink: /*§ '"' + data.config.urls.daemonInstallationInstructions + '"' §*/"https://docs.wise.vote/installation"/*§ §.*/
        };
    },
    methods: {
    },
    computed: {
        username(): string {
            return d(s(this.$store).state.auth.username);
        },
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
        /*hasOneRuleset(): boolean {
            return _.keys(s(this.$store).state.rulesets.normalizedRulesets.entities.rulesets).length === 1;
        },*/
        settings(): UserSettings {
            return d(d(s(this.$store).state.auth.user).settings);
        },
        daemonEnabled(): boolean {
            return d(this.settings.daemonEnabled);
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
