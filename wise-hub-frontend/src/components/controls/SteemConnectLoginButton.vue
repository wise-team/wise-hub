<!-- src/components/controls/SteemConnectLoginButton.vue -->
<template>
        <span class="steemconnect-container">
            <span v-if="isLoggedIn">
                <strong>{{ username }}</strong>
                <b-button class="steemconnect-logout-button" size="sm" variant="link"
                     @click="logout" title="Log out from SteemConnect">
                    Log out from SteemConnect
                </b-button>
            </span>
            <span v-else>
                <a :href="loginUrl">
                    Login with SteemConnect
                </a>
            </span>
            <span class="steemconnect-error-msg">{{ errorMessage }}</span>
        </span>
</template>

<script lang="ts">
import Vue from "vue";
import { SteemConnectApiHelper } from "../../store/modules/steemconnect/SteemConnectApiHelper";
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
        username(): string {
            return d(s(this.$store).state.steemConnect).account ?
                d(s(this.$store).state.steemConnect.account).name : "(loading account...)";
        },
    },
});
</script>

<style>
.steemconnect-container {
    color: #999;
}

.steemconnect-error-msg {
    color: red;
}
</style>
