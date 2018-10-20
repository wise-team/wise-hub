/* tslint:disable no-console */
import Wise from "steem-wise-core";
import { data as wise } from "./wise-config.gen";
import { d } from "./util/util";
import { Log } from "./Log";

declare const __VERSION__: string;
console.log("steem-wise-hub version: " + __VERSION__);
console.log("steem-wise-core version: " + Wise.getVersion());
const repoUrl = d(wise.config.repository.github.organization) + "/" + d(wise.repository.name) + "\"";
console.log("This is open source software: https://github.com/" + repoUrl);

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
import ReadView from "./components/views/read/ReadView.vue";
import VoteView from "./components/views/vote/VoteView.vue";
import DelegateView from "./components/views/delegate/DelegateView.vue";
import NotFoundView from "./components/views/NotFoundView.vue";
import RulesetsView from "./components/views/rulesets/RulesetsView.vue";
import RulesetsEditorView from "./components/views/rulesets-editor/RulesetsEditorView.vue";
import AccountView from "./components/views/account/AccountView.vue";
import TransactionDetailsView from "./components/views/transaction-details/TransactionDetailsView.vue";

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
Vue.component("font-awesome-icon", FontAwesomeIcon);

/**
 * Start app
 */
const router = new VueRouter({
    mode: (window.location.hostname === "localhost" ? "hash" : "history"),
    routes: [
        { path: '/', component: ReadView },
        { path: '/read/:moment?', component: ReadView },
        { path: '/vote', component: VoteView },
        { path: '/delegate', component: DelegateView },
        { path: '/@:delegator/rulesets', component: RulesetsView },
        { path: '/@:delegator/rulesets/for/@:voter', component: RulesetsView },
        { path: '/rulesets/for/@:voter', component: RulesetsView },
        { path: '/rulesets/for/@:voter/edit', component: RulesetsEditorView },
        { path: '/@:account', component: AccountView },
        { path: '/@:account/read/:moment?', component: AccountView },
        { path: '/tx/:transaction_id', component: TransactionDetailsView },
        
        { path: '*', component: NotFoundView }
    ]
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
