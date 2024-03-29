import * as uuid from "uuid";
import * as _ from "lodash";

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

// source: https://stackoverflow.com/a/10601315/761265
export function formatBigInt (value: number) {
    var suffixes = ["", "k", "m", "b","t"];
    var suffixNum = Math.floor((""+value).length/3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(2));
    if (shortValue % 1 != 0) {
        var shortNum = shortValue.toFixed(1);
    }
    return shortValue+suffixes[suffixNum];
}

// based on: https://stackoverflow.com/a/6109105/761265
export function timeDifferenceStr(current: number, previous: number) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDays = msPerHour * 24 * 2;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + " seconds ago";   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + " minutes ago";   
    }

    else if (elapsed < msPerDays ) {
         return Math.round(elapsed/msPerHour ) + " hours ago";   
    }

    else {
        return new Date(previous).toISOString();   
    }
}

export function ucfirst(text: string): string {
    if (text.length === 0) return "";
    else if(text.length === 1) return text.toUpperCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function uniqueId(): string {
    return uuid.v4();
}

export function isEqualWithFunctions(o1: any, o2: any): boolean {
    return _.isEqualWith(o1, o2, (val1, val2) => {
        if(_.isFunction(val1) && _.isFunction(val2)) {
            return val1.toString() === val2.toString();
        }
        return undefined;
    });
}

export function errToStr<T>(fn: () => T): T | string {
    try {
        return fn();
    }
    catch (error) {
        return error + "";
    }
}

export function nestValidate(fn: () => void): boolean | string {
    try {
        fn();
        return true;
    }
    catch (error) {
        return error + "";
    }
}