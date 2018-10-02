/* tslint:disable no-empty no-console */
import { ActionTree } from "vuex";
import { State } from "./State";
import { Api } from "../api/Api";
import { SetRules, SendVoteorder, Ruleset } from "steem-wise-core";
import { SteemConnectApiHelper } from "../api/SteemConnectApiHelper";
import { SteemConnectData } from "../api/SteemConnectData";
import { Promise } from "bluebird";
import { Mutations } from "./mutations";
import { PERSISTENCE_LOCALSTORAGE_KEY } from "./store";
import { queryParams } from "../util/url-util";

export class Actions {

}

export const actions: ActionTree<State, State> = {

};
