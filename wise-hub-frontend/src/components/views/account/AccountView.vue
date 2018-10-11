<!-- src/components/view/account/AccountView.vue -->
<template>
    <div v-if="account" class="account-view">
        <h1>{{ account | ucfirst }} and wise</h1>
    </div>
    <div v-else class="account-view account-view-not-found">
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
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>

</style>
