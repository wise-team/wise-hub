declare const __VERSION__: string;
declare const _WISE_SQL_ENDPOINT_URL_: string;

export namespace BuildContext {
    export const VERSION: string = __VERSION__;
    export const WISE_SQL_ENDPOINT_URL: string = _WISE_SQL_ENDPOINT_URL_;

    export function failIfMissing() {
        if (!VERSION) throw new Error("Build context variable VERSION is missing. Please contact Wise-team.");
        if (!WISE_SQL_ENDPOINT_URL) throw new Error("Build context variable WISE_SQL_ENDPOINT_URL is missing. Please contact Wise-team.");
    }
}