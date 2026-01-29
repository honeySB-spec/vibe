import { secp256k1 } from '@noble/curves/secp256k1.js';

console.log("secp256k1 keys:", Object.keys(secp256k1));
if (secp256k1.utils) {
    console.log("ctx.utils keys:", Object.keys(secp256k1.utils));
    console.log("Is randomSecretKey a function?", typeof secp256k1.utils.randomSecretKey === 'function');
    console.log("Is randomPrivateKey a function?", typeof secp256k1.utils.randomPrivateKey === 'function');
} else {
    console.log("utils undefined");
}
