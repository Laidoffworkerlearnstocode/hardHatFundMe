require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require('solidity-coverage')
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		sepolia: {
			url: process.env.SEPOLIA_RPC_URL,
			accounts: [process.env.SEPOLIA_PRIVATE_KEY],
			chainId: 11155111,
			ethUsdPriceFeed: process.env.SEPOLIA_PRICE_FEED_CONTRACT,
			gasPrice: "auto"
		},
		localhost: {
			url: "http://127.0.0.1:8545/",
			// accounts默认使用hardhat列表中的第一个账户
			chainId: 31337,
		}
	},
	solidity: "0.8.8",
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
};
