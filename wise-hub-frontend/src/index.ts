/* tslint:disable no-console */
import Wise from "steem-wise-core";
import { Log } from "./Log";
import { BuildContext } from "./BuildContext";
import { WindowContext } from "./WindowContext";
import { SessionRedirect } from "./api/SessionRedirect";

/**
 * Configuration
 */
const repoUrl =
        /*§ §*/ "wise-team/wise-hub" /*§ ' "' + data.config.repository.github.organization + '/' + data.repository.name + '" ' §.*/;
console.log("Steem-wise-hub. This is open source software: https://github.com/" + repoUrl);
BuildContext.failIfMissing();
WindowContext.failIfMissing();
console.log("steem-wise-hub version: " + BuildContext.VERSION + ". Built at " + BuildContext.BUILDDATETIME);
console.log("steem-wise-core version: " + Wise.getVersion());
console.log("Hosted in environment type: " + WindowContext.ENVIRONMENT_TYPE);

if (window.location.hostname === "localhost") {
    (window as any).WISE_LOG_LEVEL = "debug";
    console.log("Localhost detected. Setting window.WISE_LOG_LEVEL=" + (window as any).WISE_LOG_LEVEL);
}
Log.log().init();

/**
 * Import Vue & dependencies
 */
import Vue from "vue";
import VueRouter from "vue-router";
import BootstrapVue from "bootstrap-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VueNotification from "vue-notification";

/**
 * Import components
 */
import App from "./components/App.vue";
import { store, Actions } from "./store/store";
import HistoryView from "./components/history/HistoryView.vue";
import DaemonView from "./components/daemon/DaemonView.vue";
import DelegateView from "./components/delegate/DelegateView.vue";
import NotFoundView from "./components/views/NotFoundView.vue";
import RulesetsView from "./components/rulesets/RulesetsView.vue";
import AccountView from "./components/account/AccountView.vue";
import PeopleView from "./components/people/PeopleView.vue";

/**
 * Import global css
 */
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "./style.css";

/**
 * Initialize dependencies
 */
Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(VueNotification);
Vue.component("font-awesome-icon", FontAwesomeIcon);

// Error handling:
Vue.config.errorHandler = function(err, vm, info) {
    console.error(err);
    Vue.notify({ title: "Error", type: "error", text: err + "" });
};

/**
 * Start app
 */
const router = new VueRouter({
    mode: window.location.hostname === "localhost" ? "hash" : "history",
    routes: [
        // history
        { path: "/", component: HistoryView },
        // { path: '/history/:moment?', component: ReadView },
        { path: "/daemon", component: DaemonView },
        //account views
        { path: "/@:account", component: AccountView }, // => account history, and links to daemon and rulesets
        { path: "/@:account/daemon", component: DelegateView }, // => account daemon

        // { path: '/delegate', component: DelegateView }
        { path: "/@:delegator/rulesets", component: RulesetsView },
        { path: "/@:delegator/rulesets/for/@:voter", component: RulesetsView },
        { path: "/rulesets/for/@:voter", component: RulesetsView },
        { path: "/people", component: PeopleView }, // => list of wise users

        { path: "*", component: NotFoundView },
    ],
    scrollBehavior(to, from, savedPosition) {
        return { x: 0, y: 0 };
    },
});

const v = new Vue({
    el: "#app",
    store: store,
    router: router,
    render: h => h(App),
    mounted: function() {
        this.$nextTick(() => {
            const redirect = SessionRedirect.getCurrentRedirect();
            if (redirect) router.push({ path: redirect.path, query: redirect.query });
        });
    },
});

// initialize steemconnect & eventually login automatically
v.$store.dispatch(Actions.initialize);
