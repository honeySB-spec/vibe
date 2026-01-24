"use client";

import { useReadContract } from "wagmi";
import { CONSENSUS_ABI, CONTRACT_ADDRESS } from "@/src/abi"; // Ensure this path matches your folder structure
import { formatEther } from "viem";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Coins, User, Copy, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Optional: For nice toast notifications, or use alert()

// Helper to copy text
const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // You can replace this with a toast notification if you have one installed
    alert(`${label} code copied to clipboard!`);
};

export default function HistoryPage() {
    // 1. Fetch Data from Blockchain
    const { data: history, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONSENSUS_ABI,
        functionName: "getHistory",
        query: {
            refetchOnMount: true // Ensure we always get fresh data
        }
    });

    // 2. Process Data: Create a copy and reverse it to show newest transactions first
    const sortedHistory = history ? [...history].reverse() : [];

    return (
        <main className="h-screen w-full bg-white text-zinc-900 font-sans flex flex-col">

            {/* HEADER */}
            <header className="h-14 border-b flex items-center px-6 bg-white z-50">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-black">
                        <ArrowLeft className="w-4 h-4" /> Back to Generator
                    </Button>
                </Link>
                <h1 className="ml-4 font-bold text-sm tracking-tight">Consensus Ledger</h1>
            </header>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 max-w-6xl mx-auto w-full flex flex-col overflow-hidden">

                {/* Title Section */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Global Tipping History</h2>
                        <p className="text-zinc-500 text-sm mt-1">Immutable record of every AI comparison battle.</p>
                    </div>
                    <Badge variant="outline" className="h-7 px-3 text-xs bg-zinc-50">
                        {sortedHistory.length} Transactions Found
                    </Badge>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex-1 overflow-hidden flex flex-col">

                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-6 py-3 border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-3 flex items-center gap-2"><User className="w-3 h-3" /> Sender</div>
                        <div className="col-span-3 flex items-center gap-2">Winner</div>
                        <div className="col-span-2 flex items-center gap-2"><Coins className="w-3 h-3" /> Amount</div>
                        <div className="col-span-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Time</div>
                        <div className="col-span-2 text-right">Source Code</div>
                    </div>

                    {/* Table Body (Scrollable) */}
                    <ScrollArea className="flex-1 bg-white">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm gap-2">
                                <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
                                Loading Blockchain Data...
                            </div>
                        ) : sortedHistory.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                                No tips recorded yet. Be the first to make history!
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {sortedHistory.map((record: any, index: number) => {
                                    // Determine simplified model name for badges
                                    const isGptWinner = record.winnerModel.includes("GPT");
                                    const isGeminiWinner = record.winnerModel.includes("Gemini");

                                    return (
                                        <div key={index} className="grid grid-cols-12 px-6 py-4 text-sm hover:bg-zinc-50/50 transition-colors group items-center">

                                            {/* 1. Sender Address */}
                                            <div className="col-span-3 font-mono text-zinc-400 text-xs truncate pr-4" title={record.sender}>
                                                {record.sender}
                                            </div>

                                            {/* 2. Winning Model */}
                                            <div className="col-span-3 font-medium text-zinc-900 flex items-center gap-2">
                                                {isGptWinner && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none text-[10px]">
                                                        OpenAI
                                                    </Badge>
                                                )}
                                                {isGeminiWinner && (
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none text-[10px]">
                                                        Gemini
                                                    </Badge>
                                                )}
                                                <span className="truncate text-xs">{record.winnerModel}</span>
                                            </div>

                                            {/* 3. Amount */}
                                            <div className="col-span-2 font-mono text-zinc-600 text-xs">
                                                {formatEther(record.amount)} ETH
                                            </div>

                                            {/* 4. Timestamp */}
                                            <div className="col-span-2 text-zinc-400 text-xs">
                                                {new Date(Number(record.timestamp) * 1000).toLocaleDateString()}
                                            </div>

                                            {/* 5. Action Buttons (Copy Code) */}
                                            <div className="col-span-2 flex justify-end gap-2 opacity-100">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md border-zinc-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                                                    onClick={() => copyToClipboard(record.gptResponse, "GPT-4")}
                                                    title="Copy GPT-4 Code"
                                                >
                                                    <span className="text-[9px] font-bold">GPT</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                    onClick={() => copyToClipboard(record.geminiResponse, "Gemini")}
                                                    title="Copy Gemini Code"
                                                >
                                                    <span className="text-[9px] font-bold">GEM</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </main>
    );
}