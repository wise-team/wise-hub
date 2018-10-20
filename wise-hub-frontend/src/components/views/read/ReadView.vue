<!-- src/components/views/read/ReadView.vue -->
<template>
    <b-container fluid id="trending-view">
        <b-row>
            <b-col cols="12" md="8">
                <h2>Activity</h2>
                <p v-if="isLoading" class="text-center">
                    <font-awesome-icon :icon="loadingIcon" spin /> Loading activity...
                </p>
                <p v-if="error.length > 0" class="card-text text-danger">
                    <font-awesome-icon :icon="errorIcon" /> Sorry. Could not load activity: {{ error }}
                </p>
                <b-table v-if="!isLoading && error.length == 0" striped hover :items="operationsTable">
                    <span slot="time" slot-scope="data" v-html="data.value">     
                    </span>
                    <span slot="operation" slot-scope="data" v-html="data.value">     
                    </span>
                </b-table>
            </b-col>
            <b-col cols="12" md="4">
                <span v-if="accountName.length > 0">
                    <account-status-widget :account="accountName" />
                </span>
                <span v-else>
                    <general-status-widget />
                </span>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { StatusModule } from "../../../store/modules/status/StatusModule";
import { data as wise } from "../../../wise-config.gen";
import { s } from "../../../store/store";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../../util/util";

import AccountStatusWidget from "./AccountStatusWidget.vue";
import GeneralStatusWidget from "./GeneralStatusWidget.vue";

function accountIconImg(accountName: string): string {
    return "<img class=\"avatar-in-text\" src=\"https://steemitimages.com/u/" + accountName + "/avatar\" alt=\"@" + accountName + " avatar\" />";
};

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        accountName(): string {
            return d(s(this.$store).state.steemConnect).account ? d(s(this.$store).state.steemConnect.account).name : "";
        },
        isLoading(): boolean {
            return s(this.$store).state.status.latestOperations.loading
        },
        error(): string {
            return assertString(d(s(this.$store).state.status.latestOperations.error));
        },
        operationsTable(): any [] {
            const table: any [] = [];
            const operations: StatusModule.WiseOperation [] =  s(this.$store).state.status.latestOperations.operations;

            operations.forEach(op => {
                let text = "";

                if (op.operation_type === "set_rules") {
                    text += accountIconImg(op.delegator) + " @" + op.delegator + " ";
                    if (op.data.rulesets.length > 0) text += "created rulesets: " + op.data.rulesets.join(", ");
                    else text += "removed all rulesets ";
                    text += "for " + accountIconImg(op.voter) + " @" + op.voter;
                }
                else if (op.operation_type === "send_voteorder") {
                    text += "" + accountIconImg(op.voter) + " @" + op.voter + " asked " + accountIconImg(op.delegator) + " @" + op.delegator + " to vote on ";
                    const articleLink = wise.config.hub.visual.read.lastActivity.articleLinkBase.split("{author}").join(op.data.author).split("{permlink}").join(op.data.permlink);
                    text += "<a href=\"" + articleLink + "\">" + op.data.author + "/" + op.data.permlink + "</a> ";
                    text += " with weight " + Math.round(op.data.weight/100) + "%";
                    text += " basing on ruleset named \"" + op.data.rulesetName + "\"";
                }
                else if (op.operation_type === "confirm_vote") {
                    text += "" + accountIconImg(op.delegator) + " @" + op.delegator + " ";
                    if (op.data.accepted) text += "accepted ";
                    else text += "rejected ";
                    text += "a voteorder sent by " + accountIconImg(op.voter) + " @" + op.voter + " in transaction #" + op.data.voteorderTxId;
                    if (!op.data.accepted) text += " with reason: " + op.data.msg;
                }
                else {
                    text += "Unknown operation type: " + op.operation_type;
                }
                text += ". ";

                text +=  "Transaction: <a rel=\"noopener noreferrer nofollow\" target=\"_blank\" href=\"" + wise.config.hub.visual.read.lastActivity.trxLinkBase.split("{trx}").join(op.transaction_id) + "\">"
                + "#" + op.transaction_id.substring(0, 8) + "..."
                + "</a>";
                table.push({
                    time: "<a title=\"" + op.timestamp + "\">" + timeDifferenceStr(Date.now(), new Date(op.timestamp).getTime()) + "</a>",
                    operation: text,
                });
            });

            return table;
        },
        loadingIcon() { return icons.loading; },
        errorIcon() { return icons.error; },
    },
    components: {
        AccountStatusWidget,
        GeneralStatusWidget,
    },
});
</script>

<style>
</style>
