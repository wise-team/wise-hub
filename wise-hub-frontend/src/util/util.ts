export function d <T> (input: T | undefined): T {
    if (typeof input !== "undefined") return input;
    else throw new Error("Input value is undefined (d() fn)");
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