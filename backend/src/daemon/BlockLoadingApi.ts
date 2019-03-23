import * as BluebirdPromise from "bluebird";
import * as steemJs from "steem";
import Wise, { DisabledApi, EffectuatedWiseOperation, Protocol, UnifiedSteemTransaction } from "steem-wise-core";

export class BlockLoadingApi extends DisabledApi {
    private steem: steemJs.api.Steem;
    private protocol: Protocol = Wise.constructDefaultProtocol();

    public constructor(steem: steemJs.api.Steem) {
        super();
        this.steem = steem;
    }

    public async getWiseOperationsRelatedToDelegatorInBlock(
        delegator: string,
        blockNum: number,
        skipDelegatorCheck: boolean = false,
        delayOnNoBlockMs: number = /*§ data.config.steem.waitForNextHeadBlockDelayMs §*/ 3100 /*§ §.*/,
    ): Promise<EffectuatedWiseOperation[]> {
        const block: steemJs.GetBlock.Block = await this.steem.getBlockAsync(blockNum);

        if (!block) {
            await BluebirdPromise.delay(delayOnNoBlockMs);
            return await this.getWiseOperationsRelatedToDelegatorInBlock(delegator, blockNum, skipDelegatorCheck);
        } else {
            return await this.getWiseOperationsRelatedToDelegatorInBlock_processBlock(
                delegator,
                blockNum,
                block,
                skipDelegatorCheck,
            );
        }
    }

    public async getAllWiseOperationsInBlock(blockNum: number): Promise<EffectuatedWiseOperation[]> {
        return await this.getWiseOperationsRelatedToDelegatorInBlock("", blockNum, true /* skip delegator check */);
    }

    private getWiseOperationsRelatedToDelegatorInBlock_processBlock(
        delegator: string,
        blockNum: number,
        block: steemJs.GetBlock.Block,
        skipDelegatorCheck: boolean,
    ): EffectuatedWiseOperation[] {
        let out: EffectuatedWiseOperation[] = [];

        const timestampUtc = block.timestamp;
        for (let transactionNum = 0; transactionNum < block.transactions.length; transactionNum++) {
            const transaction = block.transactions[transactionNum];

            out = out.concat(
                this.getWiseOperationsRelatedToDelegatorInBlock_processTransaction(
                    delegator,
                    blockNum,
                    transactionNum,
                    transaction,
                    new Date(timestampUtc + "Z" /* this is UTC date */),
                    skipDelegatorCheck,
                ),
            );
        }

        return out;
    }

    private getWiseOperationsRelatedToDelegatorInBlock_processTransaction(
        delegator: string,
        blockNum: number,
        transactionNum: number,
        transaction: steemJs.GetBlock.Transaction,
        timestamp: Date,
        skipDelegatorCheck: boolean,
    ): EffectuatedWiseOperation[] {
        const out: EffectuatedWiseOperation[] = [];
        const steemTx: UnifiedSteemTransaction = {
            block_num: blockNum,
            transaction_num: transactionNum,
            transaction_id: transaction.transaction_id,
            timestamp,
            ops: transaction.operations,
        };
        const handleResult = this.protocol.handleOrReject(steemTx);

        if (handleResult) {
            handleResult.forEach(wiseOp => {
                if (skipDelegatorCheck || wiseOp.delegator === delegator) out.push(wiseOp);
            });
        }

        return out;
    }
}
