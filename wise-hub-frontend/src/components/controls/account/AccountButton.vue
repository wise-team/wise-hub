<!-- src/components/controls/account/AccountButton.vue -->
<template>
    <!-- when user is logged in -->
    <b-navbar-nav v-if="isLoggedIn" class="ml-auto profile-button">
        <b-nav-item class="avatar-item">
            <div class="steem-avatar" v-if="accountOrEmpty.length > 0">
                <img :src="'https://steemitimages.com/u/' + accountOrEmpty + '/avatar'" alt="Voter avatar" />
            </div>
            <font-awesome-icon v-else :icon="loadingIcon" spin />

            <span class="steemconnect-error-msg">{{ errorMessage }}</span>
        </b-nav-item>
        <b-nav-item-dropdown class="profile-section" right
        extra-toggle-classes="btn btn-secondary profile-section-toggle-btn"
        >
            <template slot="button-content">
                <em class="username">@{{ username }}</em>
            </template>
            <b-dropdown-item href="#">Settings</b-dropdown-item>
            <b-dropdown-item @click="logout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
    </b-navbar-nav>

    <!-- when user is not logged in -->
    <b-nav-form v-else class="justify-content-end">
        <span v-if="isLoading"><font-awesome-icon :icon="loadingIcon" spin />&nbsp;</span>
        <b-form-input class="account-username-input" 
            type="text" placeholder="Steem account" 
            v-b-tooltip.hover title="Tell us who are you if you don't want to log in"
            v-model="usernameInputModel"
        ></b-form-input>
        <a class="btn btn-outline-secondary ml-2" :href="loginUrl" v-b-tooltip.hover title="Optional: SteemConnect login is not required">
            or SC login
        </a>
    </b-nav-form>
</template>

<script lang="ts">
import Vue from "vue";
import { icons } from "../../../icons";
import { SteemConnectModule } from "../../../store/modules/steemconnect/SteemConnectModule";
import { s } from "../../../store/store";
import { d } from "../../../util/util";
import { UserModule } from "../../../store/modules/user/UserModule";

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
        isLoading(): boolean {
            return s(this.$store).getters[UserModule.Getters.isLoading];
        },
        usernameInputModel: {
            get(): string {
                const accountName = s(this.$store).state.user.username;
                return accountName.length > 0 ? ("@" + s(this.$store).state.user.username) : "";
            },
            set(value: string): void {
                s(this.$store).dispatch(UserModule.Actions.setUsername, { 
                    username: value ? value.replace(/@/iu, "") : ""
                });
            }
        },
        isLoggedIn(): boolean {
            return s(this.$store).state.user.loggedIn
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
        loadingIcon() { return icons.loading; },
    },
});
</script>

<style>
.profile-button .avatar-item {
    display: none;
}

@media (min-width: 992px) { 
    .profile-button .avatar-item {
        display: list-item;
    }
}

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

.account-username-input {
    max-width: 7rem;
}

.profile-section-toggle-btn {
    color: white !important;
}
</style>