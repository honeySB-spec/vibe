import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, publicKey } = body;

        if (!username || !publicKey) {
            return NextResponse.json({ error: "Username and PublicKey are required" }, { status: 400 });
        }

        const success = db.createUser(username, publicKey);
        if (!success) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: "Identity Registered" });
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
