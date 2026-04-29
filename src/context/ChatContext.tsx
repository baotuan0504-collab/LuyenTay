'use client';


import React, { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useEncryption } from './EncryptionContext';
const SOCKET_URL = "http://127.0.0.1:5201";

// const SOCKET_URL = "http://192.168.38.103:5201";


type ChatContextValue = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, string>; // chatId -> userId
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string, recipientPublicKey?: string) => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
};


const ChatContext = createContext<ChatContextValue | undefined>(undefined);


export function ChatProvider({ children }: PropsWithChildren<{}>) {
  const { accessToken, refreshAccessToken, signOut } = useAuth();
  const { encryptForUser } = useEncryption();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());


  const socketRef = useRef<Socket | null>(null);
  const joinedChatIds = useRef<Set<string>>(new Set());
  const isRefreshingToken = useRef(false);


  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      joinedChatIds.current.clear();
      isRefreshingToken.current = false;
      return;
    }


    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["polling", "websocket"],
      timeout: 20000,
      reconnectionAttempts: 5,
    });


    socketRef.current = newSocket;
    setSocket(newSocket);


    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
      joinedChatIds.current.forEach((chatId) => {
        newSocket.emit("join-chat", chatId);
      });
    });


    newSocket.on("connect_error", async (error) => {
      console.error("Socket connect error:", error);

      // If JWT expired, try to refresh token and reconnect
      if (error.message === "jwt expired" && !isRefreshingToken.current) {
        console.log("JWT expired, attempting to refresh token...");
        isRefreshingToken.current = true;
        try {
          await refreshAccessToken();
          // The useEffect will trigger again with new accessToken
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          await signOut();
        } finally {
          isRefreshingToken.current = false;
        }
      }
    });

    newSocket.on("socket-error", (error: { message: string }) => {
      console.warn("Socket error:", error.message);
    });


    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });


    newSocket.on("online-users", ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(userIds);
    });


    newSocket.on("user-online", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
    });


    newSocket.on("user-offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });


    newSocket.on("typing", (data: { chatId: string, userId: string, isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.chatId, data.userId);
        } else {
          if (next.get(data.chatId) === data.userId) {
            next.delete(data.chatId);
          }
        }
        return next;
      });
    });


    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken]);


  const joinChat = (chatId: string) => {
    socketRef.current?.emit("join-chat", chatId);
    joinedChatIds.current.add(chatId);
  };


  const leaveChat = (chatId: string) => {
    socketRef.current?.emit("leave-chat", chatId);
    joinedChatIds.current.delete(chatId);
  };


  const sendMessage = (chatId: string, text: string, recipientPublicKey?: string) => {
    let messageText = text;
    if (recipientPublicKey) {
      console.log('Encrypting message for recipient:', recipientPublicKey);
      const encrypted = encryptForUser(text, recipientPublicKey);
      if (encrypted) {
        messageText = encrypted;
        console.log('Message encrypted successfully');
      } else {
        console.warn('Encryption failed, sending plain text');
      }
    } else {
      console.warn('No recipient public key provided, sending plain text');
    }
    socketRef.current?.emit("send-message", { chatId, text: messageText });
  };


  const sendTyping = (chatId: string, isTyping: boolean) => {
    socketRef.current?.emit("typing", { chatId, isTyping });
  };


  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        joinChat,
        leaveChat,
        sendMessage,
        sendTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}


export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}



