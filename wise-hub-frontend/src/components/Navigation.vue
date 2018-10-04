<!-- src/components/Navigation.vue -->
<template>
    <b-navbar id="navigation-component" toggleable="md" type="light">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-collapse is-nav id="nav_collapse">

            <b-navbar-nav>
                <li class="nav-item">
                    <router-link class="nav-link" to="/"><font-awesome-icon :icon="trendingIcon" /> Trending</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/vote"><font-awesome-icon :icon="voteIcon" /> Vote</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/delegate"><font-awesome-icon :icon="delegateIcon" /> Delegate</router-link>
                </li>
            </b-navbar-nav>

            <profile-button />
        </b-collapse>
    </b-navbar>
</template>

<script lang="ts">
import Vue from "vue";
import faCrown from "@fortawesome/fontawesome-free-solid/faCrown";
import faAlignCenter from "@fortawesome/fontawesome-free-solid/faAlignCenter";
import faChessKnight from "@fortawesome/fontawesome-free-solid/faChessKnight";
import { s } from "../store/store";

import ProfileButton from "./controls/ProfileButton"

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        delegateIcon() { return faCrown; },
        voteIcon() { return faChessKnight; },
        trendingIcon() { return faAlignCenter; },
    },
    components: {
        ProfileButton,
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
}
</style>
