import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { RealtimeModule as Me } from "./RealtimeModule";
import { d, assertString, isEqualWithFunctions } from "../../../util/util";
import * as _ from "lodash";
import * as socketio from "socket.io-client";
import Axios from "axios";
import { Log } from "../../../Log";

export namespace RealtimeModuleImpl {

    export const state: Me.State = {
        status: {
            loading: true,
            connecting: true,
            error: ""
        },
        params: {
            socketIoURI: "",
            socketIoOpts: {},
            preloadFn: async () => [],
            tailLength: 100,
            preloadPreprocess: (entry: object) => entry,
            messagePreprocess: (message: string) => message
        },
        messages: []
    };
    export const persistentPaths: string [] = [
        
    ];


    const socketIOHolder: { socketio: SocketIOClient.Socket | undefined; } = { socketio: undefined };


    /**
     * Mutations
     */
    // do not export as these mutations are private
    class Mutations {
        public static appendMessages =  Me.localName("appendMessages");
        public static clearMessages = Me.localName("clearMessages");
        public static setStatus = Me.localName("setStatus");
        public static setParams = Me.localName("setParams");
    }

    const mutations: MutationTree<Me.State> = {
        [Mutations.appendMessages](
            state: Me.State, payload: any [],
        ) {
            state.messages = [...payload, ...state.messages].slice(0, state.params.tailLength);
        },

        [Mutations.clearMessages](
            state: Me.State
        ) {
            state.messages = [];
        },

        [Mutations.setStatus](
            state: Me.State, payload: Me.Status,
        ) {
            state.status = _.merge({}, state.status, payload);
        },

        [Mutations.setParams](
            state: Me.State, payload: Me.Params,
        ) {
            state.params = payload;
        },
    };

    /**
     * Actions
     */
    class PrivateActions {
        public static preloadEntries = Me.localName("__preloadEntries");
        public static initiateSocket = Me.localName("__initiateSocket");
    }

    const actions: ActionTree<Me.State, Me.State> = {
        [Me.Actions.setParams]: (
            { commit, dispatch, state }, payload: Me.Params,
        ): void => {
            Log.log().info("RealtimeModule.Actions.setParams");
            if (!isEqualWithFunctions(payload, state.params)) {
                Log.log().info("Loading realtime");
                commit(Mutations.setParams, payload);
                commit(Mutations.clearMessages);
                commit(Mutations.setStatus, { loading: true, error: "" } as Me.Status);
                
                dispatch(PrivateActions.preloadEntries);
                dispatch(PrivateActions.initiateSocket);
            }
            else Log.log().info("Not loading realtime");
        },

        [PrivateActions.preloadEntries]: (
            { commit, dispatch, state },
        ): void => {
            Log.log().info("Preloading entries for realtime from " + state.params.preloadFn);
            (async () => {
                try {
                    let data: any [] = await state.params.preloadFn();
                    if (!_.isArray(data)) data = [data];
                    commit(Mutations.appendMessages, 
                        data.map((elem: any) => state.params.preloadPreprocess(elem)).filter(elem => !!elem)
                    );
                    commit(Mutations.setStatus, { loading: false, error: "" } as Me.Status);
                }
                catch (error) {
                    commit(Mutations.setStatus, { loading: false, error: "Error while preloading: " + error } as Me.Status);
                }
            })();
        },

        [PrivateActions.initiateSocket]: (
            { commit, dispatch, state },
        ): void => {(async () => {
            Log.log().info("Initiating realtime socket " + JSON.stringify(state.params));
            try {
                if (socketIOHolder.socketio) {
                    socketIOHolder.socketio.close();
                    socketIOHolder.socketio = undefined;
                }

                socketIOHolder.socketio = socketio(state.params.socketIoURI, state.params.socketIoOpts);

                socketIOHolder.socketio.on("msg", (msg: string) => {
                    const preprocessResult = state.params.messagePreprocess(msg);
                    if (preprocessResult) commit(Mutations.appendMessages, [ preprocessResult ]);
                });

                socketIOHolder.socketio.on("error", (error: string) => {
                    console.log("Socket.io error: " + error);
                    commit(Mutations.setStatus, { connecting: state.status.loading, error: "" + error } as Me.Status);
                });

                socketIOHolder.socketio.on("connect_failed", (error: string) => {
                    commit(Mutations.setStatus, { connecting: false, error: "Failed to connect to realtime socket" } as Me.Status);
                });

                socketIOHolder.socketio.on("connect", (error: string) => {
                    commit(Mutations.setStatus, { connecting: false, error: "" } as Me.Status);
                });

                socketIOHolder.socketio.on("reconnect", (error: string) => {
                    commit(Mutations.setStatus, { connecting: false, error: "" } as Me.Status);
                });

                socketIOHolder.socketio.on("reconnecting", (error: string) => {
                    commit(Mutations.setStatus, { connecting: true, error: state.status.error } as Me.Status);
                });

                socketIOHolder.socketio.on("reconnect_failed", (error: string) => {
                    commit(Mutations.setStatus, { connecting: false, error: "Failed to reconnect to realtime socket" } as Me.Status);
                });
            }
            catch (error) {
                commit(Mutations.setStatus, { connecting: false, error: "Error while initiating socket: " + error } as Me.Status);
            }
        })();}
    };


    /**
     * Getters
     */
    export class Getters {

    };

    const getters: GetterTree<Me.State, Me.State> = {
    };


    /**
     * Module
     */
    export const module: Module<Me.State, any> = {
        state: state,
        mutations: mutations,
        actions: actions,
        getters: getters
    };
};
