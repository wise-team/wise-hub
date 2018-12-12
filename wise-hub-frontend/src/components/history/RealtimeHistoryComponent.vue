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
            <history-entry-component v-for="op in messages" :key="op.id" :op="op" class="py-2 rounded border mb-2" />
        </b-container>

        <p class="text-right">
            <small> Wise history /@{{ account }} </small>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { s, State } from "../../store/store";
import { icons } from "../../icons";
import * as socketio from "socket.io-client";
import { d, assertString, formatBigInt, timeDifferenceStr, uniqueId } from "../../util/util";
import { DaemonLogEntry } from "../../api/DaemonLogEntry";
import { WiseApiHelper } from "../../api/WiseApiHelper";

import HistoryEntryComponent from "./HistoryEntryComponent.vue";
import { EffectuatedWiseOperation } from "steem-wise-core";
import { RealtimeModule } from "../../store/modules/realtime/RealtimeModule";
import { WindowContext } from "../../WindowContext";
import { WiseSQLApi, WiseSQLProtocol } from "steem-wise-core";

export default Vue.extend({
    props: [ "account" ],
    data() {
        return {
        };
    },
    watch: {
        account: function (account: string, oldAccount: string) {
            this.reload();
        },
    },
    created: function () {
        this.reload()
    },
    methods: {
        reload() {
            const realtimeParams: RealtimeModule.Params = {
                socketIoURI: "/",
                socketIoOpts: {
                    query: {
                        delegator: "",
                    },
                    rejectUnauthorized: false,
                    path: "/realtime/socket.io"
                },
                tailLength: 60,
                preloadFn: async () => await WiseSQLProtocol.Handler.query(
                    { endpointUrl: WindowContext.WISE_SQL_ENDPOINT_URL, path: "/operations", method: "get", limit: 60,
                    params: ( this.account && this.account.length > 0 ?
                          { order: "moment.desc", or: "(voter.eq." + this.account + ",delegator.eq." + this.account + ")"}
                        : { order: "moment.desc" }
                    )}
                ),
                preloadPreprocess: (entry: any) => {
                    return { ...entry as EffectuatedWiseOperation, id: uniqueId() }; // load for everyone
                },
                messagePreprocess: (msg: object) => {
                    const entry: DaemonLogEntry = msg as any;
                    if (entry.wiseOp) { // only wise operations
                        if (this.account && this.account.length > 0) {
                            if (this.account !== entry.wiseOp.delegator && this.account !== entry.wiseOp.voter) {
                                return;
                            }
                        }
                        return { ...entry.wiseOp, id: uniqueId() };
                    }
                    return undefined;
                }
            };
            s(this.$store).dispatch(RealtimeModule.Actions.setParams, realtimeParams);
        }
    },
    computed: {
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
        ...mapState({
            loading: (state: State) => state.realtime.status.loading || state.realtime.status.connecting,
            error: (state: State) => state.realtime.status.error,
            messages: (state: State) => state.realtime.messages,
        })
    },
    components: {
        HistoryEntryComponent
    },
});
</script>

<style>
</style>
