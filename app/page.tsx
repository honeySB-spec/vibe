"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Wallet, Sparkles, Trophy, Zap, ShieldCheck, Heart, Copy } from "lucide-react";
import confetti from "canvas-confetti"; // Optional: adds a nice pop effect

export default function ConsensusCode() {
  const [status, setStatus] = useState<"idle" | "gen" | "done" | "paid">("idle");
  const [winner, setWinner] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const runSim = () => {
    setStatus("gen"); setWinner(null); setCode("");
    const mock = `contract StakingVault is ERC20, Ownable {\n    mapping(address => uint256) public stakes;\n    uint256 public constant LOCK_TIME = 7 days;\n\n    constructor() ERC20("Yield", "YLD") {}\n\n    function deposit() external payable {\n        require(msg.value > 0, "Zero amount");\n        stakes[msg.sender] += msg.value;\n        emit Deposit(msg.sender, msg.value);\n    }\n}`;
    let i = 0;
    const t = setInterval(() => {
      setCode(mock.slice(0, i++));
      if (i > mock.length) { clearInterval(t); setStatus("done"); }
    }, 5);
  };

  const handleTip = (modelName: string) => {
    setWinner(modelName);
    setStatus("paid");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    // Here you would trigger the actual blockchain transaction
  };

  return (
    <main className="h-screen w-full flex flex-col bg-white text-zinc-900 font-sans overflow-hidden">

      {/* HEADER */}
      <header className="h-12 border-b flex items-center justify-between px-4 bg-white/80 backdrop-blur z-50">
        <span className="font-bold text-sm tracking-tight flex items-center gap-2">
          <div className="w-3 h-3 bg-black rounded-sm" /> ConsensusCode
        </span>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-2 rounded-full">
          <Wallet className="w-3 h-3" /> Connect
        </Button>
      </header>

      {/* VERTICAL LAYOUT */}
      <ResizablePanelGroup direction="vertical" autoSaveId="cc-v4" className="flex-1">

        {/* TOP: PROMPT AREA */}
        <ResizablePanel defaultSize={30} minSize={20} className="bg-zinc-50/50 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl relative">
            <Textarea
              placeholder="Describe your smart contract logic (e.g., 'Staking vault with 7-day lockup')..."
              className="min-h-[100px] resize-none border-zinc-200 shadow-sm p-4 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-black pr-32"
            />
            <div className="absolute bottom-3 right-3">
              <Button onClick={runSim} disabled={status === "gen"} size="sm" className="bg-black text-white hover:bg-zinc-800 rounded-lg shadow-md transition-all">
                {status === "gen" ? <Zap className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2 text-yellow-300" />}
                {status === "gen" ? "Thinking..." : "Generate"}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-zinc-100" />

        {/* BOTTOM: RESULTS ARENA */}
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="horizontal">

            {/* MODEL A */}
            <ResultPanel
              name="GPT-4 Turbo"
              tag="Gas Optimized"
              color="text-emerald-600 bg-emerald-50 border-emerald-100"
              icon={<Zap className="w-3 h-3" />}
              status={status}
              code={code}
              isWinner={winner === "GPT-4 Turbo"}
              hasWinner={!!winner}
              onTip={() => handleTip("GPT-4 Turbo")}
            />

            <ResizableHandle className="bg-zinc-100 w-[1px]" />

            {/* MODEL B */}
            <ResultPanel
              name="Claude 3 Opus"
              tag="High Security"
              color="text-blue-600 bg-blue-50 border-blue-100"
              icon={<ShieldCheck className="w-3 h-3" />}
              status={status}
              code={code}
              isWinner={winner === "Claude 3 Opus"}
              hasWinner={!!winner}
              onTip={() => handleTip("Claude 3 Opus")}
            />

          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

// --- REUSABLE COMPONENT ---

function ResultPanel({ name, tag, color, icon, status, code, isWinner, hasWinner, onTip }: any) {
  return (
    <ResizablePanel defaultSize={50} className={`relative flex flex-col transition-colors duration-500 ${isWinner ? "bg-green-50/30" : "bg-white"} ${hasWinner && !isWinner ? "opacity-50 grayscale" : ""}`}>

      {/* Title Bar */}
      <div className="h-10 border-b border-zinc-50 flex items-center justify-between px-4 bg-white/50 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-zinc-700">{name}</span>
          {isWinner && <Badge className="bg-green-600 text-white hover:bg-green-600 h-5 text-[10px]">🏆 Winner</Badge>}
        </div>
        {status !== "idle" && (
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-[10px] h-5 gap-1 border ${color}`}>{icon} {tag}</Badge>
          </div>
        )}
      </div>

      {/* Code Viewer */}
      <ScrollArea className="flex-1">
        <div className="p-6 pb-24"> {/* Extra padding at bottom for the floating button */}
          {status === "idle" ? (
            <div className="text-center pt-10 text-zinc-300 text-xs">Waiting for prompt...</div>
          ) : (
            <pre className="font-mono text-[11px] leading-6 text-zinc-600 selection:bg-black selection:text-white">
              {code}
            </pre>
          )}
        </div>
      </ScrollArea>

      {/* FLOATING ACTION BAR (Bottom) */}
      {status === "done" && !hasWinner && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-4 duration-500">
          <Button
            onClick={onTip}
            className="shadow-xl bg-white text-black border border-zinc-200 hover:bg-zinc-50 hover:scale-105 transition-all rounded-full px-6 gap-2"
          >
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            Tip 0.5 USDC
          </Button>
        </div>
      )}

      {/* WINNER STATE (After Tipping) */}
      {isWinner && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-in zoom-in duration-300">
          <Button variant="outline" className="bg-white border-green-200 text-green-700 gap-2 rounded-full cursor-default">
            <CheckCircle className="w-4 h-4" /> Tip Sent!
          </Button>
        </div>
      )}

    </ResizablePanel>
  );
}

// Helper icon
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}