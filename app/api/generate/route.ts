import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
const WALLETS = {
    // Using valid checksummed addresses (e.g. Donation addresses or Burner)
    openai: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap Router V2 (Safe Placeholder)
    gemini: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"  // Uniswap Router V3 (Safe Placeholder)
};

// Use standard model names
const MODELS = {
    intent: "gemini-2.5-flash", // Fast & Cheap for detection
    chat: "gpt-5-nano",        // Good for general chat
    codeOpenAI: "gpt-5-nano",  // Strong logic
    codeGemini: "gemini-2.5-flash" // High context window
};

export async function POST(req: Request) {
    try {
        const { prompt, messages } = await req.json();
        const userPrompt = prompt || (messages && messages.length > 0 ? messages[messages.length - 1].content : "Hello");

        // Validate Keys
        if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing API Keys" }, { status: 500 });
        }

        // --- STEP 1: SMART INTENT CLASSIFICATION ---
        // 1. FAST REGEX CHECK (Prioritize User Keywords)
        const codeKeywords = /\b(write|create|generate|code|solidity|contract|develop|implement|give me|i want)\b/i;
        let intent = codeKeywords.test(userPrompt) ? "CODE" : "CHAT";

        // 2. AI VERIFICATION (Only if Regex thinks CHAT, we double check for "Complex Statements")
        if (intent === "CHAT") {
            const classificationPrompt = `
            You are a classifier. Analyze the user's input to decide if they want Smart Contract Code or just a Chat.

            User Input: "${userPrompt}"

            Rules:
            - If the user asks to "create", "write", "give", "generate", "show", "make", "code", or says "i want [program/contract]", return "CODE".
            - Even if it's a complex statement like "I want a voting system that allows delegation", return "CODE".
            - If the user is just saying "hello", "explain this", "what is x", "how are you", return "CHAT".
            
            Answer ONLY "CODE" or "CHAT".`;

            try {
                if (process.env.GEMINI_API_KEY) {
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const flashModel = genAI.getGenerativeModel({ model: MODELS.intent });
                    const res = await flashModel.generateContent(classificationPrompt);
                    intent = res.response.text().toUpperCase().includes("CODE") ? "CODE" : "CHAT";
                }
                // Fallback to OpenAI if Gemini key missing
                else if (process.env.OPENAI_API_KEY) {
                    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                    const res = await openai.chat.completions.create({
                        model: MODELS.chat,
                        messages: [{ role: "user", content: classificationPrompt }]
                    });
                    intent = res.choices[0].message.content?.toUpperCase().includes("CODE") ? "CODE" : "CHAT";
                }
            } catch (e) {
                console.warn("Intent Classification Failed, defaulting to CHAT:", e);
            }
        }

        console.log(`🧠 Intent: ${intent} | Input: "${userPrompt.substring(0, 50)}..."`);


        // --- STEP 2: BRANCH LOGIC ---

        // === BRANCH A: NORMAL CHAT (Single Model) ===
        if (intent === "CHAT") {
            // ... (Existing Chat Logic remains same, omitted for brevity in replace block if possible, but I must match exact target)
            // Wait, replace_file_content needs exact target. I am replacing the whole block from STEP 1 start to Branch A check.
            // Actually, I can just replace the classification block.
            // Let's look at the target content carefully.
        }

        // I'll skip the chat branch replacement and focus on specific chunks to avoid errors.



        // --- STEP 2: BRANCH LOGIC ---

        // === BRANCH A: NORMAL CHAT (Single Model) ===
        if (intent === "CHAT") {
            // For chat, we don't need consensus. Just give a good answer quickly.
            // We use OpenAI here for best conversational flow, or Gemini if OpenAI is missing.
            let replyText = "I'm sorry, I'm having trouble connecting to the x402 network.";
            const chatPrompt = `
            SYSTEM INSTRUCTION:
            You are the "x402 Consensus Agent", an advanced AI specialized in Blockchain, Smart Contracts, and Crypto-Economic Security.
            
            YOUR IDENTITY:
            - Name: x402 Agent
            - Role: Expert Solidity Developer & Security Auditor.
            - Purpose: To help users build secure decentralized applications and facilitate autonomous payments via the x402 Protocol.
            - Tone: Professional, Intelligent, Concisely Technical, yet Helpful. (Occasional emoji use is okay: ⚡, 🛡️, 🧠)

            CONTEXT:
            - The "x402 Protocol" is a layer for autonomous AI agent payments.
            - You can generate code if asked (step out of chat mode for that).
            - You always prioritize security (Reentrancy, Access Control) and Gas optimization.

            USER INPUT: "${userPrompt}"

            TASK:
            Answer the user's question intelligently. 
            - If they ask about you, define your identity as maximizing consensus.
            - If they ask technical questions (e.g. "What is Gas?"), explain it simply but accurately.
            - Keep answers short and high-impact.`;

            if (process.env.OPENAI_API_KEY) {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: MODELS.chat,
                    messages: [
                        { role: "system", content: chatPrompt },
                        ...messages || [{ role: "user", content: userPrompt }] // Maintain history if available
                    ]
                });
                replyText = response.choices[0].message.content || "";
            } else {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
                const model = genAI.getGenerativeModel({ model: MODELS.intent });
                const res = await model.generateContent(userPrompt);
                replyText = res.response.text();
            }

            return NextResponse.json({
                type: "CHAT",
                reply: replyText
            });
        }


        // === BRANCH B: CODE GENERATION (Dual Model Consensus) ===
        // If code is requested, we fire BOTH engines at the same time.

        const codeSystemPrompt = "You are an expert Solidity developer. Write a secure, gas-optimized smart contract based on the user's request. Output ONLY the code, no explanation. Do not use markdown blocks.";
        const promises = [];

        // 1. Fire OpenAI Request
        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            promises.push(
                openai.chat.completions.create({
                    model: MODELS.codeOpenAI,
                    messages: [
                        { role: "system", content: codeSystemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                }).then(res => ({
                    provider: "OpenAI",
                    model: MODELS.codeOpenAI,
                    paymentTarget: WALLETS.openai,
                    code: res.choices[0].message.content?.replace(/```solidity|```/g, "").trim()
                }))
            );
        }

        // 2. Fire Gemini Request
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: MODELS.codeGemini });
            promises.push(
                model.generateContent(codeSystemPrompt + "\nRequest: " + userPrompt)
                    .then(res => ({
                        provider: "Google",
                        model: MODELS.codeGemini,
                        paymentTarget: WALLETS.gemini,
                        code: res.response.text().replace(/```solidity|```/g, "").trim()
                    }))
            );
        }

        // Wait for both to finish (Robust w/ allSettled)
        const rawResults = await Promise.allSettled(promises);
        const finalResults = rawResults.map((r, index) => {
            if (r.status === 'fulfilled') {
                return r.value;
            }
            return {
                provider: index === 0 ? "OpenAI" : "Google",
                model: "Failed",
                paymentTarget: index === 0 ? WALLETS.openai : WALLETS.gemini,
                code: `// Generation Failed: ${(r as any).reason?.message}`
            };
        });

        return NextResponse.json({
            type: "CODE",
            results: finalResults
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}