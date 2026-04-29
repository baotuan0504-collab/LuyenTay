import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { apiFetch } from '../services/api';
import {
  decodeEncryptedMessage,
  decryptMessage,
  encodeEncryptedMessage,
  encryptMessage,
  generateKeyPair
} from '../utils/encryption';
import { useAuth } from './AuthContext';

const API_URL = "http://127.0.0.1:5201/api"; // Same as in your other services

interface EncryptionContextValue {
  publicKey: string | null;
  encryptForUser: (message: string, recipientPublicKey: string) => string | null;
  decryptFromUser: (encodedMessage: string, senderPublicKey: string) => string | null;
  isReady: boolean;
}

const EncryptionContext = createContext<EncryptionContextValue | undefined>(undefined);

const PRIVATE_KEY_STORAGE_KEY = 'chat_e2ee_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'chat_e2ee_public_key';

export function EncryptionProvider({ children }: PropsWithChildren<{}>) {
  const { user, accessToken } = useAuth();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user && accessToken) {
      initializeKeys();
    } else {
      setPublicKey(null);
      setPrivateKey(null);
      setIsReady(false);
    }
  }, [user, accessToken]);

  const initializeKeys = async () => {
    try {
      // 1. Try to load existing keys from SecureStore
      let storedPrivKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
      let storedPubKey = await SecureStore.getItemAsync(PUBLIC_KEY_STORAGE_KEY);

      if (!storedPrivKey || !storedPubKey) {
        // 2. Generate new keys if not found
        console.log('Generating new E2EE keys...');
        const keys = generateKeyPair();
        await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, keys.privateKey);
        await SecureStore.setItemAsync(PUBLIC_KEY_STORAGE_KEY, keys.publicKey);
        storedPrivKey = keys.privateKey;
        storedPubKey = keys.publicKey;
      }

      setPrivateKey(storedPrivKey);
      setPublicKey(storedPubKey);
      console.log('Encryption keys initialized. Public key:', storedPubKey);

      // 3. Sync public key with server if necessary
      if (user && user.publicKey !== storedPubKey) {
        await uploadPublicKey(storedPubKey);
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing encryption keys:', error);
    }
  };

  const uploadPublicKey = async (key: string) => {
    try {
      await apiFetch('/users/public-key', {
        method: 'PUT',
        body: JSON.stringify({ publicKey: key }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Public key uploaded to server');
    } catch (error) {
      console.error('Failed to upload public key:', error);
    }
  };

  const encryptForUser = (message: string, recipientPublicKey: string): string | null => {
    if (!privateKey) {
      console.warn('Encryption failed: Local privateKey is missing');
      return null;
    }
    if (!recipientPublicKey) {
      console.warn('Encryption failed: recipientPublicKey is missing');
      return null;
    }
    const encrypted = encryptMessage(message, recipientPublicKey, privateKey);
    return encodeEncryptedMessage(encrypted);
  };

  const decryptFromUser = (encodedMessage: string, senderPublicKey: string): string | null => {
    if (!privateKey) {
      console.warn('Decryption failed: Local privateKey is missing');
      return null;
    }
    if (!senderPublicKey) {
      console.warn('Decryption failed: senderPublicKey is missing');
      return null;
    }
    const encryptedObj = decodeEncryptedMessage(encodedMessage);
    if (!encryptedObj) return null; // Not an encrypted message
    return decryptMessage(encryptedObj, senderPublicKey, privateKey);
  };

  return (
    <EncryptionContext.Provider
      value={{
        publicKey,
        encryptForUser,
        decryptFromUser,
        isReady
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}
