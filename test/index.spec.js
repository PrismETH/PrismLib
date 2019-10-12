const assert = require("assert");
const { setConfig, getConfig } = require("../src/config");
const { Contract, Wallet, providers: { JsonRpcProvider }, utils: { parseUnits } } = require("ethers");
const Prism = require("../src/prism");
const PrismNode = require("../src/prismNode");

// env
setConfig({
    nodeUrl: "http://127.0.0.1:7545",
    contractAddress: "0x3187A668605846B7c8C2Ad6522285c1C47C16F5E",
    minConfirmationsRequired: 1,
    mnemonicPath: "m/44'/60'/0'/0/0",
    testMnemonic: "nephew apology bacon pelican country escape emerge prepare leave easily wrist wealth",
    testPrivateKey: "0xdd59bd0a4ba35409751392832ed02d8da9be403a7be5d3e3d7d80fae9d1bfb7e",
})

const config = getConfig();

// test
describe("#Prism", () => {
    context("Import Prism", () => {
        const prismFromMnemonic = Prism.prototype.fromMnemonic(config.testMnemonic);
        const prismFromPrivateKey = new Prism(config.testPrivateKey);
        const prismFromWallet = new Prism(new Wallet(config.testPrivateKey, new JsonRpcProvider({ url: config.nodeUrl })));
        const prismNode = new PrismNode();

        it("should import prism", () => {
            assert.ok(prismFromMnemonic);
            assert.ok(prismFromPrivateKey);
            assert.ok(prismFromWallet);
            assert.equal(true, prismFromMnemonic instanceof Prism);
            assert.equal(true, prismFromPrivateKey instanceof Prism);
            assert.equal(true, prismFromWallet instanceof Prism);

            assert.ok(prismFromMnemonic.getWallet());
            assert.ok(prismFromPrivateKey.getWallet());
            assert.ok(prismFromWallet.getWallet());
            assert.equal(true, prismFromMnemonic.getWallet() instanceof Wallet);
            assert.equal(true, prismFromPrivateKey.getWallet() instanceof Wallet);
            assert.equal(true, prismFromWallet.getWallet() instanceof Wallet);

            assert.ok(prismFromMnemonic.getContract());
            assert.ok(prismFromPrivateKey.getContract());
            assert.ok(prismFromWallet.getContract());
            assert.equal(true, prismFromMnemonic.getContract() instanceof Contract);
            assert.equal(true, prismFromPrivateKey.getContract() instanceof Contract);
            assert.equal(true, prismFromWallet.getContract() instanceof Contract);
        });

        it("should return levels", async () => {
            const wallet = prismNode;
            const levels = await wallet.getLevels();
            assert.equal(['0.02', '0.05', '0.1', '0.5', '1.0', '2.0', '10.0'].toString(), levels.toString());
        });

        it("should transfer", async () => {
            const wallet = prismFromPrivateKey;
            await wallet.transfer(parseUnits("0.02", 18));
            await wallet.transfer(parseUnits("0.02", 18));
            await wallet.transfer(parseUnits("1", 18));
        });

        it("should return next withdraw", async () => {
            const wallet = prismNode;
            const id = await wallet.getNextWithdraw(parseUnits("0.02", 18));
            assert.notEqual("0x0000000000000000000000000000000000000000000000000000000000000000", id);
        });

        it("should return balance", async () => {
            const wallet = prismNode;
            const balance = await wallet.getBalance();
            assert.notEqual('0', balance);
        });

        it("should get statistic", async () => {
            const wallet = prismNode;
            const totalTransferCount = await wallet.getTotalTransfersCount();
            assert.notEqual(0, totalTransferCount);
            const totalTransferAmount = await wallet.getTotalTransfersAmount();
            assert.notEqual('0', totalTransferAmount);

            const totalWithdrawsCount = await wallet.getTotalWithdrawsCount();
            assert.notEqual(0, totalWithdrawsCount);
            const totalWithdrawsAmount = await wallet.getTotalWithdrawsAmount();
            assert.notEqual('0', totalWithdrawsAmount);

            const waitingWithdraws = await wallet.getWaitingWithdraws();
            assert.notEqual(0, waitingWithdraws.length);
        });
    });
});
