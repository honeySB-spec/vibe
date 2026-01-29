# Vibe Check: The Consensus Agent ⚡️🧠
# Link: [vibe-brown-alpha.vercel.app](https://vibe-brown-alpha.vercel.app/)

**Vibe Check** is a next-generation AI coding interface built on the **x402 Protocol**. It is designed to generate secure, high-quality Smart Contracts by leveraging **Consensus Intelligence**—comparing outputs from multiple top-tier AI models (OpenAI & Gemini) to ensure reliability.

Just like a "Vibe Check" ensures a situation feels right, this agent "Checks" the code against two different "Brains" to ensure it's secure.
## 🚀 What Does It Do?

### 1. Dual-Model Consensus Integration (The "Vibe Check")
Unlike standard chatbots that rely on a single brain, **Vibe Check** queries **both** OpenAI (GPT-4 Turbo) and Google (Gemini 1.5 Pro) simultaneously.
*   **Why?** Single models hallucinate. By getting two opinions, you can instantly spot discrepancies.
*   **The UI**: It presents their code side-by-side (Split Screen), allowing you to choose the best implementation.

### 2. Autonomous Session Wallets (Auto-Pay)
This is a crypto-native application. It features **Session Wallets** that allow the AI to be "tipped" autonomously.
*   **How it works**: You "fund" the agent's local session wallet with a small amount of ETH (e.g., 0.002 ETH).
*   **Frictionless**: When a model wins your approval (i.e., passes the Vibe Check), the system executes a micro-payment on the blockchain **instantly and silently**. No popup to sign every time. This demonstrates the future of Agent-to-Agent economics.

### 3. Smart Intent Detection
The system intelligently distinguishes between:
*   **Chat Mode**: For learning concepts like "What is Reentrancy?" (Fast, Cheap).
*   **Code Mode**: For building actual contracts. It activates the expensive consensus engine only when you actually need code.

---

## 💡 Why "Vibe Check"?

In Web3, "Trust but Verify" is the golden rule.
*   **Security**: By cross-referencing logic from two distinct LLMs, you reduce the risk of hallucinated or vulnerable code.
*   **Speed**: "Auto-Pay" handles the economic layer in the background, making crypto usage feel like Web2.
*   **Future-Proof**: Built to interface with upcoming models, ensuring you always have the smartest developers in your pocket.

---

## 🛠 Tech Stack

### Frontend & UI
*   **Next.js 16 (App Router)**: The React framework for the web.
*   **Tailwind CSS v4**: For high-performance utility-first styling.
*   **Shadcn UI**: For accessible, premium components (based on Radix UI).
*   **Framer Motion**: For smooth animations (Confetti, Transitions).
*   **Lucide React**: For beautiful iconography.

### AI & Intelligence
*   **Google Gemini API**: Using `gemini-1.5-pro` for deep reasoning.
*   **OpenAI API**: Using `gpt-4-turbo` for code generation.

### Blockchain & Web3
*   **Wagmi & Viem**: Hooks and utilities for Ethereum.
*   **RainbowKit**: The best way to connect a wallet.
*   **Coinbase SDK**: For seamless onramps.
*   **x402 Protocol**: The underlying payment logic for AI agents.

---

## ⚡️ Getting Started

### 1. Prerequisites
*   Node.js 18+ installed.
*   An Ethereum Wallet (e.g., Coinbase Wallet, MetaMask, Rainbow).
*   API Keys for **OpenAI** and **Google Gemini**.

### 2. Installation

```bash
git clone https://github.com/your-username/vibe-check.git
cd vibe-check
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# AI Keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key_here

# WalletConnect (Get from cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start Vibe Checking!

---

## 🎮 How to Use

1.  **Connect Wallet**: Click the top-right button to connect your main wallet (Base Sepolia or Ethereum).
2.  **Fund Agent**: Type **"Enable Auto-Pay"** in the chat. Sign one transaction to send a small budget (e.g., 0.002 ETH) to your Session Wallet.
3.  **Generate Code**: Ask for a smart contract (e.g., *"Write an ERC20 token with a tax"*).
4.  **Vibe Check**: Watch both models generate code. Compare them.
5.  **Tip the Winner**: If you like GPT's code, type **"Tip GPT"**. If Gemini did better, **"Tip Gemini"**.
6.  **Watch the Magic**: Your Session Wallet will instantly pay the provider on-chain without interrupting your flow!

---
*Built with ❤️ by x402 Protocol*
