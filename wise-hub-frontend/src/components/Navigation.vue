<!-- src/components/Navigation.vue -->
<template>
    <b-navbar id="navigation-component" toggleable="md" type="light">
        <b-navbar-toggle class="main-nav-toggler" :target="uuid + '-main_nav_collapse'"></b-navbar-toggle>

        <b-collapse is-nav :id="uuid + '-main_nav_collapse'" class="main-nav-collapser">

            <b-navbar-nav>
                <li class="nav-item" v-if="username.length > 0">
                    <router-link class="nav-link" :to="'/@' + username">
                        <em><span class="d-inline-block">@</span>{{ username }}</em>
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/">
                        <font-awesome-icon :icon="trendingIcon" /> Read
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/vote">
                        <font-awesome-icon :icon="voteIcon" /> Vote
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/delegate">
                        <font-awesome-icon :icon="delegateIcon" /> Delegate
                    </router-link>
                </li>
                <li class="nav-item">
                    <a :href="manualUrl" class="nav-link" target="_blank" rel="nofollow noopener">
                        <font-awesome-icon :icon="manualIcon" /> Manual <!--<sup><font-awesome-icon :icon="externalLinkIcon" /></sup>-->
                    </a>
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
            manualUrl: /*§ §*/ "https://wise.vote/introduction" /*§ ' "' + data.config.manual.url.production + '" ' §.*/
        };
    },
    methods: {
    },
    computed: {
        username(): string {
            return s(this.$store).state.user.username || "";
        },
        delegateIcon() { return icons.delegator; },
        voteIcon() { return icons.voter; },
        trendingIcon() { return icons.read; },
        manualIcon() { return icons.manual; },
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
