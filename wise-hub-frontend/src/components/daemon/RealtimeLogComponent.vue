<!-- src/components/controls/RealtimeLog.vue -->
<template>
    <div>
        <p v-if="loading" class="text-center">
            <font-awesome-icon :icon="loadingIcon" spin /> Loading...
        </p>
        <div v-if="error.length > 0" class="alert alert-danger" role="alert">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </div>
        
        <div class="realtime-log-list">
            <log-entry v-for="entry in log" :key="entry.id" :entry="entry" />
        </div>

        <p class="text-right">
            <small> Daemon log for /@{{ delegator }} </small>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import * as socketio from "socket.io-client";
import { d, assertString, formatBigInt, timeDifferenceStr, uniqueId } from "../../util/util";
import { DaemonLogEntry } from "../../api/DaemonLogEntry";
import { WiseApiHelper } from "../../api/WiseApiHelper";

import LogEntry from "./LogEntry.vue";

const realtimePort = /*§ data.config.hub.docker.services.realtime.port §*/8099/*§ §.*/;
let io: SocketIOClient.Socket | undefined;

export default Vue.extend({
    props: [ "delegator" ],
    data() {
        return {
            log: [] as DaemonLogEntry [],
            loading: true,
            error: ""
        };
    },
    watch: {
        delegator: function (delegator: string, oldDelegator: string) {
            console.log("Reload on delegator change to \"" + delegator + "\"");
            this.reload();
        }
    },
    created: function () {
        this.reload()
    },
    methods: {
        reload() {
            const delegatorParam = this.delegator ? this.delegator.length > 0 ? this.delegator : undefined : undefined;
            // const room = delegatorParam ? "delegator_" + delegatorParam : "general";
            // const socketIoUrl = "http://" + window.location.hostname + "/realtime/socket.io";
            // console.log("socketIoUrl = '" + socketIoUrl + "' for delegatorParam=" + delegatorParam);
            console.log("Initiate socket.io");
            if (io) {
                io.close();
                io = undefined;
            }
            io = socketio("/", {
                query: {
                    delegator: delegatorParam || "",
                },
                rejectUnauthorized: false,
                path: "/realtime/socket.io"
            });
            io.on("msg", (data: string) => {
                console.log(data);
                const entry = JSON.parse(data);
                entry.id = uniqueId();
                this.log.unshift(entry);
                if(this.log.length > 100) this.log.pop();
            });

            this.loading = true;
            this.error = "";
            (async () => {
                try {
                    const entries: DaemonLogEntry [] = await WiseApiHelper.getLog(delegatorParam);
                    this.log = entries.map((entry: DaemonLogEntry) => { entry.id = uniqueId(); return entry as DaemonLogEntry; });
                    this.error = "";
                    this.loading = false;
                }
                catch (error) {
                    this.error = error + "";
                    this.loading = false;
                    console.warn(error);
                }
            })();
        }
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
        LogEntry
    },
});
</script>

<style>
</style>
