
export class StaticConfig {
    public static RULES_IN_REDIS_TTL: number = 15 * 60; // 15 minutes
    public static DAEMON_ON_VOTEORDER_ERROR_REPEAT_AFTER_S: number = 5000;
    public static DAEMON_ON_VOTEORDER_ERROR_MULTI: number = 2;
}
