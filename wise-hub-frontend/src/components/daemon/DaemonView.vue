<!-- src/components/daemon/DaemonView.vue -->
<template>
    <div id="daemon-view">
        <h1>Global daemon log</h1>
        <realtime-log-component delegator="" />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";

import RealtimeLogComponent from "./RealtimeLogComponent.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
    },
    components: {
        RealtimeLogComponent,
    },
});
</script>

<style>
</style>
