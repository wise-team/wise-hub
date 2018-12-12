import Vue from "vue";
import Vuex, { GetterTree, MutationTree } from "vuex";
import { Module, ModuleTree, ActionTree, Dispatch, Commit } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { StatusModule } from "./modules/status/StatusModule";
import { StatusModuleImpl } from "./modules/status/StatusModuleImpl";
import { RulesetsModule } from "./modules/rulesets/RulesetsModule";
import { RulesetsModuleImpl } from "./modules/rulesets/RulesetsModuleImpl";
import { AuthModule } from "./modules/auth/AuthModule";
import { AuthModuleImpl } from "./modules/auth/AuthModuleImpl";
import { RealtimeModule } from "./modules/realtime/RealtimeModule";
import { RealtimeModuleImpl } from "./modules/realtime/RealtimeModuleImpl";

Vue.use(Vuex);

declare const __VERSION__: string;
export const PERSISTENCE_LOCALSTORAGE_KEY = "steem_wise_hub_" + (__VERSION__ ? __VERSION__ : "");

/**
 * Root state types
 */
export interface RootState {
  unusedPathToBeSavedByTheVuexPersistedStateBecauseIfPathsArrayIsEmptyItSavesEverything: string;
  nowTimer: Date;
}
const state: RootState = {
  unusedPathToBeSavedByTheVuexPersistedStateBecauseIfPathsArrayIsEmptyItSavesEverything: "",
  nowTimer: new Date(),
};

export class Mutations {
  public static updateNowTimer = "updateNowTimer";
}
const mutations: MutationTree<RootState> = {
  [Mutations.updateNowTimer](state: RootState) {
    state.nowTimer = new Date;
  },
};

export class Actions {
  public static initialize: string = "initialize";
}
const actions: ActionTree<RootState, RootState> = {
  [Actions.initialize]: (
      { commit, dispatch, state }
  ): void => {
      dispatch(AuthModule.Actions.initialize);
      dispatch(StatusModule.Actions.initialize);

      setInterval(() => {
        commit("updateNowTimer")
      }, 1000)
  },
};


/**
 * Modules
 */
export interface Modules {
  [StatusModule.modulePathName]: Module<StatusModule.State, RootState>;
  [RulesetsModule.modulePathName]: Module<RulesetsModule.State, RootState>;
  [AuthModule.modulePathName]: Module<AuthModule.State, RootState>;
  [RealtimeModule.modulePathName]: Module<RealtimeModule.State, RootState>;
}
const modules: Modules & ModuleTree<RootState> = {
  [StatusModule.modulePathName]: StatusModuleImpl.module,
  [RulesetsModule.modulePathName]: RulesetsModuleImpl.module,
  [AuthModule.modulePathName]: AuthModuleImpl.module,
  [RealtimeModule.modulePathName]: RealtimeModuleImpl.module,
};

const persistentPaths: string [] = [];
persistentPaths.push("_prevent_empty_save");
StatusModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(StatusModule.modulePathName+ "." + persistentPath));
RulesetsModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(RulesetsModule.modulePathName+ "." + persistentPath));
AuthModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(AuthModule.modulePathName+ "." + persistentPath));
RealtimeModuleImpl.persistentPaths.forEach(persistentPath => persistentPaths.push(RealtimeModule.modulePathName+ "." + persistentPath));


export type State = {
  [StatusModule.modulePathName]: StatusModule.State;
  [RulesetsModule.modulePathName]: RulesetsModule.State;
  [AuthModule.modulePathName]: AuthModule.State;
  [RealtimeModule.modulePathName]: RealtimeModule.State;
} & RootState;

/**
 * Store type guard
 */
export interface Store {
  state: State,
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
export const store = new Vuex.Store<RootState>({
  strict: ( window.location.hostname === "localhost" ? true : false ),
  state: state,
  actions: actions,
  mutations: mutations,
  modules: modules,
  plugins: [
    createPersistedState({
      key: PERSISTENCE_LOCALSTORAGE_KEY,
      paths: persistentPaths,
    }),
  ],
});
