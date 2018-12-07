
export namespace RealtimeModule {
    export const modulePathName = "realtime";
    export function localName(name: string) {
        return modulePathName + "_" + name;
    }

    export interface Params {
        socketIoURI: string;
        socketIoOpts: SocketIOClient.ConnectOpts;
        preloadFn: () => Promise <any []>;
        tailLength: number;
        preloadPreprocess: (entry: object) => any | undefined;
        messagePreprocess: (message: string) => any | undefined;
    }

    export interface Status {
        loading: boolean;
        connecting: boolean;
        error: string;
    }

    export interface State {
        params: Params;
        status: Status;
        messages: string [];
    }

    export class Actions {
        public static setParams = localName("setParams");
    }
}