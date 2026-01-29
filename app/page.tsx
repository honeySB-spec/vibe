"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, ShieldCheck, Wallet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background overflow-hidden flex flex-col">

            {/* BACKGROUND ELEMENTS */}
            {/* <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
            </div> */}

            {/* NAVBAR */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-background rounded-full" />
                    </div>
                    Vibe Check
                </div>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <Link href="/app">
                        <Button className="bg-foreground text-background hover:bg-muted font-semibold rounded-full px-6 transition-transform hover:scale-105 active:scale-95">
                            Launch App <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-10 sm:mt-20 mb-20">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-medium text-zinc-300">Powered by x402 Protocol</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter mb-8"
                >
                    Trust <br className="hidden sm:block" />
                    <span className="text-muted-foreground">but</span> Verify.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
                >
                    The first AI coding agent powered by <strong>Consensus Intelligence</strong>.
                    We verify every line of code across GPT-4 and Gemini to eliminate hallucinations before they reach your contract.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link href="/app" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full">
                            Start Vibe Checking
                        </Button>
                    </Link>
                    <Link href="https://github.com/your-username/vibe-check" target="_blank" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base rounded-full">
                            View on GitHub
                        </Button>
                    </Link>
                </motion.div>

                {/* HERO VISUAL */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                    className="mt-20 w-full max-w-4xl border border-border/50 rounded-xl overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl"
                >
                    <div className="h-8 bg-muted/50 border-b border-border/50 flex items-center gap-2 px-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="aspect-[16/9] bg-muted/20 p-4 sm:p-8 flex gap-4">
                        {/* Abstract Code  Blocks */}
                        <div className="flex-1 bg-muted/50 rounded-lg p-4 border border-border/50 flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                                    <Zap className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div className="h-2 w-20 bg-emerald-500/20 rounded-full" />
                            </div>
                            <div className="h-2 w-3/4 bg-foreground/10 rounded-full" />
                            <div className="h-2 w-1/2 bg-foreground/10 rounded-full" />
                            <div className="h-2 w-full bg-foreground/10 rounded-full" />
                        </div>
                        <div className="hidden sm:flex w-[1px] bg-border/50" />
                        <div className="flex-1 bg-muted/50 rounded-lg p-4 border border-border/50 flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                                    <Bot className="w-3 h-3 text-blue-500" />
                                </div>
                                <div className="h-2 w-20 bg-blue-500/20 rounded-full" />
                            </div>
                            <div className="h-2 w-3/4 bg-foreground/10 rounded-full" />
                            <div className="h-2 w-1/2 bg-foreground/10 rounded-full" />
                            <div className="h-2 w-full bg-foreground/10 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* FEATURES */}
            <section className="relative z-10 py-24 px-6 border-t border-border/50 bg-muted/30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="bg-card p-8 rounded-2xl border border-border/50 hover:border-border transition-colors">
                        <ShieldCheck className="w-10 h-10 text-foreground mb-6" />
                        <h3 className="text-xl font-bold mb-3">Dual-Model Consensus</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We query OpenAI and Gemini simultaneously. If their code diverges, you know there's a problem. Pick the winner.
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-border/50 hover:border-border transition-colors">
                        <Wallet className="w-10 h-10 text-foreground mb-6" />
                        <h3 className="text-xl font-bold mb-3">Autonomous Session Wallets</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Fund your agent once. It pays for its own compute and tips models automatically. No wallet popups interrupting your flow.
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-border/50 hover:border-border transition-colors">
                        <Bot className="w-10 h-10 text-foreground mb-6" />
                        <h3 className="text-xl font-bold mb-3">Smart Intent Detection</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Chat for free to learn concepts. Activate the expensive consensus engine only when you need production-grade code.
                        </p>
                    </div>

                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tighter">How it Works</h2>
                        <p className="text-zinc-400">Your AI coding workflow, reimagined for the crypto era.</p>
                    </motion.div>

                    <div className="grid gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute left-[27px] top-8 bottom-8 w-0.5 bg-zinc-800" />

                        {/* STEP 1 */}
                        <Step
                            number="1"
                            title="Connect Wallet"
                            desc="Login with your favorite Ethereum wallet. We support Coinbase Wallet, MetaMask, Rainbow, and more."
                        />

                        {/* STEP 2 */}
                        <Step
                            number="2"
                            title="Fund Your Agent"
                            desc="Type 'Enable Auto-Pay' to send a small budget (e.g. 0.002 ETH) to your local Session Wallet. This allows the AI to pay for itself."
                        />

                        {/* STEP 3 */}
                        <Step
                            number="3"
                            title="Vibe Check"
                            desc="Ask for a smart contract. Watch GPT-4 and Gemini generate code in real-time. Compare their logic side-by-side."
                        />

                        {/* STEP 4 */}
                        <Step
                            number="4"
                            title="Tip the Winner"
                            desc="See better code? Just type 'Tip GPT'. Your agent instantly executes a micro-payment to the provider. No popups."
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 px-6 border-t border-white/10 text-center text-zinc-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Vibe Check. Built with ❤️ on the x402 Protocol.</p>
            </footer>

        </div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-6 md:gap-10 relative z-10"
        >
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {number}
            </div>
            <div className="pt-2">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-zinc-400 leading-relaxed max-w-lg">{desc}</p>
            </div>
        </motion.div>
    );
}
