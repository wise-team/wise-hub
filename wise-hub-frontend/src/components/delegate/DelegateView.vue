<!-- src/components/views/delegate/DelegateView.vue -->
<template>
    <div v-if="isLoggedIn" id="delegate-view delegate-view-logged-in">
        <h1>{{ username | ucfirst }}, the delegator <font-awesome-icon :icon="delegatorIcon" /></h1>
        <div class="border rounded p-2">
            <h2>Daemon settings</h2>
            <daemon-settings-component />
        </div>

        <realtime-log-component :delegator="username" />
    </div>
    <div v-else id="delegate-view delegate-view-logged-out">
        <h1>Log in to became a delegator</h1>
        <p>Please log in</p>
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
        };
    },
    methods: {
    },
    computed: {
        isLoggedIn(): boolean {
            return s(this.$store).getters[AuthModule.Getters.isLoggedIn];
        },
        username(): string {
            return d(s(this.$store).state.auth.username);
        },
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
