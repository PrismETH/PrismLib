const { Contract, providers: { JsonRpcProvider }, utils: { BigNumber, bigNumberify, formatEther } } = require("ethers");
const PrismInterface = require("./interface/Prism.json");
const { getConfig } = require("./config");
const { parseLogs } = require("./logs");

class PrismNode {

    /**
     * PrismNode constructor
    */
    constructor() {
        const config = getConfig();
        this._contractAddress = config.contractAddress;
        this._provider = new JsonRpcProvider({ url: config.nodeUrl });

        // Init contract instance.
        this._prism = new Contract(this._contractAddress, PrismInterface.abi, this._provider)
    }

    /**
     * Gets available levels
     * @returns {Array<string>} available levels 
    */
    async getLevels() {
        const levels = await this._prism.getLevels();
        return levels
            .map((l) => formatEther(l))
    }

    /**
     * Gets next withdraw id
     * @param {string} level withdraw level
     * @returns {string} next withdraw id
     */
    async getNextWithdraw(level) {
        const id = await this._prism.getNextWithdraw(level);
        return id;
    }

    /**
     * Gets prism contract balance
     * @returns {string} prism contract balance
    */
    async getBalance() {
        const balance = await this._prism.getBalance();
        return formatEther(balance);
    }

    /**
     * Gets total transfers count
     * @returns {number} number of transfer
    */
    async getTotalTransfersCount() {
        const eventTopic = this._prism.interface.events.TransferAccepted.topic;
        const filter = {
            fromBlock: 0,
            address: this._contractAddress.address,
            topics: [eventTopic],
        };
        const logs = await this._provider.getLogs(filter);
        const eventsLogs = parseLogs(logs, PrismInterface.abi);
        return eventsLogs.length;
    }

    /**
     * Gets total transfers amount
     * @returns {string} total amount of transfer
    */
    async getTotalTransfersAmount() {
        const eventTopic = this._prism.interface.events.TransferAccepted.topic;
        const filter = {
            fromBlock: 0,
            address: this._contractAddress.address,
            topics: [eventTopic],
        };
        const logs = await this._provider.getLogs(filter);
        const eventsLogs = parseLogs(logs, PrismInterface.abi);
        const amount = eventsLogs
            .map(l => l.args.amount)
            .map(amount => bigNumberify(amount))
            .reduce((a, b) => a.add(b), new BigNumber(0));
        return formatEther(amount);
    }

    /**
     * Gets total withdraws count
     * @returns {number} number of transfer
    */
    async getTotalWithdrawsCount() {
        const eventTopic = this._prism.interface.events.WithdrawAccepted.topic;
        const filter = {
            fromBlock: 0,
            address: this._contractAddress.address,
            topics: [eventTopic],
        };
        const logs = await this._provider.getLogs(filter);
        const eventsLogs = parseLogs(logs, PrismInterface.abi);
        return eventsLogs.length;
    }

    /**
     * Gets total withdraws amount
     * @returns {string} total amount of withdraw
    */
    async getTotalWithdrawsAmount() {
        const eventTopic = this._prism.interface.events.WithdrawAccepted.topic;
        const filter = {
            fromBlock: 0,
            address: this._contractAddress.address,
            topics: [eventTopic],
        };
        const logs = await this._provider.getLogs(filter);
        const eventsLogs = parseLogs(logs, PrismInterface.abi);
        const amount = eventsLogs
            .map(l => l.args.amount)
            .map(amount => bigNumberify(amount))
            .reduce((a, b) => a.add(b), new BigNumber(0));
        return formatEther(amount);
    }

    /**
     * @typedef {Object} WaitingWithdraw 
     * @property {string} id
     * @property {string} transfer
     * @property {string} withdraw
     * @property {bool} isCompleted
    */

    /**
     * Gets waiting withdraws
     * @returns {WaitingWithdraw[]} waiting withdraws
    */
    async getWaitingWithdraws() {
        // transfers
        const transferEventTopic = this._prism.interface.events.TransferAccepted.topic;
        const transferFilter = {
            fromBlock: 0,
            address: this._contractAddress.address,
            topics: [transferEventTopic],
        };
        const transferLogs = await this._provider.getLogs(transferFilter);
        const transferEventsLogs = parseLogs(transferLogs, PrismInterface.abi);
        const transfers = transferEventsLogs.map(l => l.args);

        // withdraws
        const withdrawEventTopic = this._prism.interface.events.WithdrawAccepted.topic;
        const withdrawFilter = {
            fromBlock: 0,
            address: this._contractAddress.address,
            topics: [withdrawEventTopic],
        };
        const withdrawLogs = await this._provider.getLogs(withdrawFilter);
        const withdrawEventsLogs = parseLogs(withdrawLogs, PrismInterface.abi);
        const withdraws = withdrawEventsLogs.map(l => l.args);

        // gets withdraw amount or estimated withdraw amount (transfer amount * 1.3)
        const getAmount = (transfer, withdraw) => {
            const withdrawAmount = withdraw && withdraw.amount;
            if (withdrawAmount != null) { return withdrawAmount; }
            const transferAmount = transfer && transfer.amount;
            if (transferAmount == null) { return null; };
            return bigNumberify(transferAmount).mul(bigNumberify(13)).div(bigNumberify(10));
        };

        // merge result
        const result = []
        for (const transfer of transfers) {
            const withdraw = withdraws.find(w => w.id === transfer.id);
            result.push({
                id: transfer.id,
                transfer: formatEther(transfer.amount),
                withdraw: formatEther(getAmount(transfer, withdraw)),
                isCompleted: withdraw != null,
            });
        }
        return result;
    }
}

module.exports = PrismNode;
