import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ZKAuth } from '@/lib/zk-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, proof } = body;

        if (!username || !proof) {
            return NextResponse.json({ error: "Username and Proof are required" }, { status: 400 });
        }

        const user = db.getUser(username);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Context for the proof (e.g. today's date or a session ID). 
        // For this demo we use a static string or simply "login" to match the frontend.
        // In production, the server should issue a random nonce (challenge) first to prevent replay attacks.
        const context = "x402-login-context";

        const isValid = ZKAuth.verifyProof(user.publicKey, proof, context);

        if (isValid) {
            return NextResponse.json({ success: true, message: "Zero Knowledge Verification Successful" });
        } else {
            return NextResponse.json({ error: "Invalid Proof" }, { status: 401 });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
