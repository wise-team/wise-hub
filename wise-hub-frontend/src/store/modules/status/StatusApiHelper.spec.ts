import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import * as _ from "lodash";
import * as nock from "nock"; 
import { WindowContext } from "../../../WindowContext";
// WindowContext.WISE_SQL_ENDPOINT_URL = "https://sql.wise.vote/";
// WindowContext.STEEMD_ENDPOINT_URL = "https://api.steemit.com";
import { StatusApiHelper } from "./StatusApiHelper";

chaiUse(chaiAsPromised);

describe("StatusApiHelper", () => {
    describe("#loadGeneralStats", () => {
        it("Loads correct stats and omits array", async () => {
            const stats = { operations: 9587, delegators: 10, voters: 29 };
            
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/stats")
                .reply(200, [ stats ]);

            const resp = await StatusApiHelper.loadGeneralStats();
            expect(resp).to.deep.equal(stats);
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns non-200", async () => {
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/stats").reply(500);
            await expect(StatusApiHelper.loadGeneralStats()).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns invalid response", async () => {
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/stats").reply(200, "This is not a json");
            
            await expect(StatusApiHelper.loadGeneralStats()).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });
    });

    describe("#isVoting", () => {
        it("Returns true if voting", async () => {            
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?voter=eq.noisy&operation_type=eq.send_voteorder&select=count")
                .reply(200, [ { count: 300 } ]);

            await expect(StatusApiHelper.isVoting("noisy")).to.eventually.be.true;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Returns false if not voting", async () => {            
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?voter=eq.jblew&operation_type=eq.send_voteorder&select=count")
                .reply(200, [ { count: 0 } ]);

            await expect(StatusApiHelper.isVoting("jblew")).to.eventually.be.false;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns non-200", async () => {
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?voter=eq.jblew&operation_type=eq.send_voteorder&select=count")
                .reply(500);

            await expect(StatusApiHelper.isVoting("jblew")).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });
    });

    describe("#isDelegating", () => {
        it("Returns true if delegating", async () => {            
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?delegator=eq.noisy&operation_type=eq.set_rules&select=count")
                .reply(200, [ { count: 300 } ]);

            await expect(StatusApiHelper.isDelegating("noisy")).to.eventually.be.true;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Returns false if not delegating", async () => {            
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?delegator=eq.jblew&operation_type=eq.set_rules&select=count")
                .reply(200, [ { count: 0 } ]);

            await expect(StatusApiHelper.isDelegating("jblew")).to.eventually.be.false;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns non-200", async () => {
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?delegator=eq.jblew&operation_type=eq.set_rules&select=count")
                .reply(500);

            await expect(StatusApiHelper.isDelegating("jblew")).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });
    });

    describe("#isSupporting", () => {
        it("Returns true if supporting", async () => {
            // const r = await Axios.post("https://api.steemit.com", "{\"id\":1,\"jsonrpc\":\"2.0\",\"method\":\"call\",\"params\":[\"database_api\",\"get_accounts\",[[\"jblew\"]]]}");
            // console.log(JSON.stringify(r.data));
            
            const sqlNock = nock(WindowContext.STEEMD_ENDPOINT_URL)
                .post("/", (body: any) => _.isEqual(body.params, [ "database_api", "get_accounts", [ [ "jblew" ] ] ]))
                .reply(200, (uri: any, rqBody: any) => ({jsonrpc: "2.0", id: rqBody.id, result: [{"id":7654,"name":"jblew","witness_votes":["anyx","gtg","utopian-io","wise-team"]}]}));

            await expect(StatusApiHelper.isSupporting("jblew")).to.eventually.be.true;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Returns false if not supporting", async () => {
            // const r = await Axios.post("https://api.steemit.com", "{\"id\":1,\"jsonrpc\":\"2.0\",\"method\":\"call\",\"params\":[\"database_api\",\"get_accounts\",[[\"jblew\"]]]}");
            // console.log(JSON.stringify(r.data));
            
            const sqlNock = nock(WindowContext.STEEMD_ENDPOINT_URL)
                .post("/", (body: any) => _.isEqual(body.params, [ "database_api", "get_accounts", [ [ "jblew" ] ] ]))
                .reply(200, (uri: any, rqBody: any) => ({jsonrpc: "2.0", id: rqBody.id, result: [{"id":7654,"name":"jblew","witness_votes":["anyx","gtg","utopian-io"]}]}));

            await expect(StatusApiHelper.isSupporting("jblew")).to.eventually.be.false;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns non-200", async () => {
            const sqlNock = nock(WindowContext.STEEMD_ENDPOINT_URL)
                .post("/", (body: any) => _.isEqual(body.params, [ "database_api", "get_accounts", [ [ "jblew" ] ] ]))
                .reply(500);

            await expect(StatusApiHelper.isSupporting("jblew")).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });
    });

    describe("#loadLatestOperations", () => {
        it("Loads correct result", async () => {
            const mockedResp = [{"id":9666,"block_num":28099135,"transaction_num":33,"transaction_id":"9781b01ea95d66aa55f76ae43f8b5e9991ee9141","timestamp":"2018-11-28T15:30:48+00:00","moment":28099135.0033,"voter":"grecki-bazar-ewy","delegator":"noisy","operation_type":"confirm_vote","json_str":"{\"voteorderTxId\":\"ad9004022ed862759dfafb78c665776968e809a0\",\"accepted\":true,\"msg\":\"\",\"vote\":{\"voter\":\"noisy\",\"author\":\"zdrowienatak\",\"permlink\":\"papryka-cukinia-i-marchew\",\"weight\":4500}}"}, 
            {"id":9665,"block_num":28099134,"transaction_num":24,"transaction_id":"ad9004022ed862759dfafb78c665776968e809a0","timestamp":"2018-11-28T15:30:45+00:00","moment":28099134.0024,"voter":"grecki-bazar-ewy","delegator":"noisy","operation_type":"send_voteorder","json_str":"{\"rulesetName\":\"Na wsparcie polskiej spolecznosci tagu pl-kuchnia\",\"permlink\":\"papryka-cukinia-i-marchew\",\"author\":\"zdrowienatak\",\"weight\":4500}"}];
            
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?order=moment.desc&limit=2")
                .reply(200, mockedResp);

            const resp = await StatusApiHelper.loadLatestOperations(2);
            expect(resp).to.deep.equal(mockedResp.map(elem => {
                return { ...elem, data: JSON.parse(elem.json_str) };
            }));
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns non-200", async () => {
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?order=moment.desc&limit=2").reply(500);
            await expect(StatusApiHelper.loadLatestOperations(2)).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });

        it("Throws error when server returns invalid response", async () => {
            const sqlNock = nock(WindowContext.WISE_SQL_ENDPOINT_URL)
                .get("/operations?order=moment.desc&limit=2").reply(200, "This is not a json");
            
            await expect(StatusApiHelper.loadLatestOperations(2)).to.be.rejected;
            expect(sqlNock.isDone()).to.be.true;
        });
    });
});