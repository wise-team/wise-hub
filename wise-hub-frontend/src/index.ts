/* tslint:disable no-console */
import Wise, { EffectuatedSetRules } from "steem-wise-core";
import { d } from "./util/util";
import { Log } from "./Log";
import { BuildContext } from "./BuildContext";


/**
 * Configuration
 */
const repoUrl = /*§ §*/ "wise-team/wise-hub" /*§ ' "' + data.config.repository.github.organization + '/' + data.repository.name + '" ' §.*/;
console.log("Steem-wise-hub. This is open source software: https://github.com/" + repoUrl);
BuildContext.failIfMissing();
WindowContext.failIfMissing();
console.log("steem-wise-hub version: " + BuildContext.VERSION);
console.log("steem-wise-core version: " + Wise.getVersion());
console.log("Hosted in environment type: " + WindowContext.ENVIRONMENT_TYPE);

if (window.location.hostname === "localhost") {
    (window as any).WISE_LOG_LEVEL = "debug";
    console.log("Localhost detected. Setting window.WISE_LOG_LEVEL=" + (window as any).WISE_LOG_LEVEL);
    Log.log().init();
}



/**
 * Import Vue & dependencies
 */
import Vue from "vue";
import VueRouter from "vue-router";
import BootstrapVue from "bootstrap-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

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
import { WindowContext } from "./WindowContext";

/**
 * Initialize dependencies
 */
Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.component("font-awesome-icon", FontAwesomeIcon);

/**
 * Start app
 */
const router = new VueRouter({
    mode: (window.location.hostname === "localhost" ? "hash" : "history"),
    routes: [
        // history
        { path: '/', component: HistoryView },
        // { path: '/history/:moment?', component: ReadView },
        { path: '/daemon', component: DaemonView },
        //account views
        { path: '/@:account', component: AccountView }, // => account history, and links to daemon and rulesets
        { path: '/@:account/daemon', component: DelegateView }, // => account daemon

        // { path: '/delegate', component: DelegateView }
        { path: '/@:delegator/rulesets', component: RulesetsView },
        { path: '/@:delegator/rulesets/for/@:voter', component: RulesetsView },
        { path: '/rulesets/for/@:voter', component: RulesetsView },
        { path: '/people', component: PeopleView }, // => list of wise users
        
        { path: '*', component: NotFoundView }
    ],
    scrollBehavior (to, from, savedPosition) {
        return { x: 0, y: 0 }
    }
});

const v = new Vue({
    el: "#app",
    store: store,
    router: router,
    render: h => h(App),
});

Log.log().init();

// initialize steemconnect & eventually login automatically
v.$store.dispatch(Actions.initialize);
