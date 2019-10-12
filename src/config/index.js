let _config = {
    nodeUrl: "", // (eg.) "http://127.0.0.1:7545"
    contractAddress: "", // (eg.) "0x3187A668605846B7c8C2Ad6522285c1C47C16F5E"
    minConfirmationsRequired: 1, // (eg.) 1
    mnemonicPath: "", // (eg.) "m/44'/60'/0'/0/0"
    testMnemonic: "", // (eg.) "nephew apology bacon pelican country escape emerge prepare leave easily wrist wealth"
    testPrivateKey: "", // (eg.) "0xdd59bd0a4ba35409751392832ed02d8da9be403a7be5d3e3d7d80fae9d1bfb7e"
};

const setConfig = (config) => {
    _config = {
        ..._config,
        ...config,
    };
};

const getConfig = () => {
    return _config;
};

module.exports = {
    setConfig,
    getConfig,
};