<!-- src/components/people/PersonComponent.vue -->
<template>
    <div class="person-component">
        <img class="avatar person-avatar" :src="'https://steemitimages.com/u/' + account + '/avatar'"
            :alt="'@' + account + ' avatar'" />
        
        <router-link :to="'/@' + account">
            <h4 class="mb-0">@{{ account }}</h4>
        </router-link>

        <p class="mb-1">
            <small><strong class="text-muted">{{ timeText }}</strong> <i>{{ didWhatText }}</i></small>
        </p>
        <p class="mb-0 text-right">
              <router-link :to="'/@' + account">History</router-link>
            | <router-link :to="'/@' + account + '/rulesets'">Rulesets by</router-link>
            | <router-link :to="'/rulesets/for/@' + account + ''">Rulesets for</router-link>
            | <router-link :to="'/@' + account + '/daemon'">Daemon</router-link>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { StatusModule } from "../../store/modules/status/StatusModule";
import { s } from "../../store/store";
import { d, assertString, formatBigInt, timeDifferenceStr } from "../../util/util";
import { EffectuatedWiseOperation, SendVoteorder, SetRules, ConfirmVote } from "steem-wise-core";

const articleLinkBase = /*§ §*/ "https://steemit.com/@{author}/{permlink}" /*§ ' "' + data.config.hub.visual.read.lastActivity.articleLinkBase + '" ' §.*/;
const trxLinkBase = /*§ §*/ "https://steemd.com/tx/{trx}" /*§ ' "' + data.config.hub.visual.read.lastActivity.trxLinkBase + '" ' §.*/;

export default Vue.extend({
    props: {
        op: {
            type: Object as () => EffectuatedWiseOperation
        }
    },
    data() {
        return {
            now: new Date
        };
    },
    methods: {
    },
    computed: {
        account(): string {
            return SendVoteorder.isSendVoteorder(this.op.command)? this.op.voter : this.op.delegator;
        },
        didWhatText(): string {
            if (SetRules.isSetRules(this.op.command)) {
                return "Set rules for @" + this.op.voter
            }
            else if (ConfirmVote.isConfirmVote(this.op.command)) {
                return "Confirmed vote by @" + this.op.voter
            }
            else if (SendVoteorder.isSendVoteorder(this.op.command)) {
                return "Send a voteorder to @" + this.op.delegator
            }
            else return "Unknown operation type"
        },
        timeText(): string {
            return timeDifferenceStr(Date.now(), new Date(this.op.timestamp).getTime());
        },
    },
    components: {
    },
});
</script>

<style>
.person-avatar {
    height: 5rem;
    float: left;
    margin-right: 1rem;
    margin-bottom: 0.2rem;
}

.person-component h5 {

}
</style>
