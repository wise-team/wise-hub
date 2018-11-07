<!-- src/components/account/AccountView.vue -->
<template>
    <div v-if="account" class="account-view">
        <h1>{{ account | ucfirst }} and wise</h1>
        <!--<div v-if="isItMe" class="border rounded p-2">
            <h2>Settings</h2>
            <daemon-settings-component />
        </div>-->

        <b-container fluid class="account-links">
            <b-row>
                <b-col class="text-center">
                    <div class="bigicon wise-color"><font-awesome-icon :icon="delegateIcon" /></div>
                    <h2><router-link :to="'/@' + account + '/rulesets'">Rulesets by {{ accountOrYou }}</router-link></h2>
                    <p>Rulesets that you set for other users</p>
                </b-col>
                <b-col class="text-center">
                    <div class="bigicon wise-color"><font-awesome-icon :icon="voteIcon" /></div>
                    <h2><router-link :to="'/rulesets/for/@' + account + ''">Rulesets for {{ accountOrYou }}</router-link></h2>
                    <p>Rulesets that other users set for you</p>
                </b-col>
                <b-col class="text-center">
                    <div class="bigicon wise-color"><font-awesome-icon :icon="daemonIcon" /></div>
                    <h2><router-link :to="'/@' + account + '/daemon'">Daemon of {{ accountOrYou }}</router-link></h2>
                    <p>Daemon settings and live event log</p>
                </b-col>
            </b-row>
        </b-container>
        <hr />
        <h2>History</h2>
        <realtime-history-component :account="account" />
    </div>
    <div v-else class="account-view account-view-not-found">
        <h1>Not found</h1>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { icons } from "../../icons";

// import DaemonSettingsComponent from "./DaemonSettingsComponent.vue";
import RealtimeHistoryComponent from "../history/RealtimeHistoryComponent.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
            account: this.$route.params.account ? this.$route.params.account : undefined,
            moment: this.$route.params.moment ? this.$route.params.moment : undefined,
        };
    },
    watch: {
        "$route" (to, from) {
            this.account = to.params.account ? to.params.account : undefined;
            this.moment = to.params.moment ? to.params.moment : undefined;
        }
    },
    methods: {
    },
    computed: {
        isItMe(): boolean {
            return !!(s(this.$store).state.auth.user) && d(s(this.$store).state.auth.user).account === this.account;
        },
        accountOrYou(): string {
            return this.isItMe ? "you" : "@" + this.account;
        },
        delegateIcon() { return icons.delegator; },
        voteIcon() { return icons.voter; },
        daemonIcon() { return icons.daemon; }
    },
    components: {
        // DaemonSettingsComponent,
        RealtimeHistoryComponent,
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>
.account-links {

}

.account-links h2 a {
/*    color: #555;
    text-decoration: underline; */
}

.account-links h2 a:hover {
/*    color: #555;
    text-decoration: none; */
}

.account-links .bigicon {
    margin: 0 auto;
    font-size: 4rem;
    margin-bottom: 1rem;
}
</style>
