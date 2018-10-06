<!-- src/components/views/read/ReadView.vue -->
<template>
    <b-container fluid id="trending-view">
        <b-row>
            <b-col cols="12" md="8">

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
import { d } from "../../../util/util";
import { s } from "../../../store/store";

import AccountStatusWidget from "./AccountStatusWidget.vue";
import GeneralStatusWidget from "./GeneralStatusWidget.vue";


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
            return d(s(this.$store).state.steemConnect).account ? d(s(this.$store).state.steemConnect.account).name : "";
        }
    },
    components: {
        AccountStatusWidget,
        GeneralStatusWidget,
    },
});
</script>

<style>
</style>
