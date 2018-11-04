<!-- src/components/account/DaemonSettingsComponent.vue -->
<template>
    <span>
        <h3>Daemon settings</h3>
        <p>
            <b-input-group size="lg">
                <b-input-group-text slot="prepend">
                    <strong :class="statusCssClass"><font-awesome-icon :icon="enabledControlIcon" /></strong>
                </b-input-group-text>

                <b-form-input disabled type="text" :value="statusText" :class="statusCssClass"></b-form-input>
                
                <b-input-group-append v-if="daemonEnabled">
                    <b-btn variant="danger" :disabled="loading" @click="showDisableDaemonAlert=true">Disable</b-btn>
                </b-input-group-append>
                <b-input-group-append v-else>
                    <b-btn variant="success" :disabled="loading" @click="showEnableDaemonAlert=true">Enable</b-btn>
                </b-input-group-append>
            </b-input-group>
        </p>

        <b-alert variant="danger"
             dismissible
             :show="showDisableDaemonAlert"
             @dismissed="showDisableDaemonAlert=false">
            <h4 class="alert-heading">Are you sure, you want to disable the daemon?</h4>
            <p>
                After disable you will be able to re-enable it at any time. However, the voteorders that
                are sent in the &quot;disabled&quot; period, will not be synchronized.
            </p>
            <p>
                <b-button size="lg" variant="danger" :disabled="loading" @click="disableDaemon">Disable my daemon</b-button>
            </p>
        </b-alert>

        <b-alert variant="secondary"
             dismissible
             :show="showEnableDaemonAlert"
             @dismissed="showEnableDaemonAlert=false">
            <h4 class="alert-heading" v-if="hasCorrectScope">Enable daemon</h4>
            <h4 class="alert-heading" v-else>Grant wiseHUB custom_json, vote and offline permissions</h4>

            <p v-if="hasCorrectScope">
                You have correct login scope. Just click the <em>enable</em> button.
            </p>
            <p v-else>
                Although you are correctly logged in with steemconnect, you have to grant additional permissions
                to wiseHUB daemon. It requires three permissions:
                <ul>
                    <li><strong>vote</strong> — to accept vote orders</li>
                    <li><strong>custom_json</strong> — to reject vote orders and change the rules</li>
                    <li><strong>offline</strong> — allows the daemon to work in the background when your browser is closed</li>
                </ul>
                Click the below button to grant this three permissions to wiseHUB.
            </p>
            <p v-if="!hasCorrectScope">
                <b-button size="lg" variant="success" 
                :href="scopeEscalationLoginUrl">Grant 3 permissions</b-button>
            </p>
            <p>
                <b-button size="lg" variant="success" 
                :disabled="loading || !hasCorrectScope" @click="enableDaemon">Enable my daemon</b-button>
            </p>
        </b-alert>

        <b-alert :show="loading" variant="primary">
            <font-awesome-icon :icon="loadingIcon" spin /> Saving the settings...
        </b-alert>
        <b-alert :show="success" variant="success">
            <font-awesome-icon :icon="successIcon" /> Settings saved.
        </b-alert>
    </span>
</template>

<script lang="ts">
import Vue from "vue";
import { s } from "../../store/store";
import { d, ucfirst } from "../../util/util";
import { User, UserSettings } from "../../store/modules/auth/User";
import { icons } from "../../icons";
import * as _ from "lodash";
import { AuthModule } from "../../store/modules/auth/AuthModule";
import { AuthModuleApiHelper } from "../../store/modules/auth/AuthModuleApiHelper";

export default Vue.extend({
    props: [],
    data() {
        return {
            loading: false,
            error: "",
            success: false,
            showDisableDaemonAlert: false,
            showEnableDaemonAlert: false
        };
    },
    methods: {
        disableDaemon() {
            (async () => {
                try {
                    this.loading = true;
                    this.error = "";
                    const newSettings = _.cloneDeep(d(this.settings));
                    newSettings.daemonEnabled = false;
                    await s(this.$store).dispatch(AuthModule.Actions.saveSettings, { settings: newSettings });
                    this.loading = false;
                    this.success = true;
                    this.showDisableDaemonAlert = false;
                }
                catch (error) {
                    this.error = "Error: " + error;
                }
            })();
        },
        enableDaemon() {
            (async () => {
                try {
                    this.loading = true;
                    this.error = "";
                    const newSettings = _.cloneDeep(d(this.settings));
                    newSettings.daemonEnabled = true;
                    await s(this.$store).dispatch(AuthModule.Actions.saveSettings, { settings: newSettings });
                    this.loading = false;
                    this.success = true;
                    this.showDisableDaemonAlert = false;
                }
                catch (error) {
                    this.error = "Error: " + error;
                }
            })();
        }
    },
    computed: {
        username(): string {
            return d(s(this.$store).state.auth.username);
        },
        user(): User {
            return d(s(this.$store).state.auth.user);
        },
        settings(): UserSettings {
            return d(d(s(this.$store).state.auth.user).settings);
        },
        daemonEnabled(): boolean {
            return d(this.settings.daemonEnabled);
        },
        statusText(): string {
            return this.daemonEnabled ? "Daemon enabled" : "Daemon disabled";
        },
        statusCssClass(): string {
            return this.daemonEnabled ? "text-success" : "text-danger";
        },
        hasCorrectScope() {
            const scope: string [] = this.user.scope;
            return scope.indexOf("custom_json") !== -1
                && scope.indexOf("vote") !== -1
                && scope.indexOf("offline") !== -1;

        },
        scopeEscalationLoginUrl() { return AuthModuleApiHelper.getLoginUrl(AuthModuleApiHelper.LoginScope_CUSTOM_JSON_VOTE_OFFLINE); },
        enabledControlIcon() { return this.daemonEnabled ? icons.enabled : icons.disabled; },
        loadingIcon() { return icons.loading; },
        successIcon() { return icons.success; },
        errorIcon() { return icons.error; },
    },
    components: {
    },
    filters: {
        ucfirst: ucfirst
    }
});
</script>

<style>

</style>
