"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.randomBytes = exports.createHash = exports.sealOpen = exports.seal = exports.boxOpen = exports.box = exports.createKeys = void 0;
/*

DOCUMENTATION:
https://github.com/sodium-friends/sodium-native
https://sodium-friends.github.io/docs/docs/keyboxencryption
https://download.libsodium.org/doc/public-key_cryptography/authenticated_encryption


NOTES
- sodium.sodium_malloc creates a "secure buffer". Not sure what that means, but it
  sounds important. The examples always use secure buffers for the secret key.

https://download.libsodium.org/doc/public-key_cryptography/authenticated_encryption
- libsodium's box algorithm does public-private key encryption with signatures.
- the nonce used in box is a random set of bytes that could probably be generated by
  the library internally.
- we can improve the performance of box when we're communicating constantly with the
    same person by using the _beforenm and _afternm functions to reuse shared key.

https://download.libsodium.org/doc/public-key_cryptography/sealed_boxes
- libsodium's seal algorithm does public-private key encryption without authenticating
    the signature. It reuses the box algorithm by generating an ephemeral keypair, sending
  the public key with the message, and generating the nonce from the recipients public key.

*/
var sodium_native_1 = __importDefault(require("sodium-native"));
var crypto = __importStar(require("crypto"));
function createKeys() {
    var publicKey = sodium_native_1["default"].sodium_malloc(sodium_native_1["default"].crypto_box_PUBLICKEYBYTES);
    var secretKey = sodium_native_1["default"].sodium_malloc(sodium_native_1["default"].crypto_box_SECRETKEYBYTES);
    // Fill buffers with new keypair
    sodium_native_1["default"].crypto_box_keypair(publicKey, secretKey);
    return {
        publicKey: publicKey,
        secretKey: secretKey,
        dealloc: function () {
            sodium_native_1["default"].sodium_memzero(publicKey);
            sodium_native_1["default"].sodium_memzero(secretKey);
        }
    };
}
exports.createKeys = createKeys;
function bufferView(buf, start, length) {
    return Buffer.from(buf.buffer, buf.byteOffset + start, length);
}
function box(args) {
    var message = args.message, secretKey = args.from.secretKey, publicKey = args.to.publicKey;
    // Alloc only a single buffer for the whole payload.
    var payload = Buffer.alloc(message.length + sodium_native_1["default"].crypto_box_MACBYTES + sodium_native_1["default"].crypto_box_NONCEBYTES);
    // Create a view of the payload for the ciphertext, mac, and nonce.
    var ciphertext = bufferView(payload, 0, message.length);
    var mac = bufferView(payload, message.length, sodium_native_1["default"].crypto_box_MACBYTES);
    var nonce = bufferView(payload, message.length + sodium_native_1["default"].crypto_box_MACBYTES, sodium_native_1["default"].crypto_box_NONCEBYTES);
    // Create the nonce.
    sodium_native_1["default"].randombytes_buf(nonce);
    // Encrypt
    sodium_native_1["default"].crypto_box_detached(ciphertext, mac, message, nonce, publicKey, secretKey);
    return payload;
}
exports.box = box;
function boxOpen(args) {
    var payload = args.payload, publicKey = args.from.publicKey, secretKey = args.to.secretKey;
    // Create a view of the nonce, mac, and ciphertext inside the payload.
    var nonce = bufferView(payload, payload.length - sodium_native_1["default"].crypto_box_NONCEBYTES, sodium_native_1["default"].crypto_box_NONCEBYTES);
    var mac = bufferView(payload, payload.length - sodium_native_1["default"].crypto_box_NONCEBYTES - sodium_native_1["default"].crypto_box_MACBYTES, sodium_native_1["default"].crypto_box_MACBYTES);
    var ciphertext = bufferView(payload, 0, payload.length - sodium_native_1["default"].crypto_box_NONCEBYTES - sodium_native_1["default"].crypto_box_MACBYTES);
    // Alloc for the message
    var message = Buffer.alloc(ciphertext.length);
    // Decrypt and verify signature.
    var verified = sodium_native_1["default"].crypto_box_open_detached(message, ciphertext, mac, nonce, publicKey, secretKey);
    if (!verified) {
        throw new Error("Verification failed.");
    }
    return message;
}
exports.boxOpen = boxOpen;
function seal(args) {
    var message = args.message, publicKey = args.to.publicKey;
    // Create payload
    var ciphertext = Buffer.alloc(message.length + sodium_native_1["default"].crypto_box_SEALBYTES);
    // Encrypt
    sodium_native_1["default"].crypto_box_seal(ciphertext, message, publicKey);
    return ciphertext;
}
exports.seal = seal;
function sealOpen(args) {
    var payload = args.payload, _a = args.to, publicKey = _a.publicKey, secretKey = _a.secretKey;
    // Create payload
    var message = Buffer.alloc(payload.length - sodium_native_1["default"].crypto_box_SEALBYTES);
    // Decrypt
    sodium_native_1["default"].crypto_box_seal_open(message, payload, publicKey, secretKey);
    return message;
}
exports.sealOpen = sealOpen;
// TODO: consider a more secure hashing function to keep public keys anonymous.
function createHash(message) {
    return crypto.createHash("sha256").update(message).digest();
}
exports.createHash = createHash;
function randomBytes(bytes) {
    var buf = Buffer.alloc(bytes);
    sodium_native_1["default"].randombytes_buf(buf);
    return buf;
}
exports.randomBytes = randomBytes;
//# sourceMappingURL=crypto.js.map