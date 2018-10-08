/**
 * This file is automatically generated by https://github.com/wise-team/wise-ci.
 * Please do not change contents between templates.
 */

/*§ allowUndefined(); outputConfig(data) §*/
export const data = {
  "config": {
    "license": {
      "code": "MIT",
    },
    "wise": {
      "version": "1.2.2",
      "homepage": "https://wise.vote/",
    },
    "steem": {
      "minimalApiBlockchainVersion": "0.20.5",
      "minimalApiHardforkVersion": "0.20.0",
      "apis": [ {
  "url": "https://api.steemit.com",
  "get_block": true,
}, {
  "url": "https://steemd.minnowsupportproject.org",
  "get_block": true,
}, {
  "url": "https://rpc.buildteam.io",
  "get_block": true,
}, {
  "url": "https://rpc.steemliberator.com",
  "get_block": true,
}, {
  "url": "https://steemd.privex.io",
  "get_block": true,
} ],
    },
    "witness": {
      "account": "wise-team",
    },
    "team": {
      "name": "Wise Team",
      "website": {
        "url": "https://wise-team.io/",
      },
      "steem": {
        "account": "wise-team",
      },
    },
    "npm": {
      "node": {
        "version": "9.11",
      },
      "keywords": [ "steem", "blockchain", "wise" ],
      "author": "The Wise Team (https://wise-team.io/)",
    },
    "repository": {
      "github": {
        "organization": "wise-team",
      },
      "readme": {
        "badges": [ () => "[![License](https://img.shields.io/github/license/wise-team/wise-hub.svg?style=flat-square)](https://github.com/wise-team/wise-hub/blob/master/LICENSE)", () => "[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)", () => "[![Chat](https://img.shields.io/badge/chat%20on%20discord-6b11ff.svg?style=flat-square)](https://discordapp.com/invite/CwxQDbG)", () => "[![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=http%3A%2F%2Fsql.wise.vote%3A%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](http://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc)" ],
        "generateHelpUsMd": () => "\n## Contribute to steem Wise\n\nWe welcome warmly:\n\n- Bug reports via [issues](https://github.com/wise-team/wise-hub).\n- Enhancement requests via via [issues](https://github.com/wise-team/wise-hub/issues).\n- [Pull requests](https://github.com/wise-team/wise-hub/pulls)\n- Security reports to _jedrzejblew@gmail.com_.\n\n**Before** contributing please **read [Wise CONTRIBUTING guide](https://github.com/wise-team/steem-wise-core/blob/master/CONTRIBUTING.md)**.\n\nThank you for developing WISE together!\n\n\n\n## Like the project? Let @wise-team become your favourite witness!\n\nIf you use & appreciate our software — you can easily support us. Just vote for \"wise-team\" to become you one of your witnesses. You can do it here: [https://steemit.com/~witnesses](https://steemit.com/~witnesses).\n\n",
        "generateHelpMd": () => "\n## Where to get help?\n\n- Feel free to talk with us on our chat: {https://discordapp.com/invite/CwxQDbG} .\n- You can read [The Wise Manual]({https://wise.vote/introduction})\n- You can also contact Jędrzej at jedrzejblew@gmail.com (if you think that you found a security issue, please contact me quickly).\n\nYou can also ask questions as issues in appropriate repository: See [issues for this repository](https://github.com/wise-team/wise-hub/issues).\n\n",
        "generateDefaultBadges": () => "\n[![License](https://img.shields.io/github/license/wise-team/wise-hub.svg?style=flat-square)](https://github.com/wise-team/wise-hub/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat%20on%20discord-6b11ff.svg?style=flat-square)](https://discordapp.com/invite/CwxQDbG) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=http%3A%2F%2Fsql.wise.vote%3A%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](http://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc)\n",
      },
      "repositories": {
        "core": {
          "name": "steem-wise-core",
          "npmPackageName": "steem-wise-core",
          "isNode": true,
          "isNpm": true,
          "nodePath": "",
        },
        "cli": {
          "name": "steem-wise-cli",
          "isNode": true,
          "npmPackageName": "steem-wise-cli",
          "isNpm": true,
          "nodePath": "",
        },
        "voterPage": {
          "name": "steem-wise-voter-page",
          "isNode": false,
          "isNpm": true,
          "nodePath": "",
        },
        "manual": {
          "name": "steem-wise-manual",
          "isNode": false,
          "isNpm": false,
          "nodePath": "",
        },
        "sql": {
          "name": "steem-wise-sql",
          "isNode": true,
          "isNpm": true,
          "nodePath": "/pusher",
        },
        "test": {
          "name": "steem-wise-test",
          "isNode": true,
          "isNpm": true,
          "nodePath": "",
        },
        "hub": {
          "name": "../wise-hub",
          "isNode": true,
          "isNpm": true,
          "nodePath": "/wise-hub-frontend",
        },
        "ci": {
          "name": "wise-ci",
          "isNode": true,
          "isNpm": true,
          "nodePath": "",
        },
      },
    },
    "communitation": {
      "chat": {
        "name": "discord",
        "url": "https://discordapp.com/invite/CwxQDbG",
      },
    },
    "sql": {
      "pusher": {
        "requestConcurrencyPerNode": 3,
        "blockProcessingTimeoutMs": 9000,
      },
      "endpoint": {
        "host": "sql.wise.vote",
        "schema": "http",
      },
    },
    "manual": {
      "url": "https://wise.vote/introduction",
    },
    "hub": {
      "production": {
        "url": "http://wise.vote/",
      },
      "development": {
        "url": "http://portal.wise.vote/",
      },
    },
    "test": {
      "live": {
        "metrics": {
          "periodMs": 259200000,
        },
        "inBrowserTests": {
          "enabled": true,
          "browsers": [ "firefox" ],
        },
        "api": {
          "testThroughProxy": false,
        },
      },
      "websites": {
        "brokenLinks": {
          "excludes": [ "*linkedin.com*", "http://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc" ],
        },
        "forbiddenPhrases": [ "noisy-witness", "noisy witness", "smartvote", "muon" ],
      },
    },
    "websites": [ {
  "url": "https://wise.vote/",
  "checkBrokenLinks": true,
}, {
  "url": "https://wise-team.io/",
  "checkBrokenLinks": true,
}, {
  "url": "https://wise.vote/introduction",
  "checkBrokenLinks": false,
} ],
  },
  "repository": {
    "name": "wise-hub",
  },
};
/*§§.*/
