<!-- src/components/people/HistoryEntryComponent.vue -->
<template>
    <b-row class="history-entry">
        <b-col cols="2" md="4">
            <div class="role-elem p-1">
                <font-awesome-icon :icon="delegateIcon" />
                <img class="avatar history-avatar" :src="'https://steemitimages.com/u/' + op.delegator + '/avatar'"
                    :alt="'@' + op.delegator + ' avatar'" />
            </div>
            <div class="role-elem p-1">
                <font-awesome-icon :icon="voteIcon" />
                <img class="avatar history-avatar" :src="'https://steemitimages.com/u/' + op.voter + '/avatar'"
                    :alt="'@' + op.voter + ' avatar'" />
            </div>
        </b-col>
        <b-col>
            <em class="text-muted history-log-time">{{ timeText }}</em><br />
            <span v-if="isSetRules">
                <h5>
                    <router-link :to="'/@' + op.delegator">@{{ op.delegator }}</router-link>
                    set rules for
                    <router-link :to="'/@' + op.voter">@{{ op.voter }}</router-link>
                </h5>
                <p class="my-0">@{{ op.voter }} can now vote with following rulesets:</p>
                <ul>
                    <li v-for="ruleset in op.command.rulesets" :key="ruleset.name">{{ ruleset.name }}</li>
                </ul>
                <router-link :to="'/@' + op.delegator + '/rulesets/for/@' + op.voter">View the rulesets</router-link>
            </span>
            <span v-else-if="isSendVoteorder">            
                <h5>
                    <router-link :to="'/@' + op.voter">@{{ op.voter }}</router-link>
                    asked
                    <router-link :to="'/@' + op.delegator">@{{ op.delegator }}</router-link>
                    to vote
                </h5>

                <p class="my-0">
                    Author: {{ op.command.author }}<br />
                    Permlink: {{ op.command.permlink }}<br />
                    <a :href="'https://steemit.com/' + op.command.author + '/' + op.command.permlink">See the post</a>
                </p>
            </span>
            <span v-else>
                <h5 v-if="op.command.accepted">
                    <router-link :to="'/@' + op.delegator">@{{ op.delegator }}</router-link>
                    confirmed 
                    <router-link :to="'/@' + op.voter">@{{ op.voter }}</router-link>'s
                    vote
                </h5>
                <h5 v-else>
                    <router-link :to="'/@' + op.delegator">@{{ op.delegator }}</router-link>
                    rejected 
                    <router-link :to="'/@' + op.voter">@{{ op.voter }}</router-link>'s
                    vote order
                </h5>

                <p v-if="!op.command.accepted" class="text-danger">Reject reason: {{ op.command.msg }}</p>
                <a :href="'https://steemd.com/tx/' + op.command.voteorderTxId">See the voteorder transaction</a>

            </span>
            
            <p class="text-right my-0">
                <em class="text-muted history-log-time">
                    Block
                    <a :href="'https://steemd.com/b/' + op.moment.blockNum">{{ op.moment.blockNum }}</a>.
                    View
                    <a :href="'https://steemd.com/tx/' + op.transaction_id">transaction</a>.
                </em>
            </p>
        </b-col>
    </b-row>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { StatusModule } from "../../store/modules/status/StatusModule";
import { s } from "../../store/store";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";
import { DaemonLogEntry } from "../../api/DaemonLogEntry";
import { EffectuatedWiseOperation, SetRules, ConfirmVote, SendVoteorder } from "steem-wise-core";

export default Vue.extend({
    props: {
        op: {
            type: Object as () => EffectuatedWiseOperation
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
            if (this.op.timestamp) {
                // return timeDifferenceStr(Date.now(), new Date(this.entry.time).getTime());
                return new Date(this.op.timestamp).toUTCString() + "";
            }
            else return "";
        },
        isSetRules(): boolean {
            return SetRules.isSetRules(this.op.command);
        },
        isSendVoteorder(): boolean {
            return SendVoteorder.isSendVoteorder(this.op.command);
        },
        isConfirmVote(): boolean {
            return ConfirmVote.isConfirmVote(this.op.command);
        },
        delegateIcon() { return icons.delegator; },
        voteIcon() { return icons.voter; },
    },
    components: {
    },
});
</script>

<style>
.history-entry {

}

.history-entry .role-elem {
    position: relative;
    width: 4.7rem;
    display: inline-block;
}

.history-entry .role-elem svg {
    color: #6b11ff;
    position: absolute;
    left: 0;
    top: 0;
}

.history-avatar {
    width: 100%;
}

.history-log-time {
    display: inline-block;
    font-size: 75%;
}
</style>
