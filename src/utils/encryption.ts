import nacl from 'tweetnacl';
import { toByteArray as decodeBase64, fromByteArray as encodeBase64 } from 'base64-js';

/**
 * React Native PRNG Polyfill
 * tweetnacl requires a way to generate random bytes.
 */
const getRandomValues = (x: Uint8Array) => {
  if (typeof global !== 'undefined' && (global as any).crypto && (global as any).crypto.getRandomValues) {
    return (global as any).crypto.getRandomValues(x);
  }
  // Fallback if needed, though react-native-get-random-values should provide the above
  throw new Error('No secure random number generator found. Ensure react-native-get-random-values is imported.');
};

// Force tweetnacl to use our PRNG
nacl.setPRNG((x, n) => {
  const bytes = new Uint8Array(n);
  getRandomValues(bytes);
  for (let i = 0; i < n; i++) x[i] = bytes[i];
  // Clean up
  for (let i = 0; i < n; i++) bytes[i] = 0;
});

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
}

/**
 * Generates a new X25519 key pair for authenticated encryption.
 */
export const generateKeyPair = (): KeyPair => {
  const keys = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keys.publicKey),
    privateKey: encodeBase64(keys.secretKey),
  };
};

/**
 * Encrypts a message using the sender's private key and the recipient's public key.
 */
export const encryptMessage = (
  message: string,
  recipientPublicKey: string,
  senderPrivateKey: string
): EncryptedMessage => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = new TextEncoder().encode(message);
  const recipientPubKeyUint8 = decodeBase64(recipientPublicKey);
  const senderPrivKeyUint8 = decodeBase64(senderPrivateKey);

  const encrypted = nacl.box(
    messageUint8,
    nonce,
    recipientPubKeyUint8,
    senderPrivKeyUint8
  );

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
};

/**
 * Decrypts a message using the recipient's private key and the sender's public key.
 */
export const decryptMessage = (
  encryptedData: EncryptedMessage,
  senderPublicKey: string,
  recipientPrivateKey: string
): string | null => {
  try {
    const ciphertextUint8 = decodeBase64(encryptedData.ciphertext);
    const nonceUint8 = decodeBase64(encryptedData.nonce);
    const senderPubKeyUint8 = decodeBase64(senderPublicKey);
    const recipientPrivKeyUint8 = decodeBase64(recipientPrivateKey);

    const decrypted = nacl.box.open(
      ciphertextUint8,
      nonceUint8,
      senderPubKeyUint8,
      recipientPrivKeyUint8
    );

    if (!decrypted) {
      return null;
    }

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Helper to encode an encrypted message object to a string for storage/transmission.
 */
export const encodeEncryptedMessage = (data: EncryptedMessage): string => {
  return JSON.stringify(data);
};

/**
 * Helper to decode an encrypted message string back to an object.
 */
export const decodeEncryptedMessage = (encoded: string): EncryptedMessage | null => {
  try {
    const parsed = JSON.parse(encoded);
    if (parsed.ciphertext && parsed.nonce) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};
