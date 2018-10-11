<!-- src/components/views/rulesets-editor/RulesetsEditor.vue -->
<template>
    <div v-if="voter" class="rulesets-view">
        <h1>Edit rulesets for @{{ voter }}</h1>
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
            voter: this.$route.params.voter ? this.$route.params.voter : undefined
        };
    },
    watch: {
        "$route" (to, from) {
            this.voter = to.params.voter ? to.params.voter : undefined;
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
