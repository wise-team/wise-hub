<!-- src/components/views/read/AccountStatusWidget.vue -->
<template>
    <span class="account-status-widget">
        <b-card
            :title="'' + account.charAt(0).toUpperCase() + account.slice(1) + ' and Wise'"
            tag="article"
        >
            <p class="card-text you-and-wise">
                <img :src="'https://steemitimages.com/u/' + account + '/avatar'" alt="Your avatar" class="avatar" />
                <img src="/assets/images/wise/full-color-emblem.svg" alt="Wise logo" class="wise" />
            </p>
            <p class="card-text">
                <i>Who are you for the Wise?</i>
            </p>
            <p class="card-text">
                <loadable-icon-phrase-control 
                    :loading="isLoadingVoting" loadingText="Are you a voter? (loading...)"
                    :value="isVoting" :yesIcon="yesIcon" :noIcon="noIcon" :error="isVotingError"
                    yesText="You are a Wise Voter. An expert!"
                    noText="You are not a voter. Would you like to become one?"
                >
                    <router-link :to="'/rulesets/for/@' + username">Check rulesets for you</router-link>, 
                    <a :href="votingPageUrl">Vote with wise</a>
                </loadable-icon-phrase-control>
            </p>
            <p class="card-text">
                <loadable-icon-phrase-control 
                    :loading="isLoadingDelegating" loadingText="Are you a delegator? (loading...)"
                    :value="isDelegating" :yesIcon="yesIcon" :noIcon="noIcon" :error="isDelegatingError"
                    yesText="You are a Wise Delegator. The community is proud of you!"
                    noText="You are not yet a delegator. Would you like to learn how to delegate?"
                >
                    <router-link :to="'/@' + username + '/rulesets'">Create rulesets</router-link> 
                </loadable-icon-phrase-control>
            </p>
            <p class="card-text">
                <loadable-icon-phrase-control 
                    :loading="isLoadingSupporting" :loadingText="'Are you supporting us by voting for the @' + witnessName + ' witness? (loading...)'"
                    :value="isSupporting" :yesIcon="yesIcon" :noIcon="noIcon" :error="isSupportingError"
                    :yesText="'Thank you for supporting us by voting for @' + witnessName + ' witness.'"
                    :noText="'You are not supporting us yet. Would you like to vote for @' + witnessName + 'witness?'"
                >
                    <a :href="witnessVoteUrl">Vote for @{{ witnessName }}</a>
                </loadable-icon-phrase-control>
            </p>
            <p class="card-text">
                <small>Need help? Check the <a :href="manualUrl">manual</a> for more instructions!</small>
            </p>        
        </b-card>
    </span>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../icons";
import { s } from "../../store/store";
import { d } from "../../util/util";

import LoadableIconPhraseControl from "../controls/PhraseWithIconLoadable.vue";

export default Vue.extend({
    props: [ "account" ],
    data() {
        return {
            manualUrl: /*§ §*/ "https://docs.wise.vote/introduction" /*§ ' "' + data.config.manual.url.production + '" ' §.*/,
            votingPageUrl: /*§ '"' + data.config.votingPage.url.production + '"' §*/"https://wise.vote/voting-page/"/*§ §.*/,
            witnessName: /*§ '"' + data.config.witness.account + '"' §*/"wise-team"/*§ §.*/,
            witnessVoteUrl: /*§ '"' + data.config.urls.voteForWitness + '"' §*/"https://steemit.com/~witnesses"/*§ §.*/
        };
    },
    methods: {
    },
    computed: {
        yesIcon() { return icons.ok; },
        noIcon() { return icons.notice; },
        loadingIcon() { return icons.loading; },
        username(): string {
            return d(s(this.$store).state.auth.username);
        },
        isLoadingVoting(): boolean {
            return s(this.$store).state.status.accountStats.voting.loading;
        },
        isVoting(): boolean {
            return s(this.$store).state.status.accountStats.voting.value;
        },
        isVotingError(): string {
            return s(this.$store).state.status.accountStats.voting.error;
        },
        isLoadingDelegating(): boolean {
            return s(this.$store).state.status.accountStats.delegating.loading;
        },
        isDelegating(): boolean {
            return s(this.$store).state.status.accountStats.delegating.value;
        },
        isDelegatingError(): string {
            return s(this.$store).state.status.accountStats.delegating.error;
        },
        isLoadingSupporting(): boolean {
            return s(this.$store).state.status.accountStats.supporting.loading;
        },
        isSupportingError(): string {
            return s(this.$store).state.status.accountStats.supporting.error;
        },
        isSupporting(): boolean {
            return s(this.$store).state.status.accountStats.supporting.value;
        },
    },
    components: {
        LoadableIconPhraseControl
    },
});
</script>

<style>
.you-and-wise {
    text-align: center;
    width: 100%;
}

.you-and-wise img {
    display: inline-block;
    height: 4rem;
}

@media (min-width: 992px) { 
    .you-and-wise img {
        height: 6rem;
    }
}

.you-and-wise .avatar {
    border-radius: 50%;
    right: -1.5rem;
    z-index: 10;
    position: relative;
}

.you-and-wise .wise {
    position: relative;
    left: -1.5rem;
    z-index: 5;
}
</style>
