export class StaticConfig {
    public static SERVICE_NAME: string = "publisher";
    // prettier-ignore
    public static REQUIRED_VAULT_POLICIES: string[] = /*§ §*/
    ["wise-hub-publisher"]
    /*§ '\n' + JSON.stringify(data.config.hub.docker.services.publisher.appRole.policies(data.config)) + '\n' §.*/;
    public static PUBLISH_THROTTLING_MS: number = 1000 * 5; // 5 seconds
    public static BROADCAST_SCOPE: string[] = ["custom_json", "vote"];
    public static JOB_BLOCKINGWAIT_SECONDS = 20;
    public static HEARTBEAT_TTL_SECONDS = Math.floor(StaticConfig.JOB_BLOCKINGWAIT_SECONDS * 2.5);
    // length of this array signals the maximal number of retries
    public static RETRIES_DELAYS_SECONDS: number[] = [3, 10, 30, 120, 300];
}
