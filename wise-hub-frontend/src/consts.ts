export const consts = {
    urls: /*§ JSON.stringify(d(data.config.hub.urls), undefined, 2) §*/{
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
    },
    "accounts": {
      "base": "/api/accounts"
    }
  }
}/*§ §.*/,

};