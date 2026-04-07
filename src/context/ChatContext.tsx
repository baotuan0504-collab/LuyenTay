'use client';


import React, { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
const SOCKET_URL = "http://192.168.38.103:5201";

// const SOCKET_URL = "http://127.0.0.1:5201";


type ChatContextValue = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, string>; // chatId -> userId
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
};


const ChatContext = createContext<ChatContextValue | undefined>(undefined);


export function ChatProvider({ children }: PropsWithChildren<{}>) {
  const { accessToken, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());


  const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }


    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });


    socketRef.current = newSocket;
    setSocket(newSocket);


    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
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
  };


  const leaveChat = (chatId: string) => {
    socketRef.current?.emit("leave-chat", chatId);
  };


  const sendMessage = (chatId: string, text: string) => {
    socketRef.current?.emit("send-message", { chatId, text });
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



