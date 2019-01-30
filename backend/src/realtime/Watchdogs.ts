import { DockerWatchdogServer, TimeWatchdogStrategy } from "node-docker-watchdog";

export class Watchdogs {
    private heartbeat: TimeWatchdogStrategy;
    private redisMessage: TimeWatchdogStrategy;
    private watchdogServer: DockerWatchdogServer;

    public constructor() {
        this.heartbeat = new TimeWatchdogStrategy().setIdentitier("heartbeat watchdog");
        this.redisMessage = new TimeWatchdogStrategy().setIdentitier("redis message watchdog");

        this.watchdogServer = new DockerWatchdogServer([this.heartbeat, this.redisMessage]);
    }

    public async start() {
        await this.watchdogServer.listen();
        this.heartbeatBeatSeconds(10);
        this.redisMessageBeatHours(2);
    }

    public heartbeatBeatSeconds(ttlSeconds: number) {
        this.heartbeat.beat(ttlSeconds * 1000);
    }

    public redisMessageBeatHours(ttlHours: number = 5) {
        this.redisMessage.beat(Math.floor(ttlHours * 3600 * 1000));
    }
}
