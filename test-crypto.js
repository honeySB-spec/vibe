
const { secp256k1 } = require('@noble/curves/secp256k1');
// If this fails, we might need to find where viem re-exports it or stick to standard web crypto if possible (though curves are harder there).
// Let's try importing from viem's internal structure or checking node_modules.

try {
    const priv = secp256k1.utils.randomPrivateKey();
    const pub = secp256k1.getPublicKey(priv);
    console.log("Success: noble-curves available");
} catch (e) {
    console.log("Error:", e.message);
}
