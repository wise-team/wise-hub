import ow from "ow";
import { User, UserSettings } from "../common/model/User";
import { OperationWithDescriptor } from "steem";
import { Steemconnect } from "./Steemconnect";
import { UsersManagerI } from "./UsersManagerI";

export class UsersManagerMock implements UsersManagerI {
    public async init() {
        throw new Error("Unmocked method");
    }

    public async login(accessToken: string, refreshToken?: string): Promise<User> {
        throw new Error("Unmocked method");
    }

    public async forgetUser(user: User): Promise<void> {
        throw new Error("Unmocked method");
    }

    public async broadcast(
        username: string,
        scope: string[],
        ops: OperationWithDescriptor[]
    ): Promise<Steemconnect.BroadcastResult> {
        throw new Error("Unmocked method");
    }

    public async saveUserSettings(username: string, settings: UserSettings): Promise<User> {
        throw new Error("Unmocked method");
    }

    public async getUser(username: string): Promise<User | undefined> {
        throw new Error("Unmocked method");
    }
}
