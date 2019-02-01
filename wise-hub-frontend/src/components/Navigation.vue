<!-- src/components/Navigation.vue -->
<template>
    <b-navbar id="navigation-component" toggleable="md" type="light">
        <b-navbar-toggle class="main-nav-toggler" :target="uuid + '-main_nav_collapse'"></b-navbar-toggle>

        <b-collapse is-nav :id="uuid + '-main_nav_collapse'" class="main-nav-collapser">

            <b-navbar-nav>
                <b-nav-item-dropdown v-if="username.length > 0">
                    <template slot="button-content">
                        <em><span class="d-inline-block">@</span>{{ username }}</em>
                    </template>
                    <b-dropdown-item :to="'/@' + username" exact>History</b-dropdown-item>
                    <b-dropdown-item :to="'/@' + username + '/rulesets'" exact>Rulesets by you</b-dropdown-item>
                    <b-dropdown-item :to="'/rulesets/for/@' + username" exact>Rulesets for you</b-dropdown-item>
                    <b-dropdown-item :to="'/@' + username + '/daemon'" exact>Daemon</b-dropdown-item>
                </b-nav-item-dropdown>
                <li class="nav-item">
                    <router-link class="nav-link t-navlink-history" to="/" exact>
                        <font-awesome-icon :icon="trendingIcon" /> History
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link  t-navlink-people" to="/people">
                        <font-awesome-icon :icon="peopleIcon" /> People
                    </router-link>
                </li>
                <li class="nav-item">
                    <a class="nav-link t-navlink-votingpage" :href="votingPageUrl" target="_blank" rel="nofollow noopener">
                        <font-awesome-icon :icon="voteIcon" /> Vote
                    </a>
                </li>
                <li class="nav-item">
                    <a :href="manualUrl" class="nav-link t-navlink-manual" target="_blank" rel="nofollow noopener">
                        <font-awesome-icon :icon="manualIcon" /> Manual
                    </a>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link t-navlink-daemon" to="/daemon">
                        <font-awesome-icon :icon="trendingIcon" /> Status
                    </router-link>
                </li>
            </b-navbar-nav>
        </b-collapse>

        <account-button />
    </b-navbar>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../icons";
import { s } from "../store/store";
import { uniqueId } from "../util/util";

import AccountButton from "./controls/account/AccountButton.vue";

export default Vue.extend({
    props: [],
    data() {
        return {
            uuid: uniqueId(),
            manualUrl: /*§ §*/ "https://docs.wise.vote/introduction" /*§ ' "' + data.config.manual.url.production + '" ' §.*/,
            votingPageUrl: "/voting-page/"
        };
    },
    methods: {
    },
    computed: {
        username(): string {
            return s(this.$store).state.auth.username || "";
        },
        delegateIcon() { return icons.delegator; },
        voteIcon() { return icons.voter; },
        trendingIcon() { return icons.read; },
        manualIcon() { return icons.manual; },
        peopleIcon() { return icons.people; },
        externalLinkIcon() { return icons.externalLink; },
    },
    components: {
        AccountButton,
    },
});
</script>

<style>
#navigation-component {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.1);
}

#navigation-component .nav-item .router-link-active {
    color: rgba(0, 0, 0, 0.9);
}

#navigation-component .nav-item .nav-link {
    padding-left: 1rem;
    padding-right: 1rem;
    text-align: center; /* center icons on sm screen */
}

#navigation-component .show .nav-item .nav-link,
#navigation-component .collapsing .nav-item .nav-link {
    text-align: left;
    padding: 1rem;
}

#navigation-component .main-nav-toggler {
}

#navigation-component .main-nav-collapser.show,
#navigation-component .main-nav-collapser.collapsing {
    margin-bottom: 1rem;
}
</style>
