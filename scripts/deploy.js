const hre = require('hardhat');
const colors = require('colors');
require('dotenv').config();
require("@nomicfoundation/hardhat-verify");

async function main() {
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    console.log(`正在部署合约...`.blue);
    const ethUsdPriceFeedAddress = hre.network.config.ethUsdPriceFeed;
    const contract = await hre.ethers.deployContract('FundMe', [ethUsdPriceFeedAddress], deployer);
    const contractAddress = await contract.getAddress();
    console.log(`合约部署成功，地址为：${contractAddress}`.green);
    // await sleep(30000);
    // await verify(contractAddress, []);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

async function verify(_contractAddress, args) {
    console.log(`正在验证合约...`.blue);
    console.log(`当前网络是${hre.network.name}`.yellow)
    console.log(`apiKey是${process.env.ETHERSCAN_API_KEY}`.blue);
    try {
        await hre.run("verify:verify", {
            address: _contractAddress,
            constructorArguments: args,
        });
        console.log(`合约验证成功`.green);
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
