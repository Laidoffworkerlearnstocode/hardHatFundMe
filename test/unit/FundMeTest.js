const hre = require('hardhat');
require("@nomicfoundation/hardhat-chai-matchers");
const { expect } =require('chai');
const colors = require('colors');

describe('FundMe', async function() {
    let ethUsdPriceFeedAddress;
    let MockV3Aggregator;
    let contract;
    beforeEach(async function() {
        //deploy fundMe contract
        async function main() {
            const signers = await hre.ethers.getSigners();
            const deployer = signers[0];
            console.log(`正在部署合约...`.blue);
            //如果在development环境下就部署MockV3Aggregator的priceFeed合约
            if (hre.network.name === 'hardhat' || hre.network.name === 'localhost') {
                console.log(`当前网络是${hre.network.name},开始部署MockV3Aggregator`.yellow);
                const initialAnswer = 2000 * (10**8);
                const decimals = 8; 
                MockV3Aggregator = await hre.ethers.deployContract('MockV3Aggregator',[decimals, initialAnswer] ,deployer);
                ethUsdPriceFeedAddress = await MockV3Aggregator.getAddress();
                console.log(`MockV3Aggregator部署成功,地址为：${ethUsdPriceFeedAddress},开始部署FundMe合约`.green);
            } else {
                //如果不在development环境下就根据配置中对应network的ethUsdPriceFeed地址部署
                ethUsdPriceFeedAddress = hre.network.config.ethUsdPriceFeed;
                console.log(`当前网络是${hre.network.name},ethUsdPriceFeedAddress:${ethUsdPriceFeedAddress},开始部署FundMe合约`.yellow);
            }
            contract = await hre.ethers.deployContract('FundMe', [ethUsdPriceFeedAddress], deployer);
            const contractAddress = await contract.getAddress();
            console.log(`合约部署成功，地址为：${contractAddress}`.green);
        }
        await main();
    });
    describe ("constructor", async function() {
        it("constructor should be networks's ethUsdPriceFeedAddress", async function() {
            if (hre.network.name === 'hardhat' || hre.network.name === 'localhost') {
                expect(ethUsdPriceFeedAddress).to.equal(await MockV3Aggregator.getAddress());
            } else {
                expect(ethUsdPriceFeedAddress).to.equal(hre.network.config.ethUsdPriceFeed);
            }
        });
    });
    describe ("fund", async function() {
        it("fundAmount should be greater than minimumContribution", async function() {
            const fundAmount = hre.ethers.parseEther("0.0001");
            console.log(fundAmount);
            const signer = await hre.ethers.getSigners();
            console.log(hre.ethers.getSigners());
            console.log(signer);
            await expect(signer.sendTransaction(contract.fund({value: fundAmount}))).to.be.revertedWith("You need to spend more ETH!");
        });
    });
});