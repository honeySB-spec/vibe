
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha256.js';
import { bytesToHex } from '@noble/hashes/utils.js';

// Duplicate logic from lib/zk-auth.ts for standalone testing
const n = secp256k1.CURVE.n;

function generateIdentity() {
    const priv = secp256k1.utils.randomPrivateKey();
    const pub = secp256k1.getPublicKey(priv);
    return {
        secret: bytesToHex(priv),
        public: bytesToHex(pub),
    };
}

function createProof(secretHex, context) {
    const secret = BigInt('0x' + secretHex);
    const k = BigInt('0x' + bytesToHex(secp256k1.utils.randomPrivateKey()));
    const R = secp256k1.ProjectivePoint.BASE.multiply(k);
    const RHex = R.toHex(true);

    // Public Key (Y)
    const pubKeyPoint = secp256k1.ProjectivePoint.BASE.multiply(secret);
    const pubKeyHex = pubKeyPoint.toHex(true);

    const msg = new TextEncoder().encode(pubKeyHex + RHex + context);
    const hash = sha256(msg);
    const c = BigInt('0x' + bytesToHex(hash));

    const s = (k + (c * secret)) % n;

    return {
        R: RHex,
        s: s.toString(16),
    };
}

function verifyProof(publicKeyHex, proof, context) {
    try {
        const R = secp256k1.ProjectivePoint.fromHex(proof.R);
        const s = BigInt('0x' + proof.s);
        const Y = secp256k1.ProjectivePoint.fromHex(publicKeyHex);
        const msg = new TextEncoder().encode(publicKeyHex + proof.R + context);
        const hash = sha256(msg);
        const c = BigInt('0x' + bytesToHex(hash));

        const left = secp256k1.ProjectivePoint.BASE.multiply(s);
        const cY = Y.multiply(c);
        const right = R.add(cY);

        return left.equals(right);
    } catch (e) {
        console.error("Verification Error:", e);
        return false;
    }
}

// Test Flow
console.log("---- ZKP Flow Test (ESM) ----");
const id = generateIdentity();
console.log("Identity Generated:", id.public);

const context = "test-context";
const proof = createProof(id.secret, context);
console.log("Proof Generated:", proof);

const isValid = verifyProof(id.public, proof, context);
console.log("Verification Result:", isValid);

if (isValid) {
    console.log("SUCCESS: Zero Knowledge Proof Verified!");
} else {
    console.error("FAILURE: Proof Invalid");
    process.exit(1);
}
