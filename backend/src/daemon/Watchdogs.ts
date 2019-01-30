import { DockerWatchdogServer, TimeWatchdogStrategy } from "node-docker-watchdog";

export class Watchdogs {
    private loopHeartbeat: TimeWatchdogStrategy;
    private watchdogServer: DockerWatchdogServer;

    public constructor() {
        this.loopHeartbeat = new TimeWatchdogStrategy().setIdentitier("daemon loop heartbeat watchdog");

        this.watchdogServer = new DockerWatchdogServer([this.loopHeartbeat]);
    }

    public async start() {
        await this.watchdogServer.listen();
        this.loopHeartbeatBeatSeconds(10);
    }

    public loopHeartbeatBeatSeconds(ttlSeconds: number) {
        this.loopHeartbeat.beat(ttlSeconds * 1000);
    }
}
