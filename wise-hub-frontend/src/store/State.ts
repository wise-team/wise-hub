import { SetRules } from "steem-wise-core";
import { SteemConnectApiHelper } from "../api/SteemConnectApiHelper";
import { SteemConnectData } from "../api/SteemConnectData";

export interface State {
    steemConnectData: SteemConnectData;
}

export const persistentPaths: string [] = [
];

export const initialState: State = { // this is used for "form reset" button
    steemConnectData: SteemConnectApiHelper.getInitialState(),
};

export const state: State = initialState;
