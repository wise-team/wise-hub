declare const __VERSION__: string;
declare const __BUILDDATETIME__: string;

export namespace BuildContext {
    export const VERSION: string = __VERSION__;
    export const BUILDDATETIME: string = __BUILDDATETIME__;

    export function failIfMissing() {
        if (!VERSION) throw new Error("Build context variable VERSION is missing. Please contact Wise-team.");
        if (!BUILDDATETIME) throw new Error("Build context variable BUILDDATETIME is missing. Please contact Wise-team.");
    }
}