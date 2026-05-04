import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { apiFetch } from '../services/api';
import {
  decodeEncryptedMessage,
  decryptMessage,
  encodeEncryptedMessage,
  encryptMessage,
  generateKeyPair,
  getSharedSecret as deriveSharedSecret,
  encrypt as symmetricEncrypt,
  decrypt as symmetricDecrypt,
  generateGroupKey,
  encryptWithGroupKey,
  decryptWithGroupKey
} from '../utils/encryption';
import * as chatService from '../services/chat.service';
import * as userService from '../services/user.service';
import { useAuth } from './AuthContext';

interface EncryptionContextValue {
  publicKey: string | null;
  encryptForUser: (message: string, recipientPublicKey: string) => string | null;
  decryptFromUser: (encodedMessage: string, senderPublicKey: string) => string | null;
  getSharedSecret: (otherPublicKey: string) => string | null;
  encryptMessage: (text: string, otherPublicKey: string) => any;
  decryptMessage: (encrypted: any, otherPublicKey: string) => string | null;
  getGroupKey: (chatId: string) => Promise<string | null>;
  setupGroupKey: (chatId: string, participants: any[]) => Promise<string>;
  encryptGroupMessage: (text: string, chatId: string) => Promise<any>;
  decryptGroupMessage: (encrypted: any, chatId: string) => Promise<string | null>;
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
      let storedPrivKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
      let storedPubKey = await SecureStore.getItemAsync(PUBLIC_KEY_STORAGE_KEY);

      if (!storedPrivKey || !storedPubKey) {
        const keys = generateKeyPair();
        await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, keys.privateKey);
        await SecureStore.setItemAsync(PUBLIC_KEY_STORAGE_KEY, keys.publicKey);
        storedPrivKey = keys.privateKey;
        storedPubKey = keys.publicKey;
      }

      setPrivateKey(storedPrivKey);
      setPublicKey(storedPubKey);

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
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to upload public key:', error);
    }
  };

  const encryptForUser = (message: string, recipientPublicKey: string): string | null => {
    if (!privateKey) return null;
    const encrypted = encryptMessage(message, recipientPublicKey, privateKey);
    return encodeEncryptedMessage(encrypted);
  };

  const decryptFromUser = (encodedMessage: string, senderPublicKey: string): string | null => {
    if (!privateKey) return null;
    const encryptedObj = decodeEncryptedMessage(encodedMessage);
    if (!encryptedObj) return null;
    return decryptMessage(encryptedObj, senderPublicKey, privateKey);
  };

  const getGroupKey = async (chatId: string): Promise<string | null> => {
    try {
      const localKey = await SecureStore.getItemAsync(`group_key_${chatId}`);
      if (localKey) return localKey;

      const chat = await chatService.getChatById(chatId);
      const myKeyInfo = chat.encryptedGroupKeys?.find((k: any) => k.userId === user?.id || k.userId?._id === user?.id);
      if (!myKeyInfo || !chat.creator || !privateKey) return null;

      const creatorId = typeof chat.creator === 'string' ? chat.creator : (chat.creator as any)._id;
      const creator = await userService.getUserById(creatorId);
      if (!creator.publicKey || !privateKey) return null;

      const secret = deriveSharedSecret(creator.publicKey, privateKey);
      if (!secret) return null;

      const decryptedGroupKey = symmetricDecrypt({
        ciphertext: myKeyInfo.encryptedKey,
        nonce: myKeyInfo.nonce
      }, secret);

      if (decryptedGroupKey) {
        await SecureStore.setItemAsync(`group_key_${chatId}`, decryptedGroupKey);
        return decryptedGroupKey;
      }
      return null;
    } catch (error) {
      console.error("Error getting group key:", error);
      return null;
    }
  };

  const setupGroupKey = async (chatId: string, participants: any[]): Promise<string> => {
    if (!privateKey) throw new Error("Private key missing");
    const newKey = generateGroupKey();
    const encryptedKeys = [];
    for (const p of participants) {
      if (p.publicKey) {
        const secret = deriveSharedSecret(p.publicKey, privateKey);
        if (secret) {
          const encrypted = symmetricEncrypt(newKey, secret);
          encryptedKeys.push({
            userId: p._id,
            encryptedKey: encrypted.ciphertext,
            nonce: encrypted.nonce
          });
        }
      }
    }
    await chatService.updateChat(chatId, { encryptedGroupKeys: encryptedKeys as any });
    await SecureStore.setItemAsync(`group_key_${chatId}`, newKey);
    return newKey;
  };

  const encryptGroupMessage = async (text: string, chatId: string) => {
    let key = await getGroupKey(chatId);
    if (!key) {
      const chat = await chatService.getChatById(chatId);
      if (chat.creator === user?.id || (chat.creator as any)?._id === user?.id) {
        key = await setupGroupKey(chatId, chat.participants || []);
      } else {
        throw new Error("Group key not found and you are not the creator");
      }
    }
    return encryptWithGroupKey(text, key);
  };

  const decryptGroupMessage = async (encrypted: any, chatId: string) => {
    const key = await getGroupKey(chatId);
    if (!key) return null;
    return decryptWithGroupKey(encrypted, key);
  };

  return (
    <EncryptionContext.Provider
      value={{
        publicKey,
        encryptForUser,
        decryptFromUser,
        getSharedSecret: (pk) => (privateKey ? deriveSharedSecret(pk, privateKey) : null),
        encryptMessage: (text, pk) => {
          if (!privateKey) return null;
          const secret = deriveSharedSecret(pk, privateKey);
          return secret ? symmetricEncrypt(text, secret) : null;
        },
        decryptMessage: (enc, pk) => {
          if (!privateKey) return null;
          const secret = deriveSharedSecret(pk, privateKey);
          return secret ? symmetricDecrypt(enc, secret) : null;
        },
        getGroupKey,
        setupGroupKey,
        encryptGroupMessage,
        decryptGroupMessage,
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
