import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Missing API Keys. Please set OPENAI_API_KEY and GEMINI_API_KEY in .env.local" },
                { status: 500 }
            );
        }

        // 2. System Instructions
        const systemInstruction = "You are an expert Solidity developer. Write a secure, gas-optimized smart contract based on the user's request. Output ONLY the code, no explanation. Do not use markdown blocks.";

        // 3. Define Promises
        const promises = [];

        // OpenAI Request
        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            promises.push(
                openai.chat.completions.create({
                    model: "gpt-4o-mini", // Cheaper, fast model
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ],
                }).then(res => ({ type: 'gpt', data: res.choices[0].message.content }))
            );
        } else {
            promises.push(Promise.resolve({ type: 'gpt', data: "// OpenAI API Key missing" }));
        }

        // Gemini Request
        if (process.env.GEMINI_API_KEY) {
            // Note: Ensure your Google Cloud Project has access to the model
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            promises.push(
                genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }) // Trying specific version
                    .generateContent(systemInstruction + "\nUser Request: " + prompt)
                    .then(res => ({ type: 'gemini', data: res.response.text() }))
            );
        } else {
            promises.push(Promise.resolve({ type: 'gemini', data: "// Gemini API Key missing" }));
        }

        // 4. Call Both Models in Parallel (Robustly)
        const results = await Promise.allSettled(promises);

        // 5. Extract Results
        let gptCode = "// Error generating code";
        let geminiCode = "// Error generating code";

        // GPT Result (Index 0)
        if (results[0].status === 'fulfilled') {
            const val = results[0].value as { type: string, data: string };
            gptCode = val.data || "// No content returned";
        } else {
            console.error("GPT Error:", results[0].reason);
            gptCode = `// Error: ${results[0].reason?.message || "Unknown OpenAI error"}`;
        }

        // Gemini Result (Index 1)
        if (results[1].status === 'fulfilled') {
            const val = results[1].value as { type: string, data: string };
            geminiCode = val.data || "// No content returned";
        } else {
            console.error("Gemini Error:", results[1].reason);
            geminiCode = `// Error: ${results[1].reason?.message || "Unknown Gemini error"}`;
        }

        // 6. Return JSON
        return NextResponse.json({
            gpt: gptCode.replace(/```solidity|```/g, "").trim(),
            gemini: geminiCode.replace(/```solidity|```/g, "").trim()
        });

    } catch (error) {
        console.error("General AI Error:", error);
        return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }
}