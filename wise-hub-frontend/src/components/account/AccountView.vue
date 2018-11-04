<!-- src/components/account/AccountView.vue -->
<template>
    <div v-if="account" class="account-view">
        <h1>{{ account | ucfirst }} and wise</h1>
        <div v-if="isItMe" class="border rounded p-2">
            <h2>Settings</h2>
            <daemon-settings-component />
        </div>
    </div>
    <div v-else class="account-view account-view-not-found">
        <h1>Not found</h1>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";

import DaemonSettingsComponent from "./DaemonSettingsComponent.vue";

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
    },
    components: {
        DaemonSettingsComponent,
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>

</style>
