import Vue from "vue";
import Vuex, { GetterTree } from "vuex";
import { Module, ModuleTree, ActionTree, Dispatch, Commit } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { StatusModule } from "./modules/status/StatusModule";
import { StatusModuleImpl } from "./modules/status/StatusModuleImpl";
import { RulesetsModule } from "./modules/rulesets/RulesetsModule";
import { RulesetsModuleImpl } from "./modules/rulesets/RulesetsModuleImpl";
import { AuthModule } from "./modules/auth/AuthModule";
import { AuthModuleImpl } from "./modules/auth/AuthModuleImpl";

Vue.use(Vuex);

declare const __VERSION__: string;
export const PERSISTENCE_LOCALSTORAGE_KEY = "steem_wise_hub_" + (__VERSION__ ? __VERSION__ : "");

/**
 * Root state types
 */
export interface State {
  unusedPathToBeSavedByTheVuexPersistedStateBecauseIfPathsArrayIsEmptyItSavesEverything: string;
}
const state: State = {
  unusedPathToBeSavedByTheVuexPersistedStateBecauseIfPathsArrayIsEmptyItSavesEverything: "",
};

export class Actions {
  public static initialize: string = "initialize";
}
const actions: ActionTree<State, State> = {
  [Actions.initialize]: (
      { commit, dispatch, state }, payload?: {} | undefined,
  ): void => {
      dispatch(AuthModule.Actions.initialize);
      dispatch(StatusModule.Actions.initialize);
  },
};


/**
 * Modules
 */
export interface Modules {
  [StatusModule.modulePathName]: Module<StatusModule.State, State>;
  [RulesetsModule.modulePathName]: Module<RulesetsModule.State, State>;
  [AuthModule.modulePathName]: Module<AuthModule.State, State>
}
const modules: Modules & ModuleTree<State> = {
  [StatusModule.modulePathName]: StatusModuleImpl.module,
  [RulesetsModule.modulePathName]: RulesetsModuleImpl.module,
  [AuthModule.modulePathName]: AuthModuleImpl.module
};

const persistentPaths: string [] = [];
persistentPaths.push("_prevent_empty_save");
StatusModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(StatusModule.modulePathName+ "." + persistentPath));
RulesetsModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(RulesetsModule.modulePathName+ "." + persistentPath));
AuthModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(AuthModule.modulePathName+ "." + persistentPath));


/**
 * Store type guard
 */
export interface Store {
  state: {
    [StatusModule.modulePathName]: StatusModule.State;
    [RulesetsModule.modulePathName]: RulesetsModule.State;
    [AuthModule.modulePathName]: AuthModule.State;
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
console.log(persistentPaths);
export const store = new Vuex.Store<State>({
  strict: ( window.location.hostname === "localhost" ? true : false ),
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
