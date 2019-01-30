import { DockerWatchdogServer, TimeWatchdogStrategy } from "node-docker-watchdog";

export class Watchdogs {
    private heartbeat: TimeWatchdogStrategy;
    private watchdogServer: DockerWatchdogServer;

    public constructor() {
        this.heartbeat = new TimeWatchdogStrategy().setIdentitier("heartbeat watchdog");

        this.watchdogServer = new DockerWatchdogServer([this.heartbeat]);
    }

    public async start() {
        await this.watchdogServer.listen();
        this.heartbeatBeatSeconds(10);
    }

    public heartbeatBeatSeconds(ttlSeconds: number) {
        this.heartbeat.beat(ttlSeconds * 1000);
    }
}
