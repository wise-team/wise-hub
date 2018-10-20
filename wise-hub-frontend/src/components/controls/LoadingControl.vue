<!-- src/components/controls/LoadingControl.vue -->
<template>
    <div>
        <p v-if="loading" class="text-center">
            <font-awesome-icon :icon="loadingIcon" spin /> {{ loadingText }}
        </p>
        <div v-if="error.length > 0" class="alert alert-danger" role="alert">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { data as wise } from "../../wise-config.gen";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";

export default Vue.extend({
    props: [ "loading", "error", "loadingText" ],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {},
});
</script>

<style>
</style>
