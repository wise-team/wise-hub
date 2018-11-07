<!-- src/components/history/HistoryView.vue -->
<template>
    <b-container fluid id="trending-view">
        <b-row>
            <b-col cols="12" md="8">
                <h1>Activity</h1>
                <realtime-history-component account="" />
            </b-col>
            <b-col cols="12" md="4">
                <span v-if="accountName.length > 0">
                    <account-status-widget :account="accountName" />
                </span>
                <span v-else>
                    <general-status-widget />
                </span>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { StatusModule } from "../../store/modules/status/StatusModule";
import { s } from "../../store/store";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";

import AccountStatusWidget from "./AccountStatusWidget.vue";
import GeneralStatusWidget from "./GeneralStatusWidget.vue";
import RealtimeHistoryComponent from "./RealtimeHistoryComponent.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        accountName(): string {
            return d(s(this.$store).state.auth.username);
        },
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
        AccountStatusWidget,
        GeneralStatusWidget,
        RealtimeHistoryComponent
    },
});
</script>

<style>
</style>
