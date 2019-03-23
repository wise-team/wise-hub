import * as express from "express";

import { Log } from "../../lib/Log";

export function asyncReq(where: string, res: express.Response, fn: () => Promise<any>) {
    (async () => {
        try {
            await fn();
        } catch (error) {
            Log.log().error("api/lib/util#asyncReq(where=" + where + ")", error);
            res.status(500);
            res.send({ errors: [error.name + ": " + error.message + " at " + new Date().toISOString()] });
        }
    })();
}

export function d<T>(input: T | undefined, what?: string): T {
    if (typeof input !== "undefined") return input;
    else {
        if (what) throw new Error("Input value (" + what + ") is undefined (d() fn)");
        else throw new Error("Input value is undefined (d() fn)");
    }
}

export function i<T, R>(inputForFn: T | undefined, fn: ($: T) => R): R {
    return d(fn(d(inputForFn)));
}

export function assertString<T>(input: T | undefined): T {
    if (typeof input !== "string") throw new Error("Input value is undefined (d() fn)");
    return input;
}
