import Vue from "vue";
import Vuex, { GetterTree } from "vuex";
import { Module, ModuleTree, ActionTree, Dispatch, Commit } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { SteemConnectModule } from "./modules/steemconnect/SteemConnectModule";
import { SteemConnectModuleImpl } from "./modules/steemconnect/SteemConnectModuleImpl";
import { StatusModule } from "./modules/status/StatusModule";
import { StatusModuleImpl } from "./modules/status/StatusModuleImpl";


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
  [StatusModule.modulePathName]: Module<StatusModule.State, State>;
}
const modules: Modules & ModuleTree<State> = {
  [SteemConnectModule.modulePathName]: SteemConnectModuleImpl.steemConnectModule,
  [StatusModule.modulePathName]: StatusModuleImpl.module
};

const persistentPaths: string [] = [];
SteemConnectModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(SteemConnectModule.modulePathName+ "." + persistentPath));
StatusModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(StatusModule.modulePathName+ "." + persistentPath));



/**
 * Store type guard
 */
export interface Store {
  state: {
    [SteemConnectModule.modulePathName]: SteemConnectModule.State;
    [StatusModule.modulePathName]: StatusModule.State;
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
    /*createPersistedState({
      key: PERSISTENCE_LOCALSTORAGE_KEY,
      paths: persistentPaths,
    }),*/
  ],
});
