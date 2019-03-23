import {
    Api,
    EffectuatedSetRules,
    EffectuatedWiseOperation,
    SendVoteorder,
    ValidationException,
    Validator,
} from "steem-wise-core";

export class ValidationRunner {
    private api: Api;

    public constructor(api: Api) {
        this.api = api;
    }

    public async validate(
        voteorder: SendVoteorder,
        op: EffectuatedWiseOperation,
        esr: EffectuatedSetRules,
    ): Promise<ValidationRunner.Verdict> {
        if (!esr.rulesets) return { pass: false, msg: "There is no ruleset for you" };

        try {
            const v = new Validator(this.api);
            // provide already loaded rulesets (there is no need to call blockchain for them every single voteorder)
            v.provideRulesets(esr);

            const result: ValidationException | true = await v.validate(op.delegator, op.voter, voteorder, op.moment);
            if (result === true) {
                return { pass: true, msg: "" };
            } else {
                return { pass: false, msg: (result as ValidationException).message };
            }
        } catch (error) {
            if (error.name === "FetchError") throw error;
            else return { pass: false, msg: error.message };
            // TODO more complicated error handling
        }
    }
}

export namespace ValidationRunner {
    export interface Verdict {
        pass: boolean;
        msg: string;
    }
}
