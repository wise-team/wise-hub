import Wise, { DisabledApi, EffectuatedWiseOperation, UnifiedSteemTransaction, Protocol } from "steem-wise-core";
import * as steem from "steem";
import * as BluebirdPromise from "bluebird";

export class BlockLoadingApi extends DisabledApi {
    private steem: steem.api.Steem;
    private protocol: Protocol = Wise.constructDefaultProtocol();

    public constructor(steem: steem.api.Steem) {
        super();
        this.steem = steem;
    }

    public async getWiseOperationsRelatedToDelegatorInBlock(
        delegator: string, blockNum: number, skipDelegatorCheck: boolean = false,
        delayOnNoBlockMs: number = /*§ data.config.steem.waitForNextHeadBlockDelayMs §*/3100/*§ §.*/
    ): Promise<EffectuatedWiseOperation []> {
        const block: steem.GetBlock.Block = await this.steem.getBlockAsync(blockNum);

        if (!block) {
            await BluebirdPromise.delay(delayOnNoBlockMs);
            return await this.getWiseOperationsRelatedToDelegatorInBlock(delegator, blockNum, skipDelegatorCheck);
        }
        else {
            return await this.getWiseOperationsRelatedToDelegatorInBlock_processBlock(delegator, blockNum, block, skipDelegatorCheck);
        }
    }

    private getWiseOperationsRelatedToDelegatorInBlock_processBlock(delegator: string, blockNum: number, block: steem.GetBlock.Block, skipDelegatorCheck: boolean): EffectuatedWiseOperation [] {
        let out: EffectuatedWiseOperation [] = [];

        const block_num = blockNum;
        const timestampUtc = block.timestamp;
        for (let transaction_num = 0; transaction_num < block.transactions.length; transaction_num++) {
            const transaction = block.transactions[transaction_num];

            out = out.concat(this.getWiseOperationsRelatedToDelegatorInBlock_processTransaction(
                delegator, blockNum, transaction_num, transaction,
                new Date(timestampUtc + "Z" /* this is UTC date */), skipDelegatorCheck
            ));
        }

        return out;
    }

    private getWiseOperationsRelatedToDelegatorInBlock_processTransaction(
        delegator: string, blockNum: number, transactionNum: number, transaction: steem.GetBlock.Transaction,
        timestamp: Date, skipDelegatorCheck: boolean
    ): EffectuatedWiseOperation [] {
        const out: EffectuatedWiseOperation [] = [];
        const steemTx: UnifiedSteemTransaction = {
            block_num: blockNum,
            transaction_num: transactionNum,
            transaction_id: transaction.transaction_id,
            timestamp: timestamp,
            ops: transaction.operations
        };
        const handleResult = this.protocol.handleOrReject(steemTx);

        if (handleResult) {
            handleResult.forEach(wiseOp => {
                if (skipDelegatorCheck || wiseOp.delegator === delegator) out.push(wiseOp);
            });
        }

        return out;
    }

    public async getAllWiseOperationsInBlock(blockNum: number): Promise<EffectuatedWiseOperation []> {
        return await this.getWiseOperationsRelatedToDelegatorInBlock("", blockNum, true /* skip delegator check */);
    }
}