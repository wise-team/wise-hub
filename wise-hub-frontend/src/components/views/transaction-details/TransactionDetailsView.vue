<!-- src/components/view/account/TransactionDetailsView.vue -->
<template>
    <div v-if="transaction_id" class="transaction-details-view">
        <h1>Transaction details #{{ transaction_id }}</h1>
    </div>
    <div v-else class="transaction-details-view transaction-details-view-not-found">
        <h1>Not found</h1>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../../store/store";
import { d, ucfirst } from "../../../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
            transaction_id: this.$route.params.transaction_id ? this.$route.params.transaction_id : undefined
        };
    },
    watch: {
        "$route" (to, from) {
            this.transaction_id = to.params.transaction_id ? to.params.transaction_id : undefined;
        }
    },
    methods: {
    },
    computed: {
    },
    components: {
    },
});
</script>

<style>

</style>
