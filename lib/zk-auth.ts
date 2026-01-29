import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha256.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

// Schnorr Identification Protocol (Non-Interactive via Fiat-Shamir)
// Prover knows x  s.t.  Y = x*G
// 1. Prover selects random k, computes R = k*G
// 2. Prover computes challenge c = Hash(Public Key || R || Context)
// 3. Prover computes response s = k + c*x  (mod n)
// 4. Prover sends (R, s)
// 5. Verifier checks: s*G == R + c*Y

// We use the curve order n from secp256k1 (Hardcoded to avoid import issues)
const n = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');

// Context ensures the proof is unique to this login attempt
export interface ZKProof {
    R: string; // Hex string of Point R
    s: string; // Hex string of scalar s
}

export interface ZKIdentity {
    secret: string; // Private key (hex)
    public: string; // Public key (hex)
}

export class ZKAuth {
    // Generate a new Identity (Private/Public key pair)
    static generateIdentity(): ZKIdentity {
        const priv = secp256k1.utils.randomSecretKey();
        const pub = secp256k1.getPublicKey(priv);
        return {
            secret: bytesToHex(priv),
            public: bytesToHex(pub),
        };
    }

    // Create a Zero Knowledge Proof
    static createProof(secretHex: string, context: string): ZKProof {
        const secret = BigInt('0x' + secretHex);
        const k = BigInt('0x' + bytesToHex(secp256k1.utils.randomSecretKey())); // Random nonce
        const R = secp256k1.Point.BASE.multiply(k);
        const RHex = R.toHex(true);

        // Public Key (Y)
        const pubKeyPoint = secp256k1.Point.BASE.multiply(secret);
        const pubKeyHex = pubKeyPoint.toHex(true);

        // Challenge c = Hash(PubKey || R || Context)
        // We use a simple concatenation for the hash preimage for this demo
        // In prod, use structured serialization
        const msg = new TextEncoder().encode(pubKeyHex + RHex + context);
        const hash = sha256(msg);
        const c = BigInt('0x' + bytesToHex(hash));

        // s = k + c*x (mod n)
        const s = (k + (c * secret)) % n;

        return {
            R: RHex,
            s: s.toString(16), // Send as hex string
        };
    }

    // Verify the Proof
    static verifyProof(publicKeyHex: string, proof: ZKProof, context: string): boolean {
        try {
            const R = secp256k1.Point.fromHex(proof.R);
            const s = BigInt('0x' + proof.s);
            const Y = secp256k1.Point.fromHex(publicKeyHex);

            // Challenge c = Hash(PubKey || R || Context)
            const msg = new TextEncoder().encode(publicKeyHex + proof.R + context);
            const hash = sha256(msg);
            const c = BigInt('0x' + bytesToHex(hash));

            // Verify: s*G == R + c*Y
            // Left Side
            const left = secp256k1.Point.BASE.multiply(s);

            // Right Side
            const cY = Y.multiply(c);
            const right = R.add(cY);

            return left.equals(right);
        } catch (e) {
            console.error("Verification Error:", e);
            return false;
        }
    }
}
