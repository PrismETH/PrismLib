const { Contract, Wallet, providers: { JsonRpcProvider } } = require("ethers");
const PrismInterface = require("./interface/Prism.json");
const { getConfig } = require("./config");

class Prism {

    /**
     * Prism constructor
     * @param {string|Wallet} wallet may be private key or Ethers wallet object
    */
    constructor(wallet) {
        const config = getConfig();
        this._contractAddress = config.contractAddress;
        this._provider = new JsonRpcProvider({ url: config.nodeUrl });

        // Init wallet
        if (typeof wallet === "string") {
            this._wallet = new Wallet(wallet, this._provider)
        } else if (wallet instanceof Wallet) {
            this._wallet = wallet
        } else {
            throw new Error("Invalid Wallet object")
        }

        // Init contract instance.
        this._prism = new Contract(this._contractAddress, PrismInterface.abi, this._wallet)
    }

    /**
     * Import wallet from mnemonic
     * @param {String} mnemonic Word list
     * @param {String} path Derivation path
     * @returns {Prism} current class object
    */
    fromMnemonic(mnemonic, mnemonicPath) {
        const config = getConfig();
        mnemonicPath = mnemonicPath && config.mnemonicPath;
        console.warn(mnemonicPath);
        const wallet = Wallet.fromMnemonic(mnemonic, mnemonicPath);
        const provider = new JsonRpcProvider({ url: config.nodeUrl });
        const connectedWallet = wallet.connect(provider);
        return new Prism(connectedWallet);
    }

    /**
     * Gets connected wallet
     * @returns {Wallet} connected wallet
    */
    getWallet() {
        return this._wallet;
    }

    /**
     * * Gets connected contract
     * @returns {Contract} connected contract
    */
    getContract() {
        return this._prism;
    }

    /**
     * Transfer funds to smart contract
     * @param {string} amount funds amount in ETH
     * @returns {TransactionResponse} transaction response
    */
    async transfer(amount) {
        const transaction = {
            to: this._contractAddress,
            value: amount,
        }

        // send transaction
        const config = getConfig();
        const tx = await this._wallet.sendTransaction(transaction);
        const txWaited = tx.wait(config.minConfirmationsRequired);
        return txWaited;
    }
}

module.exports = Prism;
