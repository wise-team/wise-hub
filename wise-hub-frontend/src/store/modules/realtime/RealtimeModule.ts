import ow from "ow";

export namespace RealtimeModule {
    export const modulePathName = "realtime";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export interface Params {
        socketIoURI?: string;
        socketIoOpts: SocketIOClient.ConnectOpts;
        preloadFn: () => Promise <any []>;
        tailLength: number;
        preloadPreprocess: (entry: object) => any | undefined;
        messagePreprocess: (message: object) => any | undefined;
    }
    export namespace Params {
        export function validate(params: Params) {
            ow(params.socketIoURI, ow.any(ow.undefined, ow.string.label("params.socketIoURI").minLength(1)));
            ow(params.socketIoOpts, ow.object.label("params.socketIoOpts"));
            ow(params.preloadFn, ow.function.label("params.preloadFn"));
            ow(params.tailLength, ow.number.finite.greaterThan(1).label("params.tailLength"));
            ow(params.preloadPreprocess, ow.function.label("params.preloadPreprocess"));
            ow(params.messagePreprocess, ow.function.label("params.messagePreprocess"));
        }
    }


    export interface Status {
        loading: boolean;
        connecting: boolean;
        error: string;
    }
    export namespace Status {
        export function validate(status: Status) {
            ow(status.loading, ow.boolean.label("status.loading"));
            ow(status.connecting, ow.boolean.label("status.connecting"));
            ow(status.error, ow.string.label("status.error"));
        }
    }


    export interface State {
        params: Params;
        status: Status;
        messages: object [];
    }
    export function validateState(state: State) {
        Params.validate(state.params);
        Status.validate(state.status);
        ow(state.messages, ow.array.label("state.messages").ofType(ow.object));
    }

    export class Actions {
        public static setParams = localName("setParams");
    }
}