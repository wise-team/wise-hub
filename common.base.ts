
export const common = {
    redis: {
        daemonStatus: {
            key: "hub:daemon:public:status",
            props: {
                daemon_start_time_iso: "daemon_start_time_iso",
                last_processed_block: "last_processed_block",
                lag_seconds: "lag_seconds",
                lag_update_time_iso: "lag_update_time_iso"
            }
        }
    }
};