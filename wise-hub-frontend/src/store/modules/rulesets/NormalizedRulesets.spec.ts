

import { expect } from "chai";
import "mocha";
import * as _ from "lodash";
import { NormalizedRulesets } from "./NormalizedRulesets";
import { RulesetsModuleApiHelper } from "./RulesetsModuleApiHelper";
import { EffectuatedSetRules } from "steem-wise-core";

const denormalizedInput = [
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
  ];

const expectedNormalizedOutput = {
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
  };

  
describe("#normalize", function() {
    it("Throws on undefined param", () => {
        const normalizedRulesets = new NormalizedRulesets();
        expect(() => normalizedRulesets.normalize(undefined as any)).to.throw();
    });

    it("Returns object with all entities on empty array input", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const input = [{
          "voter": "amalinavia",
          "delegator": "noisy",
          "rulesets": []
        }];
        const result = normalizedRulesets.normalize(input);
        expect(result).to.have.property("entities").that.is.an("object");
        expect(result).to.have.property("result").that.is.an("array");

        expect(result.entities).to.have.property("rules").that.is.an("object");
        expect(result.entities).to.have.property("rulesets").that.is.an("object");
        expect(result.entities).to.have.property("setRules").that.is.an("object");
    });

    it("Returns object with objects for every entity type even if the entity is not present", () => {
      const normalizedRulesets = new NormalizedRulesets();
      const result = normalizedRulesets.normalize([]);
      expect(result).to.have.property("entities").that.is.an("object");
      expect(result).to.have.property("result").that.is.an("array");

      expect(result.entities).to.have.property("rules").that.is.an("object");
      expect(result.entities).to.have.property("rulesets").that.is.an("object");
      expect(result.entities).to.have.property("setRules").that.is.an("object");
  });

    it("Properly dispatches entities", async () => {        
        const normalizedResult = (new NormalizedRulesets()).normalize(denormalizedInput as any);
        expect(normalizedResult).to.deep.equal(expectedNormalizedOutput);
    });

    it("Does not break input data", async () => { // this is a normalizr bug
        const inputThatCanBeBadlyModifiedByNormalizr = _.cloneDeep(denormalizedInput);     
        const normalizedResult = (new NormalizedRulesets()).normalize(inputThatCanBeBadlyModifiedByNormalizr as any);
        expect(normalizedResult).to.deep.equal(expectedNormalizedOutput);
        expect(inputThatCanBeBadlyModifiedByNormalizr).to.deep.equal(denormalizedInput);
    });
});

describe ("#denormalizeSetRules", () => {
    it("Returns empty array on empty input", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const denormalized_ = normalizedRulesets.denormalizeSetRules([], expectedNormalizedOutput as any);
        expect (denormalized_).to.be.an("array").with.length(0);
    });

    it("Omits nonexistent SetRules", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const denormalized_ = normalizedRulesets.denormalizeSetRules([ "nonexistent" ], expectedNormalizedOutput as any);
        expect (denormalized_).to.be.an("array").with.length(0);
    });

    it("Returns only chosen elements", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const denormalized_ = normalizedRulesets.denormalizeSetRules([ "setRules5" ], expectedNormalizedOutput as any);
        expect (denormalized_).to.be.an("array").with.length(1);
        expect (denormalized_[0].voter).to.be.equal("andrejcibik");
    });

    it("Normalize-denormalize returns primary input data", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const normalizedResult = normalizedRulesets.normalize(denormalizedInput as any);
        expect(normalizedResult).to.deep.equal(expectedNormalizedOutput);
        const denormalized_ = normalizedRulesets.denormalizeSetRules(expectedNormalizedOutput.result, normalizedResult as any);
        expect (denormalized_).to.deep.equal(denormalizedInput.map((el: any) => ({ voter: el.voter, rulesets: el.rulesets })));
    });
});

describe ("#denormalizeRulesets", () => {
    it("Returns empty array on empty input", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const denormalized_ = normalizedRulesets.denormalizeRulesets([], expectedNormalizedOutput as any);
        expect (denormalized_).to.be.an("array").with.length(0);
    });

    it("Omits nonexistent elements", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const denormalized_ = normalizedRulesets.denormalizeRulesets([ "nonexistent" ], expectedNormalizedOutput as any);
        expect (denormalized_).to.be.an("array").with.length(0);
    });

    it("Returns only chosen elements", () => {
        const normalizedRulesets = new NormalizedRulesets();
        const denormalized_ = normalizedRulesets.denormalizeRulesets([ "ruleset1" ], expectedNormalizedOutput as any);
        expect (denormalized_).to.be.an("array").with.length(1);
        expect (denormalized_[0].name).to.be.equal("Hilarious ruleset for Amalinavia");
    });
});