import * as _ from "lodash";

import { State, initialState } from "./State";
import { SetRules } from "steem-wise-core";
import { SteemConnectData } from "../api/SteemConnectData";

export class Mutations {
    public static setSteemConnectData = "setSteemConnectData";
}

export const mutations = {
    [Mutations.setSteemConnectData](
        state: State, payload: SteemConnectData,
    ) {
        state.steemConnectData = payload;
    },
};
