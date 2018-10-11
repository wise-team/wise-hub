<!-- src/components/views/rulesets/RulesetsView.vue -->
<template>
    <div v-if="voter && delegator" class="rulesets-view rulesets-view-voter-and-delegator">
        <h1>Rulesets for @{{ voter | ucfirst }} by @{{ delegator | ucfirst }}</h1>
    </div>
    <div v-else-if="voter && !delegator" class="rulesets-view rulesets-view-voter">
        <h1>Rulesets for @{{ voter | ucfirst }}</h1>
    </div>
    <div v-else-if="!voter && delegator" class="rulesets-view rulesets-view-delegator">
        <h1>Rulesets by @{{ delegator | ucfirst }}</h1>
    </div>
    <div v-else class="rulesets-view rulesets-view-not-found">
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
            delegator: this.$route.params.delegator ? this.$route.params.delegator : undefined,
            voter: this.$route.params.voter ? this.$route.params.voter : undefined
        };
    },
    watch: {
        "$route" (to, from) {
            this.delegator = to.params.delegator ? to.params.delegator : undefined;
            this.voter = to.params.voter ? to.params.voter : undefined;
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
