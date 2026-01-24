"use client";

import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, Heart, Sparkles, CheckCircle, Flame } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";

// Blockchain Imports
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
// Note: Depending on your tsconfig, this might need to be "../src/abi" or "@/src/abi"
import { CONSENSUS_ABI, CONTRACT_ADDRESS } from "@/src/abi";

export default function ConsensusCode() {
  const [status, setStatus] = useState<"idle" | "gen" | "done" | "paid">("idle");
  const [prompt, setPrompt] = useState("");
  const [winner, setWinner] = useState<string | null>(null);

  // Real AI Results State
  const [gptCode, setGptCode] = useState("");
  const [geminiCode, setGeminiCode] = useState("");

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // --- REAL AI GENERATOR ---
  const handleRealGenerate = async () => {
    if (!prompt) return;
    setStatus("gen");
    setWinner(null);
    setGptCode("");
    setGeminiCode("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.gpt && data.gemini) {
        setGptCode(data.gpt);
        setGeminiCode(data.gemini);
        setStatus("done");
      }
    } catch (e) {
      console.error(e);
      setStatus("idle");
    }
  };

  const handleTip = (modelName: string) => {
    // Demo wallet addresses
    const modelWallet = "0x1234567890123456789012345678901234567890";

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONSENSUS_ABI,
        functionName: "tipModel",
        args: [modelWallet, modelName],
        value: parseEther("0.0001"),
      });
      setWinner(modelName);
    } catch (error) {
      console.error("Tx Failed", error);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setStatus("paid");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isConfirmed]);

  return (
    <main className="h-screen w-full flex flex-col bg-white text-zinc-900 font-sans overflow-hidden">

      <header className="h-12 border-b flex items-center justify-between px-4 bg-white/80 backdrop-blur z-50">
        <span className="font-bold text-sm tracking-tight flex items-center gap-2">
          <div className="w-3 h-3 bg-black rounded-sm" /> ConsensusCode
        </span>
        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
      </header>

      <ResizablePanelGroup direction="vertical" autoSaveId="cc-real-ai-v2" className="flex-1">

        {/* INPUT AREA */}
        <ResizablePanel defaultSize={35} minSize={20} className="bg-zinc-50/50 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your smart contract (e.g. 'A voting system where users can vote only once')..."
              className="min-h-[120px] resize-none border-zinc-200 shadow-sm p-4 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-black pr-32"
            />
            <div className="absolute bottom-3 right-3">
              <Button
                onClick={handleRealGenerate}
                disabled={status === "gen" || !prompt}
                size="sm"
                className="bg-black text-white hover:bg-zinc-800 rounded-lg shadow-md transition-all"
              >
                {status === "gen" ? <Zap className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2 text-yellow-300" />}
                {status === "gen" ? "Synthesizing..." : "Generate Comparison"}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-zinc-100" />

        {/* RESULTS ARENA */}
        <ResizablePanel defaultSize={65}>
          <ResizablePanelGroup direction="horizontal">

            {/* LEFT: OPENAI */}
            <ResultPanel
              name="GPT-4 Turbo"
              tag="OpenAI"
              color="text-emerald-600 bg-emerald-50 border-emerald-100"
              icon={<Zap className="w-3 h-3" />}
              status={status}
              code={gptCode}
              isWinner={winner === "GPT-4 Turbo"}
              hasWinner={!!winner}
              onTip={() => handleTip("GPT-4 Turbo")}
              isPending={isPending && winner === "GPT-4 Turbo"}
            />

            <ResizableHandle className="bg-zinc-100 w-[1px]" />

            {/* RIGHT: GEMINI */}
            <ResultPanel
              name="Gemini 1.5 Pro"
              tag="Google DeepMind"
              color="text-blue-600 bg-blue-50 border-blue-100"
              icon={<Flame className="w-3 h-3" />}
              status={status}
              code={geminiCode}
              isWinner={winner === "Gemini 1.5 Pro"}
              hasWinner={!!winner}
              onTip={() => handleTip("Gemini 1.5 Pro")}
              isPending={isPending && winner === "Gemini 1.5 Pro"}
            />

          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

// Sub-component
// Replace the existing ResultPanel function at the bottom of src/app/page.tsx with this:

function ResultPanel({ name, tag, color, icon, status, code, isWinner, hasWinner, onTip, isPending }: any) {
  return (
    <ResizablePanel
      defaultSize={50}
      className={`relative flex flex-col h-full transition-colors duration-500 ${isWinner ? "bg-green-50/30" : "bg-white"} ${hasWinner && !isWinner ? "opacity-50 grayscale" : ""}`}
    >
      {/* 1. Header (Fixed Height) */}
      <div className="h-10 border-b border-zinc-50 flex items-center justify-between px-4 bg-white/50 backdrop-blur z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-zinc-700">{name}</span>
          {isWinner && <Badge className="bg-green-600 text-white hover:bg-green-600 h-5 text-[10px]">🏆 Winner</Badge>}
        </div>
        {status !== "idle" && (
          <Badge variant="outline" className={`text-[10px] h-5 gap-1 border ${color}`}>{icon} {tag}</Badge>
        )}
      </div>

      {/* 2. Scroll Area Wrapper (The Fix: flex-1 min-h-0) */}
      <div className="flex-1 min-h-0 w-full relative">
        <ScrollArea className="h-full w-full">
          <div className="p-6 pb-24">
            {status === "idle" || status === "gen" ? (
              <div className="text-center pt-10 text-zinc-300 text-xs flex flex-col items-center gap-2">
                {status === "gen" ? <Zap className="w-6 h-6 animate-spin text-zinc-200" /> : null}
                {status === "gen" ? "Consulting AI Models..." : "Waiting for prompt..."}
              </div>
            ) : (
              <pre className="font-mono text-[11px] leading-6 text-zinc-600 selection:bg-black selection:text-white whitespace-pre-wrap break-all">
                {code}
              </pre>
            )}
          </div>
        </ScrollArea>

        {/* 3. Floating Button (Absolute Positioned over the Scroll Area) */}
        {status === "done" && !hasWinner && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-4 duration-500 z-20 pointer-events-none">
            {/* pointer-events-auto re-enables clicking on the button */}
            <div className="pointer-events-auto">
              <Button
                onClick={onTip}
                disabled={isPending}
                className="shadow-xl bg-white text-black border border-zinc-200 hover:bg-zinc-50 hover:scale-105 transition-all rounded-full px-6 gap-2"
              >
                {isPending ? <Zap className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 text-red-500 fill-current" />}
                {isPending ? "Confirming..." : "Tip 0.0001 ETH"}
              </Button>
            </div>
          </div>
        )}

        {/* 4. Winner State */}
        {isWinner && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-in zoom-in duration-300 z-20">
            <Button variant="outline" className="bg-white border-green-200 text-green-700 gap-2 rounded-full cursor-default shadow-sm">
              <CheckCircle className="w-4 h-4" /> Tip Sent!
            </Button>
          </div>
        )}
      </div>
    </ResizablePanel>
  );
}