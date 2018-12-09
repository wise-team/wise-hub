<!-- src/components/controls/DynamicTimeComponent.vue -->
<template>
    <span v-b-tooltip.hover :title="tooltipText">
       {{ timeText }} 
    </span>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";
import { s } from "../../store/store";

export default Vue.extend({
    props: [ "timestamp" ],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        timeText(): string {
            const now = d(s(this.$store).state.nowTimer);
            return timeDifferenceStr(now.getTime(), new Date(this.timestamp).getTime());
        },
        tooltipText(): string {
            return new Date(this.timestamp).toISOString();
        }
    },
    components: {},
});
</script>

<style>
</style>
