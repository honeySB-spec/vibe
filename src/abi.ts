export const CONTRACT_ADDRESS = "0xa0F952cef6B90143FB53304A85d64503DeEbC6FF";

export const CONSENSUS_ABI = [
    {
        "type": "function",
        "name": "tipModel",
        "inputs": [
            { "name": "modelWallet", "type": "address", "internalType": "address" },
            { "name": "winnerModel", "type": "string", "internalType": "string" },
            { "name": "gptResponse", "type": "string", "internalType": "string" },
            { "name": "geminiResponse", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "getHistory",
        "inputs": [],
        "outputs": [
            {
                "components": [
                    { "name": "sender", "type": "address" },
                    { "name": "winnerModel", "type": "string" },
                    { "name": "amount", "type": "uint256" },
                    { "name": "timestamp", "type": "uint256" },
                    { "name": "gptResponse", "type": "string" },
                    { "name": "geminiResponse", "type": "string" }
                ],
                "internalType": "struct ConsensusRegistry.TipRecord[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view"
    }
] as const;