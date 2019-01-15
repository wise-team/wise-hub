import * as steem from "steem";
import { ow_catch } from "../../lib/util";
import ow from "ow";

interface VoteOp {
    voter: string;
    author: string;
    permlink: string;
    weight: number;
}
type VoteDesc = ["vote", VoteOp];

function validateVoteDesc(o: VoteDesc) {
    ow(o[0], ow.string.equals("vote").label("operation type"));
    ow(o[1], ow.object.label("operation parameters"));
    ow(o[1].voter, ow.string.minLength(3).label("voter"));
    ow(o[1].author, ow.string.minLength(3).label("author"));
    ow(o[1].permlink, ow.string.nonEmpty.label("permlink"));
    ow(o[1].weight, ow.number.inRange(-10 * 1000, 10 * 1000).integer.label("weight"));
}

///

interface CustomJsonOp {
    id: "wise";
    json: string;
    required_auths: string[];
    required_posting_auths: string[];
}

type CustomJsonDesc = ["custom_json", CustomJsonOp];

function validateCustomJsonDesc(o: CustomJsonDesc) {
    ow(o[0], ow.string.equals("custom_json").label("operation type"));
    ow(o[1], ow.object.label("operation parameters"));
    ow(o[1].id, ow.string.equals("wise").label("id"));
    ow(o[1].json, ow.string.nonEmpty.label("json"));
    ow(o[1].required_auths, ow.array.ofType(ow.string).label("required_auths"));
    ow(o[1].required_posting_auths, ow.array.ofType(ow.string).label("required_posting_auths"));
}

///

export type PublishableOperation = VoteDesc | CustomJsonDesc;

export namespace PublishableOperation {
    export function validatePublishableOperation(po: PublishableOperation) {
        ow(
            po,
            ow.any(
                ow.array.is(o => ow_catch(() => validateVoteDesc(o as any))), ///
                ow.array.is(o => ow_catch(() => validateCustomJsonDesc(o as any))) ///
            )
        );
    }
}

/**
 * The reason of the below code is to warn the compiler and prevent compilation
 * in case when PublishableOperation is incompatible with steemJs.OperationWithDescriptor
 */

function a(): PublishableOperation {
    return {} as any;
}

function b(param: steem.OperationWithDescriptor) {}
b(a());

const cjExampleOWD: steem.OperationWithDescriptor = [
    "custom_json",
    {
        id: "",
        json: "",
        required_auths: [],
        required_posting_auths: [],
    },
];
const cjExamplePublishable: PublishableOperation = [
    "custom_json",
    {
        id: "wise",
        json: "",
        required_auths: [],
        required_posting_auths: [],
    },
];

const voteExampleOWD: steem.OperationWithDescriptor = [
    "vote",
    {
        id: "",
        json: "",
        required_auths: [],
        required_posting_auths: [],
    },
];
const voteExamplePublishable: PublishableOperation = [
    "vote",
    {
        voter: "string",
        author: "string",
        permlink: "",
        weight: 1,
    },
];
