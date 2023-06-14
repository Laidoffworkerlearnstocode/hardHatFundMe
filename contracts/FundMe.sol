// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./priceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// @title A contract for crowd funding
/// @author laidOffWorkerLeansToCode
/// @notice This contract is to demo a sample crowd funding contract
/// @dev This implements price feeds as our library
contract FundMe {
    uint256 public minimumContribution = 50 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public owner;
    
    AggregatorV3Interface public priceFeed;

    error FundMe_NotOwner(string message);
    modifier onlyOwner() {
        if (msg.sender != owner) revert FundMe_NotOwner("Only owner can call this function.");
        _;
    }

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            PriceConverter.getConversionRate(msg.value, priceFeed) >= minimumContribution,
            "You need to spend more ETH!"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withDraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Failed to withdraw funds from contract");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
