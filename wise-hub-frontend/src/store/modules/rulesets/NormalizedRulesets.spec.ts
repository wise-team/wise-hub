

import { expect } from "chai";
import "mocha";
import { NormalizedRulesets } from "./NormalizedRulesets";
import { RulesetsModuleApiHelper } from "./RulesetsModuleApiHelper";
import { EffectuatedSetRules } from "steem-wise-core";


describe("#normalize", function() {
    const normalizedRulesets = new NormalizedRulesets();

    it("Throws on undefined param", () => {
        expect(() => normalizedRulesets.normalize(undefined as any)).to.throw();
    });

    it("Returns object with all entities on empty array input", () => {
        const result = normalizedRulesets.normalize([]);
        expect(result).to.have.property("entities").that.is.an("object");
        expect(result).to.have.property("result").that.is.an("array");

        expect(result.entities).to.have.property("rules").that.is.an("object");
        expect(result.entities).to.have.property("rulesets").that.is.an("object");
        expect(result.entities).to.have.property("setRules").that.is.an("object");
    });

    it("Properly dispatches entities", async () => {
        const unnormalizedRulesets: EffectuatedSetRules [] = [
            {
              "moment": {
                "blockNum": 27518608,
                "transactionNum": 20,
                "operationNum": 0
              },
              "voter": "amalinavia",
              "delegator": "noisy",
              "rulesets": [
                {
                  "name": "Hilarious ruleset for Amalinavia",
                  "rules": [
                    {
                      "rule": "tags",
                      "mode": "any",
                      "tags": [
                        "art",
                        "drawing"
                      ]
                    },
                    {
                      "rule": "weight_for_period",
                      "period": 7,
                      "unit": "day",
                      "weight": 20000
                    },
                    {
                      "rule": "expiration_date",
                      "date": "2019-11-08T11:18:09.491Z"
                    }
                  ]
                }
              ]
            },
            {
              "moment": {
                "blockNum": 25286916,
                "transactionNum": 45,
                "operationNum": 0
              },
              "voter": "andrejcibik",
              "delegator": "noisy",
              "rulesets": [
                {
                  "name": "Graphics, Design, Webdesign",
                  "rules": [
                    {
                      "rule": "weight",
                      "min": 0,
                      "max": 2000
                    },
                    {
                      "rule": "tags",
                      "mode": "any",
                      "tags": [
                        "graphics",
                        "design",
                        "webdesign"
                      ]
                    }
                  ]
                },
                {
                  "name": "Self-Boost",
                  "rules": [
                    {
                      "rule": "weight",
                      "min": 0,
                      "max": 10000
                    },
                    {
                      "rule": "authors",
                      "mode": "allow",
                      "authors": [
                        "andrejcibik"
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "moment": {
                "blockNum": 27553588,
                "transactionNum": 37,
                "operationNum": 0
              },
              "voter": "anyx",
              "delegator": "noisy",
              "rulesets": []
            },
          ] as any;
          
        
        const normalized = normalizedRulesets.normalize(unnormalizedRulesets);
        expect(normalized).to.deep.equal({
            "entities": {
              "rules": {
                "rule2": {
                  "rule": "tags",
                  "mode": "any",
                  "tags": [
                    "art",
                    "drawing"
                  ],
                  "id": "rule2"
                },
                "rule3": {
                  "rule": "weight_for_period",
                  "period": 7,
                  "unit": "day",
                  "weight": 20000,
                  "id": "rule3"
                },
                "rule4": {
                  "rule": "expiration_date",
                  "date": "2019-11-08T11:18:09.491Z",
                  "id": "rule4"
                },
                "rule7": {
                  "rule": "weight",
                  "min": 0,
                  "max": 2000,
                  "id": "rule7"
                },
                "rule8": {
                  "rule": "tags",
                  "mode": "any",
                  "tags": [
                    "graphics",
                    "design",
                    "webdesign"
                  ],
                  "id": "rule8"
                },
                "rule10": {
                  "rule": "weight",
                  "min": 0,
                  "max": 10000,
                  "id": "rule10"
                },
                "rule11": {
                  "rule": "authors",
                  "mode": "allow",
                  "authors": [
                    "andrejcibik"
                  ],
                  "id": "rule11"
                }
              },
              "rulesets": {
                "ruleset1": {
                  "name": "Hilarious ruleset for Amalinavia",
                  "rules": [
                    "rule2",
                    "rule3",
                    "rule4"
                  ],
                  "id": "ruleset1"
                },
                "ruleset6": {
                  "name": "Graphics, Design, Webdesign",
                  "rules": [
                    "rule7",
                    "rule8"
                  ],
                  "id": "ruleset6"
                },
                "ruleset9": {
                  "name": "Self-Boost",
                  "rules": [
                    "rule10",
                    "rule11"
                  ],
                  "id": "ruleset9"
                }
              },
              "setRules": {
                "setRules0": {
                  "moment": {
                    "blockNum": 27518608,
                    "transactionNum": 20,
                    "operationNum": 0
                  },
                  "voter": "amalinavia",
                  "delegator": "noisy",
                  "rulesets": [
                    "ruleset1"
                  ],
                  "id": "setRules0"
                },
                "setRules5": {
                  "moment": {
                    "blockNum": 25286916,
                    "transactionNum": 45,
                    "operationNum": 0
                  },
                  "voter": "andrejcibik",
                  "delegator": "noisy",
                  "rulesets": [
                    "ruleset6",
                    "ruleset9"
                  ],
                  "id": "setRules5"
                },
                "setRules12": {
                  "moment": {
                    "blockNum": 27553588,
                    "transactionNum": 37,
                    "operationNum": 0
                  },
                  "voter": "anyx",
                  "delegator": "noisy",
                  "rulesets": [],
                  "id": "setRules12"
                }
              }
            },
            "result": [
              "setRules0",
              "setRules5",
              "setRules12"
            ]
          });
    });
});