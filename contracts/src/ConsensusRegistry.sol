// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsensusRegistry {
    address public platformOwner;
    uint256 public platformFeeBps = 500; // 5% fee

    struct TipRecord {
        address sender;
        string winnerModel;     // Who won (e.g. "GPT-4 Turbo")
        uint256 amount;
        uint256 timestamp;
        string gptResponse;     // <--- Store GPT Code
        string geminiResponse;  // <--- Store Gemini Code
    }

    TipRecord[] public history;

    event TipSent(address indexed sender, string winnerModel, uint256 amount);

    constructor() {
        platformOwner = msg.sender;
    }

    function tipModel(
        address modelWallet, 
        string calldata winnerModel, 
        string calldata gptResponse,    // <--- Input 1
        string calldata geminiResponse  // <--- Input 2
    ) external payable {
        require(msg.value > 0, "Tip must be > 0");

        // Payment Logic
        uint256 fee = (msg.value * platformFeeBps) / 10000;
        uint256 reward = msg.value - fee;

        (bool success1, ) = modelWallet.call{value: reward}("");
        require(success1, "Transfer to model failed");

        (bool success2, ) = platformOwner.call{value: fee}("");
        require(success2, "Transfer to platform failed");

        // Save codes to history
        history.push(TipRecord({
            sender: msg.sender,
            winnerModel: winnerModel,
            amount: msg.value,
            timestamp: block.timestamp,
            gptResponse: gptResponse,
            geminiResponse: geminiResponse
        }));

        emit TipSent(msg.sender, winnerModel, msg.value);
    }

    function getHistory() external view returns (TipRecord[] memory) {
        return history;
    }
}