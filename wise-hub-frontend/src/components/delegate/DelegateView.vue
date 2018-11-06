<!-- src/components/views/delegate/DelegateView.vue -->
<template>
    <div v-if="account" id="delegate-view delegate-view-logged-in">
        <h1>{{ account | ucfirst }}, the delegator <font-awesome-icon :icon="delegatorIcon" /></h1>
        
        <div v-if="isItMe" class="border rounded p-2 mb-4">
            <h2>Daemon settings</h2>
            <daemon-settings-component />
        </div>

        <h2>Daemon log</h2>
        <realtime-log-component :delegator="account" />
    </div>
    <div v-else id="delegate-view delegate-view-logged-out">
        <h1>Undefined account</h1>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { AuthModule } from "../../store/modules/auth/AuthModule";
import { icons } from "../../icons";

import DaemonSettingsComponent from "../account/DaemonSettingsComponent.vue";
import RealtimeLogComponent from "../daemon/RealtimeLogComponent.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
            account: this.$route.params.account ? this.$route.params.account : undefined,
        };
    },
    watch: {
        "$route" (to, from) {
            this.account = to.params.account ? to.params.account : undefined;
        }
    },
    methods: {
    },
    computed: {
        isLoggedIn(): boolean {
            return s(this.$store).getters[AuthModule.Getters.isLoggedIn];
        },
        isItMe(): boolean {
            return !!(s(this.$store).state.auth.user) && d(s(this.$store).state.auth.user).account === this.account;
        },
        /*username(): string {
            return d(s(this.$store).state.auth.username);
        },*/
        delegatorIcon() { return icons.delegator; },
    },
    components: {
        DaemonSettingsComponent,
        RealtimeLogComponent
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>
</style>
