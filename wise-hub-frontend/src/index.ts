/* tslint:disable no-console */

declare const __VERSION__: string;
console.log("steem-wise-hub version: " + __VERSION__);

const repoUrl = /*§ "\"" + d(data.config.githubOrgName) + "/" + d(data.repository.name) + "\"" §*/"wise-team/wise-hub"/*§§.*/;

console.log("This is open source software: https://github.com/" + repoUrl);

/**
 * Import Vue & dependencies
 */
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";


/**
 * Import components
 */
import store from "./store/store";
import App from "./components/App.vue";
import { queryParams } from "./util/url-util";

/**
 * Import global css
 */
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "./style.css";
import { Actions } from "./store/actions";


/**
 * Initialize dependencies
 */
Vue.use(BootstrapVue);

/**
 * Start app
 */
const v = new Vue({
    el: "#app",
    store: store,
    render: h => h(App),
});

// initialize steemconnect & eventually login automatically
// v.$store.dispatch(Actions.initialize);
