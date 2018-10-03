import Vue from "vue";
import Vuex, { GetterTree } from "vuex";
import { Module, ModuleTree, ActionTree, Dispatch, Commit } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { SteemConnectModule } from "./modules/steemconnect/SteemConnectModule";


Vue.use(Vuex);

declare const __VERSION__: string;
export const PERSISTENCE_LOCALSTORAGE_KEY = "steemwisehub_" + (__VERSION__ ? __VERSION__ : "");

/**
 * Root state types
 */
export interface State {
  
}
const state: State = {};

export class Actions {
  public static initialize: string = "initialize";
}
const actions: ActionTree<State, State> = {
  [Actions.initialize]: (
      { commit, dispatch, state }, payload?: {} | undefined,
  ): void => {
      dispatch(SteemConnectModule.Actions.initialize);
  },
};


/**
 * Modules
 */
export interface Modules {
  [SteemConnectModule.modulePathName]: Module<SteemConnectModule.State, State>;
}
const modules: Modules & ModuleTree<State> = {
  [SteemConnectModule.modulePathName]: SteemConnectModule.steemConnectModule
};

const persistentPaths: string [] = [];
SteemConnectModule.persistentPaths.forEach(persistentPath => persistentPaths.push(SteemConnectModule.modulePathName+ "." + persistentPath));



/**
 * Store type guard
 */
export interface Store {
  state: {
    [SteemConnectModule.modulePathName]: SteemConnectModule.State;
  },
  dispatch: Dispatch,
  commit: Commit,
  getters: any
}

/**
 * This function allows proper store type resolution & guarding.
 * @param incognitoStore
 */
export function s(incognitoStore: any): Store {
  return incognitoStore as Store;
}



/**
 * Store
 */
export const store = new Vuex.Store<State>({
  state: state,
  actions: actions,
  modules: modules,
  plugins: [
    createPersistedState({
      key: PERSISTENCE_LOCALSTORAGE_KEY,
      paths: persistentPaths,
    }),
  ],
});
