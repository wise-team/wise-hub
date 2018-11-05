
export const common = {
    urls: /*§ §*/{
  "api": {
    "base": "/api",
    "auth": {
      "login": {
        "scope": {
          "empty": "/api/auth/login/scope/empty",
          "custom_json": "/api/auth/login/scope/custom_json",
          "custom_json_vote_offline": "/api/auth/login/scope/custom_json/vote/offline"
        }
      },
      "callback": "/api/auth/callback",
      "logout": "/api/auth/logout",
      "revoke_all": "/api/auth/revoke_all",
      "test_login": "/api/auth/test_login"
    },
    "user": {
      "base": "/api/user",
      "settings": "/api/user/settings"
    }
  }
}/*§ JSON.stringify(d(data.config.hub.urls), undefined, 2) §.*/,
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
        rulesLoadedUpToBlock: "hub:daemon:rules_loaded_up_to_block",
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