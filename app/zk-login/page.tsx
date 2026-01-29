"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Key, UserCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { ZKAuth, ZKIdentity } from '@/lib/zk-auth';
import { toast } from 'sonner';

export default function ZKLoginPage() {
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [username, setUsername] = useState('');
    const [identity, setIdentity] = useState<ZKIdentity | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const router = useRouter();

    // For login
    const [secretKeyInput, setSecretKeyInput] = useState('');

    // Logic
    const generateIdentity = () => {
        const id = ZKAuth.generateIdentity();
        setIdentity(id);
        setSecretKeyInput(id.secret); // Auto-fill for convenience in demo
        toast.success("Identity Generated Locally!");
    };

    const register = async () => {
        if (!username || !identity) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, publicKey: identity.public })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                toast.success("Successfully Registered Public Key on Server");
                // Switch to login
                setTimeout(() => setMode('login'), 1500);
            } else {
                setStatus('error');
                toast.error(data.error);
            }
        } catch (e) {
            setStatus('error');
            toast.error("Registration Failed");
        } finally {
            setStatus('idle');
        }
    };

    const login = async () => {
        if (!username || !secretKeyInput) return;
        setStatus('loading');
        try {
            // 1. Client generates Zero Knowledge Proof
            const context = "x402-login-context"; // Should match server
            const proof = ZKAuth.createProof(secretKeyInput, context);
            console.log("Generated Proof:", proof);

            // 2. Send Proof to Server (Server never sees secret)
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, proof })
            });

            const data = await res.json();
            if (data.success) {
                setStatus('success');
                toast.success("Zero Knowledge Verification Successful!");
                setTimeout(() => router.push('/app'), 1000);
            } else {
                setStatus('error');
                toast.error(data.error);
            }
        } catch (e) {
            setStatus('error');
            toast.error("Login Failed");
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center border border-border/50 backdrop-blur-sm">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Zero Knowledge Auth</h1>
                    <p className="text-muted-foreground text-sm">
                        Prove your identity without revealing your secret key.
                    </p>
                </motion.div>

                <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="flex border-b border-border/50">
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-muted/50 text-foreground' : 'hover:bg-muted/20 text-muted-foreground'}`}
                        >
                            Register
                        </button>
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-muted/50 text-foreground' : 'hover:bg-muted/20 text-muted-foreground'}`}
                        >
                            Login
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {mode === 'register' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Username</label>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-muted/20 border border-border/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="Enter your username"
                                    />
                                </div>

                                {!identity ? (
                                    <Button onClick={generateIdentity} className="w-full" variant="outline">
                                        <Key className="w-4 h-4 mr-2" /> Generate Secure Identity
                                    </Button>
                                ) : (
                                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Your Secret Key (Keep Safe)</div>
                                            <div className="font-mono text-xs bg-black/20 p-2 rounded text-emerald-400 break-all">
                                                {identity.secret}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Public Key (Shared)</div>
                                            <div className="font-mono text-xs bg-black/20 p-2 rounded text-zinc-400 break-all">
                                                {identity.public}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={register}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={!identity || !username || status === 'loading'}
                                >
                                    {status === 'loading' ? 'Registering...' : 'Register Public Key'}
                                </Button>
                            </motion.div>
                        )}

                        {mode === 'login' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Username</label>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-muted/20 border border-border/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="Enter your username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Your Secret Key</label>
                                    <input
                                        type="password"
                                        value={secretKeyInput}
                                        onChange={(e) => setSecretKeyInput(e.target.value)}
                                        className="w-full bg-muted/20 border border-border/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                        placeholder="0x..."
                                    />
                                </div>

                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex gap-2">
                                    <Lock className="w-4 h-4 shrink-0" />
                                    <span>
                                        Your secret key never leaves your device. Only a mathematical proof is sent.
                                    </span>
                                </div>

                                <Button
                                    onClick={login}
                                    className="w-full"
                                    disabled={!username || !secretKeyInput || status === 'loading'}
                                >
                                    {status === 'loading' ? 'Verifying Proof...' : 'Sign In with ZK Proof'}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
