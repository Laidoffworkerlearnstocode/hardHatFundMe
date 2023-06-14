const hre = require('hardhat');
const colors = require('colors');
require('dotenv').config();
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require('solidity-coverage');

let ethUsdPriceFeedAddress = '';

async function main() {
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    console.log(`正在部署合约...`.blue);
    //如果在development环境下就部署MockV3Aggregator的priceFeed合约
    if (hre.network.name === 'hardhat' || hre.network.name === 'localhost') {
        console.log(`当前网络是${hre.network.name},开始部署MockV3Aggregator`.yellow);
        const initialAnswer = 2000 * (10**8);
        const decimals = 8; 
        const MockV3Aggregator = await hre.ethers.deployContract('MockV3Aggregator',[decimals, initialAnswer] ,deployer);
        ethUsdPriceFeedAddress = await MockV3Aggregator.getAddress();
        console.log(`MockV3Aggregator部署成功,地址为：${ethUsdPriceFeedAddress},开始部署FundMe合约`.green);
    } else {
        //如果不在development环境下就根据配置中对应network的ethUsdPriceFeed地址部署
        ethUsdPriceFeedAddress = hre.network.config.ethUsdPriceFeed;
        console.log(`当前网络是${hre.network.name},ethUsdPriceFeedAddress:${ethUsdPriceFeedAddress},开始部署FundMe合约`.yellow);
    }
    const contract = await hre.ethers.deployContract('FundMe', [ethUsdPriceFeedAddress], deployer);
    const contractAddress = await contract.getAddress();
    console.log(`合约部署成功，地址为：${contractAddress}`.green);
    await sleep(30000);
    // await verify(contractAddress, [ethUsdPriceFeedAddress]);
    // console.log(`合约验证成功`.green);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function verify(_contractAddress, args) {
    console.log(`正在验证合约...`.blue);
    console.log(`当前网络是${hre.network.name}`.yellow);
    console.log(`apiKey是${process.env.ETHERSCAN_API_KEY}`.blue);
    try {
        await hre.run("verify:verify", {
            address: _contractAddress,
            constructorArguments: args,
        });
    } catch (error) { 
        if (error.message.includes('Contract source code already verified')) {
            console.log(`合约已经验证过`.yellow);
        } else {
            console.log(`合约验证失败`.red);
            console.log(error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }
    );
