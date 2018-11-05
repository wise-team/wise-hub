<!-- src/components/controls/RealtimeLog.vue -->
<template>
    <div>
        <p v-if="loading" class="text-center">
            <font-awesome-icon :icon="loadingIcon" spin /> Loading...
        </p>
        <div v-if="error.length > 0" class="alert alert-danger" role="alert">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </div>
        <ul class="list-group">
            <li v-for="entry in log" :key="entry.time"
                class="list-group-item"
            >
                {{ entry.msg }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import * as socketio from "socket.io-client";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";
import { DaemonLogEntry } from "../../api/DaemonLogEntry";
import { WiseApiHelper } from "../../api/WiseApiHelper";

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
    mounted() {
        const delegatorParam = this.delegator ? this.delegator.length > 0 ? this.delegator : undefined : undefined;
        const path = delegatorParam ? "/delegator/" + delegatorParam : "/general";
        const socketIoUrl = window.location.protocol + "//" + window.location.hostname + ":" + realtimePort + path;
        console.log("socketIoUrl = " + socketIoUrl);
        io = socketio(socketIoUrl);
        io.on("msg", (data: string) => {
            console.log(data);
            this.log.unshift(JSON.parse(data));
            if(this.log.length > 100) this.log.pop();
        });

        this.loading = true;
        this.error = "";
        (async () => {
            try {
                const entries: DaemonLogEntry [] = await WiseApiHelper.getLog(delegatorParam);
                this.log = entries;
                this.error = "";
                this.loading = false;
            }
            catch (error) {
                this.error = error + "";
                this.loading = false;
            }
        })();
    },
    beforeDestroy() {
        if (io) {
            io.close();
            io = undefined;
        }
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
