// src/abi.ts

// 1. PASTE YOUR ADDRESS HERE 👇
export const CONTRACT_ADDRESS = "0x78cfD98d9a7E6B8DEEaCEAc9b6d864B796e14FE8";

// 2. THIS IS THE INTERFACE (Do not change)
export const CONSENSUS_ABI = [
    {
        "type": "function",
        "name": "tipModel",
        "inputs": [
            { "name": "modelWallet", "type": "address", "internalType": "address" },
            { "name": "modelName", "type": "string", "internalType": "string" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "event",
        "name": "TipSent",
        "inputs": [
            { "name": "sender", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "modelName", "type": "string", "indexed": false, "internalType": "string" },
            { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    }
] as const;