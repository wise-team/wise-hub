<!-- src/components/controls/PrpfileButton.vue -->
<template>
    <b-navbar-nav class="ml-auto profile-button">
        <b-nav-item v-if="isLoggedIn">
            <div class="steem-avatar" v-if="accountOrEmpty.length > 0">
                <img :src="'https://steemitimages.com/u/' + accountOrEmpty + '/avatar'" alt="Voter avatar" />
            </div>
            <font-awesome-icon v-else :icon="loadingIcon" spin />

            <span class="steemconnect-error-msg">{{ errorMessage }}</span>
        </b-nav-item>
        <b-nav-item-dropdown v-if="isLoggedIn" class="profile-section">
            <template slot="button-content">
                <em class="username">@{{ username }}</em>
            </template>
            <b-dropdown-item href="#">Settings</b-dropdown-item>
            <b-dropdown-item @click="logout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
        <span v-if="!isLoggedIn">
            <a class="btn btn-secondary" :href="loginUrl">
                Login with SteemConnect
            </a>
        </span>
    </b-navbar-nav>
</template>

<script lang="ts">
import Vue from "vue";
import faSpinner from "@fortawesome/fontawesome-free-solid/faSpinner";
import { SteemConnectModule } from "../../store/modules/steemconnect/SteemConnectModule";
import { s } from "../../store/store";
import { d } from "../../util/util";

export default Vue.extend({
    props: [],
    data() {
        return {
        };
    },
    methods: {
        logout() {
            s(this.$store).dispatch(SteemConnectModule.Actions.logout);
        },
    },
    computed: {
        isLoggedIn(): boolean {
            return s(this.$store).getters[SteemConnectModule.Getters.isLoggedIn];
        },
        loginUrl(): string {
            return s(this.$store).getters[SteemConnectModule.Getters.getLoginUrl];
        },
        errorMessage(): string {
            return s(this.$store).state.steemConnect.error ? d(s(this.$store).state.steemConnect.error) : "";
        },
        accountOrEmpty(): string {
            return d(s(this.$store).state.steemConnect).account ?
                d(s(this.$store).state.steemConnect.account).name : "";
        },
        username(): string {
            return d(s(this.$store).state.steemConnect).account ?
                d(s(this.$store).state.steemConnect.account).name : "(loading account...)";
        },
        loadingIcon() { return faSpinner; },
    },
});
</script>

<style>
.profile-button .steem-avatar {
    height: 1rem;
    width: 4rem;
    position: relative;
}

.profile-button .steem-avatar img {
    position: absolute;
    left: 0;
    top: -1.5rem;
    height: 4.5rem;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
}

.profile-button .profile-section a.nav-link {
    padding-left: 0.5rem !important;
}

.steemconnect-error-msg {
    color: red;
}
</style>
