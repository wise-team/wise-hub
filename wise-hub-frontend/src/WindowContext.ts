declare const _WINDOW_CONTEXT: any;

export namespace WindowContext {
    export const ENVIRONMENT_TYPE: string = _WINDOW_CONTEXT.ENVIRONMENT_TYPE;
    export const WISE_SQL_ENDPOINT_URL: string = _WINDOW_CONTEXT.WISE_SQL_ENDPOINT_URL;
    export const STEEMD_ENDPOINT_URL: string = _WINDOW_CONTEXT.STEEMD_ENDPOINT_URL;
    export const STEEMCONNECT_REDIRECT_URI: string = _WINDOW_CONTEXT.STEEMCONNECT_REDIRECT_URI;

    export function failIfMissing() {
        if (!ENVIRONMENT_TYPE) throw new Error("Window context variable ENVIRONMENT_TYPE is missing. Please contact Wise-team.");
        if (!WISE_SQL_ENDPOINT_URL) throw new Error("Window context variable WISE_SQL_ENDPOINT_URL is missing. Please contact Wise-team.");
        if (!STEEMD_ENDPOINT_URL) throw new Error("Window context variable STEEMD_ENDPOINT_URL is missing. Please contact Wise-team.");
        if (!STEEMCONNECT_REDIRECT_URI) throw new Error("Window context variable STEEMCONNECT_REDIRECT_URI is missing. Please contact Wise-team.");
    }
}