<!-- src/components/controls/RealtimeLog.vue -->
<template>
    <div>
        <p v-if="loading" class="text-center">
            <font-awesome-icon :icon="loadingIcon" spin /> Loading...
        </p>
        <div v-if="error.length > 0" class="alert alert-danger" role="alert">
            <font-awesome-icon :icon="errorIcon" /> {{ error }}
        </div>
        
        <b-container fluid class="realtime-history-list">
            <history-entry-component v-for="op in log" :key="op.id" :op="op" class="p-2 rounded border mb-2" />
        </b-container>

        <p class="text-right">
            <small> Wise history /@{{ account }} </small>
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

import HistoryEntryComponent from "./HistoryEntryComponent.vue";
import { EffectuatedWiseOperation } from "steem-wise-core";

const realtimePort = /*§ data.config.hub.docker.services.realtime.port §*/8099/*§ §.*/;
let io: SocketIOClient.Socket | undefined;

export default Vue.extend({
    props: [ "account" ],
    data() {
        return {
            log: [] as EffectuatedWiseOperation [],
            loading: true,
            error: ""
        };
    },
    watch: {
        account: function (account: string, oldAccount: string) {
            console.log("Reload on account change to \"" + account + "\"");
            this.reload();
        },
    },
    created: function () {
        this.reload()
    },
    methods: {
        reload() {
            console.log("Initiate socket.io for realtime history");
            if (io) {
                io.close();
                io = undefined;
            }
            io = socketio("/", {
                query: {
                    delegator: "",
                },
                rejectUnauthorized: false,
                path: "/realtime/socket.io"
            });
            io.on("msg", (data: string) => {
                console.log("realtime_history_>" + data);
                const entry: DaemonLogEntry = JSON.parse(data);
                if (entry.wiseOp) { // only wise operations
                    if (this.account && this.account.length > 0) {
                        if (this.account !== entry.wiseOp.delegator && this.account !== entry.wiseOp.voter) {
                            return;
                        }
                    }
                    
                    entry.id = uniqueId();
                    this.log.unshift(entry.wiseOp);
                    if(this.log.length > 100) this.log.pop();
                }
            });

            this.loading = true;
            this.error = "";
            (async () => {
                try {
                    const entries: EffectuatedWiseOperation [] = await WiseApiHelper.getOperationsLog(this.account);
                    this.log = entries;
                    this.error = "";
                    this.loading = false;
                }
                catch (error) {
                    this.error = error + "";
                    this.loading = false;
                }
            })();
        }
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
        HistoryEntryComponent
    },
});
</script>

<style>
</style>
