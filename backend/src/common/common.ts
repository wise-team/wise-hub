
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
        },
        rules: "hub:daemon:rules",
        daemonErrors: "hub:daemon:errors",
        delegators: "hub:delegators",
        toPublishQueue: "hub:publisher:queue:to_publish",
        publishProcessingQueue: "hub:publisher:queue:publish_processing",
        daemonHartbeat: "hub:hartbeat:daemon",
        publisherHartbeat: "hub:hartbeat:publisher",
        channels: {
            delegators: {
                key: "channel_delegators",
                list_changed: "list_changed"
            }
        }
    },
    vault: {
        secrets: {
            sessionSecret: /*§ §*/ "/generated/session/salt" /*§ ' "' + data.config.vault.secrets.generated.sessionSalt + '" ' §.*/,
            steemConnectClientSecret: /*§ §*/ "/human/steemconnect/client_id" /*§ ' "' + data.config.vault.secrets.humanEnter.steemConnectClientId.key + '" ' §.*/,
            hub: /*§ §*/{
  "users": "/hub/steemconnect/users",
  "userProfiles": "/hub/steemconnect/users/profiles",
  "accessTokens": "/hub/steemconnect/users/access_tokens",
  "refreshTokens": "/hub/steemconnect/users/refresh_tokens"
}/*§ JSON.stringify(d(data.config.hub.vault.secrets), undefined, 2) §.*/,
        }
    }
};