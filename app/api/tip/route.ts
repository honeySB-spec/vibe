import { NextResponse } from 'next/server';
import { Coinbase, Wallet, WalletData } from "@coinbase/coinbase-sdk";
import fs from 'fs';
import path from 'path';
import { CONTRACT_ADDRESS, CONSENSUS_ABI } from "@/src/abi";

export async function POST(req: Request) {
    try {
        const { model, paymentTarget, gptCode, geminiCode } = await req.json();

        // 1. Configure CDP
        const apiKeyName = process.env.COINBASE_API_KEY_NAME;
        const privateKey = process.env.COINBASE_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n");

        if (!apiKeyName || !privateKey) {
            return NextResponse.json({ error: "Missing Coinbase CDP API Keys (COINBASE_API_KEY_NAME, COINBASE_API_KEY_PRIVATE_KEY)" }, { status: 500 });
        }

        Coinbase.configure({ apiKeyName, privateKey });

        // 2. Load or Create Agent Wallet
        const walletPath = path.resolve(process.cwd(), "agent_wallet.json");
        let wallet: Wallet;

        if (fs.existsSync(walletPath)) {
            // Load existing
            const rawData = fs.readFileSync(walletPath, 'utf-8');
            const data = JSON.parse(rawData);
            wallet = await Wallet.import(data);
            console.log(`🤖 Agent Wallet Loaded: ${(await wallet.getDefaultAddress()).getId()}`);
        } else {
            // Create new
            console.log("🤖 Creating new Agent Wallet...");
            wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
            // Save it
            const data = await wallet.export();
            fs.writeFileSync(walletPath, JSON.stringify(data, null, 2));
            console.log(`🤖 Agent Wallet Created & Saved: ${(await wallet.getDefaultAddress()).getId()}`);
        }

        // 3. Check Balance
        const address = await wallet.getDefaultAddress();
        const balance = await address.getBalance(Coinbase.assets.Eth);

        console.log(`💰 Agent Balance: ${balance.toString()}`);

        // If balance is too low
        if (balance.lessThan(0.0002)) { // Need gas + tip
            return NextResponse.json({
                error: `Agent Wallet Low Funds. Please fund: ${address.getId()}`,
                address: address.getId(),
                needsFunding: true
            });
        }

        // 4. Execute Contract Call (Tip)
        console.log(`🤖 Executing Tip to ${model}...`);

        // Note: The SDK's invokeContract method signature might vary by version, 
        // typically takes (args) where args handles the mapping.
        // For simple calls, we pass params object.
        const invocation = await wallet.invokeContract({
            contractAddress: CONTRACT_ADDRESS,
            method: "tipModel",
            args: {
                _modelAddress: paymentTarget,
                _modelName: model,
                _gptCode: gptCode || "No Code",
                _geminiCode: geminiCode || "No Code"
            },
            abi: CONSENSUS_ABI,
            amount: 0.0001, // 0.0001 ETH Tip Value attached
            assetId: Coinbase.assets.Eth
        });

        const txHash = await invocation.wait();
        console.log(`✅ Agent Tip Confirmed: ${txHash.getTransactionHash()}`);

        return NextResponse.json({ success: true, hash: txHash.getTransactionHash() });

    } catch (error: any) {
        console.error("Agent SDK Error:", error);
        return NextResponse.json({ error: error.message || "Agent execution failed" }, { status: 500 });
    }
}
