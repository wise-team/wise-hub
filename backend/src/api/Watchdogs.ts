import { DockerWatchdogServer, HttpResponseWatchdogStrategy } from "node-docker-watchdog";

export class Watchdogs {
    private watchdogServer: DockerWatchdogServer;

    public constructor() {
        const apiStatusWatchdog = new HttpResponseWatchdogStrategy()
            .withUrl("http://127.0.0.1:3000/api/status")
            .thatContains('"verdict"');

        this.watchdogServer = new DockerWatchdogServer([apiStatusWatchdog]);
    }

    public async start() {
        await this.watchdogServer.listen();
    }
}
