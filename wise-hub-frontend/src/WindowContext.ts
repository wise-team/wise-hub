// declare const _WINDOW_CONTEXT: any;

export namespace WindowContext {
    export const isBrowser = ( typeof window !== "undefined" );

    export let ENVIRONMENT_TYPE: string = 
        isBrowser ? (window as any)._WINDOW_CONTEXT.ENVIRONMENT_TYPE : "local-nonbrowser"; // window is null when testing
    
    export let WISE_SQL_ENDPOINT_URL: string =
        isBrowser ? (window as any)._WINDOW_CONTEXT.WISE_SQL_ENDPOINT_URL : "https://sql.local";
    
    export let STEEMD_ENDPOINT_URL: string = 
        isBrowser ? (window as any)._WINDOW_CONTEXT.STEEMD_ENDPOINT_URL : "https://steemd.local";
    
    export let STEEMCONNECT_REDIRECT_URI: string =
        isBrowser ? (window as any)._WINDOW_CONTEXT.STEEMCONNECT_REDIRECT_URI : "https://sc_redirect.local";


    export function failIfMissing() {
        if (!ENVIRONMENT_TYPE) throw new Error("Window context variable ENVIRONMENT_TYPE is missing. Please contact Wise-team.");
        if (!WISE_SQL_ENDPOINT_URL) throw new Error("Window context variable WISE_SQL_ENDPOINT_URL is missing. Please contact Wise-team.");
        if (!STEEMD_ENDPOINT_URL) throw new Error("Window context variable STEEMD_ENDPOINT_URL is missing. Please contact Wise-team.");
        if (!STEEMCONNECT_REDIRECT_URI) throw new Error("Window context variable STEEMCONNECT_REDIRECT_URI is missing. Please contact Wise-team.");
    }
}