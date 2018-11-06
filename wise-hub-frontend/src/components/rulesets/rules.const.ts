import { Rule, AgeOfPostRule, AuthorsRule, TagsRule, WeightRule, VotingPowerRule, WeightForPeriodRule, CustomRPCRule, ExpirationDateRule, FirstPostRule, PayoutRule, VotesCountRule, VotersRule } from "steem-wise-core";


export const names: { [x: string]: string } = {
    [Rule.Type.AgeOfPost]: "age of post",
    [Rule.Type.Authors]: "authors",
    [Rule.Type.CustomRPC]: "custom RPC",
    [Rule.Type.ExpirationDate]: "expiration date",
    [Rule.Type.FirstPost]: "first post",
    [Rule.Type.Payout]: "payout",
    [Rule.Type.Tags]: "tags",
    [Rule.Type.Voters]: "voters",
    [Rule.Type.VotesCount]: "votes count",
    [Rule.Type.VotingPower]: "voting power",
    [Rule.Type.Weight]: "weight",
    [Rule.Type.WeightForPeriod]: "weight for period"
};

export const colors: { [x: string]: any; } = {
    [Rule.Type.AgeOfPost]: "#007bff",
    [Rule.Type.Authors]: "#28a745",
    [Rule.Type.CustomRPC]: "#17a2b8",
    [Rule.Type.ExpirationDate]: "#dc3545",
    [Rule.Type.FirstPost]: "#ffc107",
    [Rule.Type.Payout]: "#28a745",
    [Rule.Type.Tags]: "#dc3545",
    [Rule.Type.Voters]: "#ffc107",
    [Rule.Type.VotesCount]: "#dc3545",
    [Rule.Type.VotingPower]: "#dc3545",
    [Rule.Type.Weight]: "#007bff",
    [Rule.Type.WeightForPeriod]: "#ffc107"
};

export const defaultRules: { [x: string]: Rule; } = {
    [Rule.Type.AgeOfPost]: new AgeOfPostRule(AgeOfPostRule.Mode.YOUNGER_THAN, 7, AgeOfPostRule.TimeUnit.DAY),
    [Rule.Type.Authors]: new AuthorsRule(AuthorsRule.Mode.ALLOW, [ "noisy" ]),
    [Rule.Type.CustomRPC]: new CustomRPCRule("", 0, "", ""),
    [Rule.Type.ExpirationDate]: new ExpirationDateRule(new Date(Date.now() + 1000 * 3600 * 24 * 365).toISOString()),
    [Rule.Type.FirstPost]:new FirstPostRule(),
    [Rule.Type.Payout]: new PayoutRule(PayoutRule.Mode.LESS_THAN, 1),
    [Rule.Type.Tags]: new TagsRule(TagsRule.Mode.ALLOW, [ "wise" ]),
    [Rule.Type.Voters]: new VotersRule(VotersRule.Mode.ANY, [ "dan" ]),
    [Rule.Type.VotesCount]: new VotesCountRule(VotesCountRule.Mode.LESS_THAN, 100),
    [Rule.Type.VotingPower]: new VotingPowerRule(VotingPowerRule.Mode.MORE_THAN, 0),
    [Rule.Type.Weight]: new WeightRule(0, 10000),
    [Rule.Type.WeightForPeriod]: new WeightForPeriodRule(30, WeightForPeriodRule.PeriodUnit.DAY, 4 * 10000)
};