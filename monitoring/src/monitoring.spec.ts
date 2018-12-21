import { expect } from "chai";
import "mocha";
import * as _ from "lodash";
import Axios from "axios";
import ow from "ow";

const baseUrl = process.env.WISE_HUB_URL;
ow (baseUrl, ow.string.nonEmpty.label("Env WISE_HUB_URL"));

describe("Wise HUB /api/status", function () {
    this.timeout(4500);
    this.retries(1);

    let status: ApiStatus;
    before(async () => {
        const resp = await Axios.get(baseUrl + "/api/status");
        status = resp.data;
    })

    it ("Vault is initialized", () => { expect(status.vault.initialized).to.be.true; });
    it ("Vault is not sealed", () => { expect(status.vault.sealed).to.be.false; });
    it ("Publisher is alive", () => { expect(status.alive.publisher).to.be.true; });
    it ("Daemon is alive", () => { expect(status.alive.daemon).to.be.true; });
    it ("Realtime is alive", () => { expect(status.alive.realtime).to.be.true; });
    // TODO test last processed block in daemon
    it ("Publisher queue is less than 12 elements long", () => { expect(status.publisher.queueLen).to.be.lt(15); });
    it ("Publisher processing queue is less than 5 elements long", () => { expect(status.publisher.processingLen).to.be.lt(15); });
});

interface ApiStatus {
    vault: {
        initialized: boolean;
        sealed: boolean;
    },
    alive: {
        publisher: boolean;
        daemon: boolean;
        realtime: boolean;
    },
    daemon: {
        daemon_start_time_iso: string;
        last_processed_block: string;
    },
    publisher: {
        queueLen: number;
        processingLen: number;
    },
    took: number;
};