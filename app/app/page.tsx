"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Zap, Heart, Sparkles, CheckCircle, Flame, Send, Bot, User as UserIcon, CreditCard, Wallet, Coins, History } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ModeToggle } from "@/components/mode-toggle";
// import confetti from "canvas-confetti";

// Blockchain Imports
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useSendTransaction } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONSENSUS_ABI, CONTRACT_ADDRESS } from "@/src/abi";
import { getSessionAccount, createSessionClient, publicClient } from "@/lib/session";

type Message = {
  role: "user" | "assistant";
  content: string;
  isPayment?: boolean; // New flag to style payment messages differently
};

export default function VibeCheck() {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm ready. I can pay autonomously if you fund my Session Wallet! Just say 'Enable Auto-Pay'." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Result State
  const [gptResult, setGptResult] = useState<any>(null);
  const [geminiResult, setGeminiResult] = useState<any>(null);

  // Session Wallet State
  const [sessionBalance, setSessionBalance] = useState<string>("0");
  const [sessionAddress, setSessionAddress] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Blockchain Hooks
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { address: userAddress, isConnected } = useAccount();

  // --- 0. SESSION INIT & POLLING ---
  useEffect(() => {
    const account = getSessionAccount();
    if (account) {
      setSessionAddress(account.address);
      updateSessionBalance(account.address);
    }

    const interval = setInterval(() => {
      if (account) updateSessionBalance(account.address);
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, []);

  const updateSessionBalance = async (address: string) => {
    const bal = await publicClient.getBalance({ address: address as `0x${string}` });
    setSessionBalance(formatEther(bal));
  };

  // --- 1. THE AGENTIC LOGIC ---
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = { role: "user", content: userText };

    // Update UI immediately
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const lowerInput = userText.toLowerCase();

    // SPECIAL COMMAND: FUND SESSION
    if (lowerInput.includes("enable auto") || lowerInput.includes("fund agent")) {
      if (!userAddress) {
        addBotMessage("Please connect your main wallet first (Top Right).");
        return;
      }
      addBotMessage("⚡️ Creating Auth Transaction... Please sign to fund your local Session Wallet with 0.002 ETH.");
      handleFundSession();
      return;
    }

    // A. CHECK FOR PAYMENT COMMANDS
    const isTipCommand = lowerInput.includes("tip") || lowerInput.includes("pay");

    if (isTipCommand) {
      if (lowerInput.includes("gpt") || lowerInput.includes("openai")) {
        if (!gptResult) {
          addBotMessage("I can't tip GPT yet because no code has been generated. Ask me to write code first!");
          return;
        }
        handleSmartTip(gptResult);
        return;
      }

      if (lowerInput.includes("gemini") || lowerInput.includes("google")) {
        if (!geminiResult) {
          addBotMessage("I can't tip Gemini yet because no code has been generated.");
          return;
        }
        handleSmartTip(geminiResult);
        return;
      }

      addBotMessage("Which model do you want to tip? Please say 'Tip GPT' or 'Tip Gemini'.");
      return;
    }

    // B. GENERATION / CHAT REQUEST
    setIsTyping(true);
    setWinner(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: userText, messages }),
      });

      const data = await res.json();

      if (data.reply) {
        addBotMessage(data.reply);
      }
      else if (data.results) {
        setGptResult(data.results[0]);
        setGeminiResult(data.results[1]);
        addBotMessage("I've generated the comparisons. Review the code. To Auto-Pay, ensure Agent Balance > 0.");
      }
    } catch (e) {
      console.error(e);
      addBotMessage("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const addBotMessage = (text: string, isPayment = false) => {
    setMessages((prev) => [...prev, { role: "assistant", content: text, isPayment }]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);


  // --- 2. SMART TIPPING ROUTER ---
  const handleSmartTip = async (model: any) => {
    // Check Session Balance
    const currentBal = parseFloat(sessionBalance);

    if (currentBal > 0.0002) {
      // USE SESSION WALLET (AUTONOMOUS)
      addBotMessage(`⚡️ Auto-Paying ${model.model} via Session Wallet... (Silent TX)`, true);
      await handleSessionTip(model);
    } else {
      // USE MAIN WALLET (MANUAL FALLBACK)
      addBotMessage(`⚠️ Session Wallet empty. Requesting signature from Main Wallet...`, true);
      handleMainWalletTip(model);
    }
  }

  // A. MAIN WALLET TIP (Standard Wagmi)
  const handleMainWalletTip = (selectedModel: any) => {
    if (!selectedModel?.paymentTarget) return;

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONSENSUS_ABI,
        functionName: "tipModel",
        args: [
          selectedModel.paymentTarget,
          selectedModel.model,
          gptResult?.code || "",
          geminiResult?.code || ""
        ],
        value: parseEther("0.0001"),
      });
      setWinner(selectedModel.model);
    } catch (error) {
      console.error("Tx Failed", error);
    }
  };

  // B. SESSION WALLET TIP (Silent Viem)
  const handleSessionTip = async (selectedModel: any) => {
    try {
      const client = createSessionClient();
      if (!client) return;

      if (!selectedModel?.paymentTarget) {
        addBotMessage("Cannot tip: Invalid Wallet Address (Model failed?)");
        return;
      }

      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONSENSUS_ABI,
        functionName: "tipModel",
        args: [
          selectedModel.paymentTarget,
          selectedModel.model,
          gptResult?.code || "",
          geminiResult?.code || ""
        ],
        value: parseEther("0.0001")
      });

      console.log("Silent Hash:", hash);
      setWinner(selectedModel.model);
      import("canvas-confetti").then((confetti) => {
        confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      });
      addBotMessage(`✅ Auto-Payment Successful! TX: ${hash.substring(0, 10)}...`, true);

    } catch (e: any) {
      console.error("Session Tip Failed", e);
      addBotMessage(`❌ Auto-Pay failed: ${e.message}. Try manual tip.`);
    }
  };

  // C. FUND SESSION
  const handleFundSession = () => {
    if (!sessionAddress) return;

    if (!isConnected) {
      addBotMessage("Please connect your main wallet first.");
      return;
    }

    try {
      addBotMessage(`⚡️ Requesting User Wallet to send 0.002 ETH to Session Agent...`);

      sendTransaction({
        to: sessionAddress as `0x${string}`,
        value: parseEther("0.002")
      });

    } catch (e: any) {
      console.error("Funding Failed", e);
      addBotMessage(`❌ Funding request failed: ${e.message}`);
    }
  }


  // Success Effect
  useEffect(() => {
    if (isConfirmed) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      });
      addBotMessage("Transaction confirmed on Base Sepolia! 🏆", true);
    }
  }, [isConfirmed]);

  return (
    <main className="h-screen w-full flex flex-col bg-background text-foreground font-sans overflow-hidden">

      {/* HEADER */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur z-50">
        <span className="font-bold text-sm tracking-tight flex items-center gap-2">
          <div className="w-4 h-4 bg-foreground rounded-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-background rounded-full" />
          </div>
          Vibe Check <span className="text-muted-foreground font-normal">AI Agent</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <History className="w-4 h-4" /> History
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
            <Bot className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Auto-Pay Bal:</span>
            <span className={`text-xs font-bold ${parseFloat(sessionBalance) > 0.0002 ? "text-green-600" : "text-red-500"}`}>
              {parseFloat(sessionBalance).toFixed(4)} ETH
            </span>
          </div>
          <ModeToggle />
          <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
        </div>
      </header>

      {/* ... Rest of UI same as before ... */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* ... (Panel contents) ... */}
        {/* --- LEFT: CHAT AGENT --- */}
        <ResizablePanel defaultSize={35} minSize={500} maxSize={5000} className="bg-muted/30 flex flex-col border-r border-border">
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarFallback className={msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                      {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`p-3 rounded-lg text-sm max-w-[85%] leading-relaxed ${msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : msg.isPayment
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-tl-none"
                      : "bg-card border border-border text-card-foreground rounded-tl-none"
                    }`}>
                    {msg.isPayment && <CreditCard className="w-3 h-3 mb-1 inline-block mr-2" />}
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8"><AvatarFallback><Bot className="w-4 h-4 animate-pulse" /></AvatarFallback></Avatar>
                  <div className="bg-card border border-border p-3 rounded-lg rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 bg-background border-t border-border">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type 'Enable Auto-Pay', or 'Tip GPT'..."
                className="min-h-[60px] pr-12 resize-none rounded-xl text-sm focus-visible:ring-primary bg-muted/30 border-input"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute bottom-2 right-2 h-8 w-8 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border" />

        <ResizablePanel defaultSize={65}>
          <ResizablePanelGroup direction="horizontal">
            <ResultPanel
              name="GPT-4 Turbo"
              tag="OpenAI"
              color="text-emerald-600 bg-emerald-50 border-emerald-100"
              icon={<Zap className="w-3 h-3" />}
              status={isTyping ? "gen" : (gptResult ? "done" : "idle")}
              code={gptResult?.code || ""}
              isWinner={winner === "GPT-4 Turbo"}
              hasWinner={!!winner}
            />

            <ResizableHandle className="bg-border w-[1px]" />

            <ResultPanel
              name="Gemini 1.5 Pro"
              tag="Google DeepMind"
              color="text-blue-600 bg-blue-50 border-blue-100"
              icon={<Flame className="w-3 h-3" />}
              status={isTyping ? "gen" : (geminiResult ? "done" : "idle")}
              code={geminiResult?.code || ""}
              isWinner={winner === "Gemini 1.5 Pro"}
              hasWinner={!!winner}
            />
          </ResizablePanelGroup>
        </ResizablePanel>

      </ResizablePanelGroup>
    </main>
  );
}

// Minimal Result Panel (Removed the button since Chat handles it now)
function ResultPanel({ name, tag, color, icon, status, code, isWinner, hasWinner }: any) {
  return (
    <ResizablePanel
      defaultSize={50}
      className={`relative flex flex-col h-full transition-colors duration-500 ${isWinner ? "bg-emerald-500/5" : "bg-card"} ${hasWinner && !isWinner ? "opacity-50 grayscale" : ""}`}
    >
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background/50 backdrop-blur z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-foreground">{name}</span>
          {isWinner && <Badge className="bg-green-600 text-white hover:bg-green-600 h-5 text-[10px]">🏆 Winner</Badge>}
        </div>
        {status !== "idle" && (
          <Badge variant="outline" className={`text-[10px] h-5 gap-1 border ${color}`}>{icon} {tag}</Badge>
        )}
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        <ScrollArea className="h-full w-full">
          <div className="p-6 pb-24">
            {status === "idle" ? (
              <div className="h-full flex flex-col items-center justify-center pt-20 text-muted-foreground text-xs gap-3">
                <div className="p-3 bg-muted rounded-full"><Sparkles className="w-5 h-5 text-muted-foreground" /></div>
                <span>Agent waiting...</span>
              </div>
            ) : status === "gen" ? (
              <div className="h-full flex flex-col items-center justify-center pt-20 text-muted-foreground text-xs gap-3">
                <Zap className="w-6 h-6 animate-spin text-muted-foreground" />
                <span>Streaming code...</span>
              </div>
            ) : (
              <pre className="font-mono text-[11px] leading-6 text-foreground selection:bg-primary selection:text-primary-foreground whitespace-pre-wrap break-all">
                {code}
              </pre>
            )}
          </div>
        </ScrollArea>

        {isWinner && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-in zoom-in duration-300 z-20">
            <Button variant="outline" className="bg-background border-emerald-500 text-emerald-600 dark:text-emerald-400 gap-2 rounded-full cursor-default shadow-sm h-9">
              <CheckCircle className="w-4 h-4" /> Tip Sent!
            </Button>
          </div>
        )}
      </div>
    </ResizablePanel>
  );
}
