// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsensusRegistry {
    address public platformOwner;
    uint256 public platformFeeBps = 500; // 5% fee (Basis points: 500/10000)

    event TipSent(address indexed sender, string modelName, uint256 amount);

    constructor() {
        platformOwner = msg.sender;
    }

    // This function handles the "Tip" logic
    function tipModel(address modelWallet, string calldata modelName) external payable {
        require(msg.value > 0, "Tip must be > 0");

        // Calculate 5% Platform Fee
        uint256 fee = (msg.value * platformFeeBps) / 10000;
        uint256 reward = msg.value - fee;

        // 1. Pay the Winner (Model)
        (bool successModel, ) = modelWallet.call{value: reward}("");
        require(successModel, "Transfer to model failed");

        // 2. Pay the Platform (You)
        (bool successPlatform, ) = platformOwner.call{value: fee}("");
        require(successPlatform, "Transfer to platform failed");

        emit TipSent(msg.sender, modelName, msg.value);
    }
}
