export function d <T> (input: T | undefined): T {
    if (typeof input !== "undefined") return input;
    else throw new Error("Input value is undefined (d() fn)");
}

export function i <T, R> (i: T | undefined, fn: ($: T) => R): R {
    return d(fn(d(i)));
}

export function assertString <T> (input: T | undefined): T {
    if (typeof input !== "string") throw new Error("Input value is undefined (d() fn)");
    return input;
}