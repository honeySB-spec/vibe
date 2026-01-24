import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, publicActions, createPublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';

const SESSION_KEY_STORAGE = 'x402_session_key';

export function getSessionAccount() {
    if (typeof window === 'undefined') return null;

    let privateKey = localStorage.getItem(SESSION_KEY_STORAGE) as `0x${string}`;

    if (!privateKey) {
        privateKey = generatePrivateKey();
        localStorage.setItem(SESSION_KEY_STORAGE, privateKey);
    }

    return privateKeyToAccount(privateKey);
}

// Client for reading data (Balance check)
export const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
});

// Client for writing data (Sending Tips)
export function createSessionClient() {
    const account = getSessionAccount();
    if (!account) return null;

    return createWalletClient({
        account,
        chain: baseSepolia,
        transport: http()
    }).extend(publicActions); // Extend to allow .getBalance etc if needed
}
