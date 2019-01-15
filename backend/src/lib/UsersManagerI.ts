import ow from "ow";
import { User, UserSettings } from "../common/model/User";
import { OperationWithDescriptor } from "steem";
import { Steemconnect } from "./Steemconnect";

export interface UsersManagerI {
    init(): void;
    login(accessToken: string, refreshToken?: string): Promise<User>;
    forgetUser(user: User): Promise<void>;
    broadcast(username: string, scope: string[], ops: OperationWithDescriptor[]): Promise<Steemconnect.BroadcastResult>;
    saveUserSettings(username: string, settings: UserSettings): Promise<User>;
    getUser(username: string): Promise<User | undefined>;
}
