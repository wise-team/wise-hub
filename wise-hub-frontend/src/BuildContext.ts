declare const __VERSION__: string;

export namespace BuildContext {
    export const VERSION: string = __VERSION__;

    export function failIfMissing() {
        if (!VERSION) throw new Error("Build context variable VERSION is missing. Please contact Wise-team.");
    }
}