import { Dictionary } from "lodash";

export class SessionRedirect {
    private static SESSSTOR_KEY = "hub-sessionredirect";

    public static getCurrentRedirect(): { path: string, query: Dictionary<string> } | undefined {
        const got = SessionRedirect.getAndClear();
        if (got && got.path && got.query && got.expire) {
            if (got.expire < Date.now()) {
                return { path: got.path, query: got.query };
            }
        }
        return undefined;
    }
    

    public static redirectOnNextReturn(path: string, query: Dictionary<string>) {
        const redObj = {
            path: path,
            query: query,
            expire: Date.now() + 1000 /*ms*/ * 60 * 3600 * 4 //4h
        };
        SessionRedirect.set(redObj);
    }

    private static set(value: any) { 
        sessionStorage.setItem(SessionRedirect.SESSSTOR_KEY, JSON.stringify(value));
    }

    private static getAndClear(): any | undefined {
        const returned = sessionStorage.getItem(SessionRedirect.SESSSTOR_KEY);
        sessionStorage.removeItem(SessionRedirect.SESSSTOR_KEY);
        return returned ? JSON.parse(returned) : undefined;
    }
}