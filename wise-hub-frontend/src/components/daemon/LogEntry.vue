<!-- src/components/people/PersonComponent.vue -->
<template>
    <div class="log-entry p-1">
        <em class="text-muted log-time">{{ timeText }}</em>
        {{ entry.msg }}
        <span class="text-danger">{{ entry.error }}</span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { StatusModule } from "../../store/modules/status/StatusModule";
import { s } from "../../store/store";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";
import { DaemonLogEntry } from "../../api/DaemonLogEntry";

export default Vue.extend({
    props: {
        entry: {
            type: Object as () => DaemonLogEntry
        }
    },
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        timeText(): string {
            if (this.entry.time) {
                // return timeDifferenceStr(Date.now(), new Date(this.entry.time).getTime());
                return new Date(this.entry.time).toUTCString() + "";
            }
            else return "";
        },
    },
    components: {
    },
});
</script>

<style>
.log-entry {

}

.log-time {
    min-width: 6.5rem;
    text-align: right;
    display: inline-block;
    padding-right: 0.5rem;
    font-size: 75%;
}
</style>
