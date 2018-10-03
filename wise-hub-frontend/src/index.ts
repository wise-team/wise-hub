/* tslint:disable no-console */

declare const __VERSION__: string;
console.log("steem-wise-hub version: " + __VERSION__);
const repoUrl = /*§ "\"" + d(data.config.githubOrgName) + "/" + d(data.repository.name) + "\"" §*/"wise-team/wise-hub"/*§§.*/;
console.log("This is open source software: https://github.com/" + repoUrl);



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
import TrendingView from "./components/views/TrendingView.vue";
import VoteView from "./components/views/VoteView.vue";
import DelegateView from "./components/views/DelegateView.vue";


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
    routes: [
        { path: '/', component: TrendingView },
        { path: '/vote', component: VoteView },
        { path: '/delegate', component: DelegateView },
    ]
});

const v = new Vue({
    el: "#app",
    store: store,
    router: router,
    render: h => h(App),
});

// initialize steemconnect & eventually login automatically
v.$store.dispatch(Actions.initialize);
