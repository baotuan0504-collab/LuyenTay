import { MessageBubble, type MessageData } from "@/components/MessageBubble";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useEncryption } from "@/context/EncryptionContext";
import { isUnauthorizedError } from "@/services/api";
import * as chatService from "@/services/chat.service";
import * as messageService from "@/services/message.service";
import * as userService from "@/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ChatRoomScreen() {
  const { id: chatId, name, avatar, participantId, isGroup } = useLocalSearchParams();
  const { user, accessToken, signOut } = useAuth();
  const { joinChat, leaveChat, sendMessage, sendTyping, isConnected, typingUsers, socket } = useChat();
  const { encryptMessage, decryptMessage, encryptGroupMessage, decryptGroupMessage, isReady: isEncryptionReady } = useEncryption();
  const router = useRouter();


  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [participantPublicKey, setParticipantPublicKey] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatCreator, setChatCreator] = useState<string | null>(null);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);


  const isTyping = typingUsers.get(chatId as string) === participantId;





  useEffect(() => {
    const initChat = async () => {
      if (user && accessToken && chatId && isEncryptionReady) {
        setMessages([]); // Clear previous messages
        setIsLoading(true);
        // Load key first, then messages to prevent flash
        const key = await loadParticipantInfo();
        await loadInitialMessages(key);
        joinChat(chatId as string);
      }
    };

    initChat();

    return () => {
      if (chatId) {
        leaveChat(chatId as string);
      }
    };
  }, [chatId, accessToken, isEncryptionReady]);


  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;


    const handleNewMessage = async (message: any) => {
      const messageChatId = typeof message.chat === "string"
        ? message.chat
        : message.chat?._id ?? String(message.chat);

      if (messageChatId === chatId) {
        let decryptedText = message.text;
        try {
            const content = message.text;
            if (content) {
                let encryptedObj = null;
                if (typeof content === 'string' && content.includes('"ciphertext":')) {
                    encryptedObj = JSON.parse(content);
                } else if (typeof content === 'object' && content.ciphertext) {
                    encryptedObj = content;
                }

                if (encryptedObj) {
                    if (isGroup === "true") {
                        decryptedText = await decryptGroupMessage(encryptedObj, chatId as string);
                    } else if (participantPublicKey) {
                        let text = decryptMessage(encryptedObj, participantPublicKey);
                        // Fix for previously double-encrypted messages
                        if (text && text.includes('"ciphertext":')) {
                            try {
                                const innerObj = JSON.parse(text);
                                if (innerObj.ciphertext) {
                                    const innerDec = decryptMessage(innerObj, participantPublicKey);
                                    if (innerDec) text = innerDec;
                                }
                            } catch (e) {}
                        }
                        decryptedText = text;
                    }
                }
            }
        } catch (e) {
            console.error("Error decrypting incoming message", e);
        }

        setMessages((prev) => {
          const senderId = typeof message.sender === 'string' ? message.sender : (message.sender._id || message.sender.id);
          const isMe = String(senderId) === String(user?.id);
          
          // Check for duplicates (match by ID or by recent content/sender)
          const isDuplicate = prev.some(m => 
            m._id === message._id || 
            (isMe && m._id.startsWith('temp-') && Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 15000)
          );
          
          if (isDuplicate) {
            // Update the temp message with real data from server but KEEP the decrypted/plain text
            return prev.map(m => {
              const isTemp = m._id === message._id || (isMe && m._id.startsWith('temp-'));
              if (isTemp && isMe) {
                // It's my own message, keep my local plain text but update the ID and status
                // Only keep local text if it's not JSON (meaning it's already plain)
                const localTextIsPlain = typeof m.text === 'string' && !m.text.includes('"ciphertext":');
                return { ...message, text: localTextIsPlain ? m.text : (decryptedText || message.text) }; 
              }
              if (m._id === message._id) return { ...message, text: decryptedText || message.text };
              return m;
            });
          }
          
          return [{ ...message, text: decryptedText || message.text }, ...prev];
        });
      }
    };


    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, chatId, participantPublicKey]);


  const loadParticipantInfo = async () => {
    if (isGroup === "true") return null; 
    
    try {
      // 1. Try to get chat info first
      if (chatId) {
        const chat = await chatService.getChatById(chatId as string);
        if (chat.creator) {
          const creatorId = typeof chat.creator === 'string' ? chat.creator : chat.creator._id;
          setChatCreator(creatorId);
        }
        if (chat.nicknames) setNicknames(chat.nicknames);

        // Try 'participant' field
        if (chat && chat.participant && chat.participant.publicKey) {
          setParticipantPublicKey(chat.participant.publicKey);
          return chat.participant.publicKey;
        }
        
        // Search in 'participants' array
        if (chat && chat.participants && Array.isArray(chat.participants)) {
          const myId = String(user?.id);
          const other = chat.participants.find((p: any) => String(p._id || p.id) !== myId);
          if (other && other.publicKey) {
            setParticipantPublicKey(other.publicKey);
            return other.publicKey;
          }
        }
      }

      // 2. Fallback to search params
      if (participantId) {
        const data = await userService.getUserById(participantId as string);
        if (data && data.publicKey && data.publicKey.length > 0) {
          setParticipantPublicKey(data.publicKey);
          return data.publicKey;
        }
      }

      return null;
    } catch (error) {
      console.error("Error loading participant info:", error);
      return null;
    }
  };


  const loadInitialMessages = async (keyOverride?: string | null) => {
    setIsLoading(true);
    try {
      const data = await messageService.getMessages(chatId as string, 20);
      let pk = keyOverride || participantPublicKey;

      // If we found encrypted messages but have no key, try one last time to get the key
      if (!pk && isGroup !== "true" && data.some(m => m.text?.includes('"ciphertext":'))) {
        console.log("[DEBUG] Found encrypted messages but no key, retrying loadParticipantInfo...");
        pk = await loadParticipantInfo();
      }
      
      const decryptedData = await Promise.all(data.map(async (msg: any) => {
        try {
          const content = msg.text;
          if (!content) return msg;

          let encryptedObj = null;
          if (typeof content === 'string' && content.includes('"ciphertext":')) {
            encryptedObj = JSON.parse(content);
          } else if (typeof content === 'object' && content.ciphertext) {
            encryptedObj = content;
          }

          if (encryptedObj) {
            if (isGroup === "true") {
              const text = await decryptGroupMessage(encryptedObj, chatId as string);
              return { ...msg, text: text || "🔒 [Lỗi giải mã nhóm]" };
            } else if (pk) {
              let decryptedText = decryptMessage(encryptedObj, pk);
              // Fix for previously double-encrypted messages
              if (decryptedText && decryptedText.includes('"ciphertext":')) {
                  try {
                      const innerObj = JSON.parse(decryptedText);
                      if (innerObj.ciphertext) {
                          const innerDec = decryptMessage(innerObj, pk);
                          if (innerDec) decryptedText = innerDec;
                      }
                  } catch (e) {}
              }
              if (decryptedText) {
                return { ...msg, text: decryptedText };
              } else {
                return { ...msg, text: "🔒 [Không thể giải mã tin nhắn]" };
              }
            } else {
              // Return original msg so decryptAll can process it later
              return msg;
            }
          }
        } catch (e) {
          console.error("Error decrypting message on load:", e);
        }
        return msg;
      }));
      
      const hasEncrypted = decryptedData.some(m => 
        m.text && typeof m.text === 'string' && (m.text.includes('"ciphertext":') || m.text === "⌛ Đang giải mã...")
      );
      
      setMessages(decryptedData);
      
      // Only stop loading if we have no encrypted messages left or we have a key and failed
      if (!hasEncrypted || pk) {
        setIsLoading(false);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error loading messages:", error);
      setIsLoading(false);
    }
  };

  // Re-decrypt messages when keys or chat changes
  useEffect(() => {
    const decryptAll = async () => {
      if (messages.length === 0) return;
      
      const decryptedData = await Promise.all(messages.map(async (msg) => {
        if (msg.text && typeof msg.text === 'string' && msg.text.includes('"ciphertext":')) {
          try {
            const encryptedObj = JSON.parse(msg.text);
            if (isGroup === "true") {
              const text = await decryptGroupMessage(encryptedObj, chatId as string);
              return text ? { ...msg, text } : msg;
            } else if (participantPublicKey) {
              let text = decryptMessage(encryptedObj, participantPublicKey);
              // Fix for previously double-encrypted messages
              if (text && text.includes('"ciphertext":')) {
                  try {
                      const innerObj = JSON.parse(text);
                      if (innerObj.ciphertext) {
                          const innerDec = decryptMessage(innerObj, participantPublicKey);
                          if (innerDec) text = innerDec;
                      }
                  } catch (e) {}
              }
              return text ? { ...msg, text } : msg;
            }
          } catch (e) { return msg; }
        }
        return msg;
      }));

      const isDifferent = decryptedData.some((m, i) => m.text !== messages[i].text);
      if (isDifferent) {
        setMessages(decryptedData);
      }

      // If everything is now decrypted, we can stop loading
      const stillEncrypted = decryptedData.some(m => 
        m.text && typeof m.text === 'string' && (m.text.includes('"ciphertext":') || m.text === "⌛ Đang giải mã...")
      );
      if (!stillEncrypted && decryptedData.length > 0) {
        setIsLoading(false);
      }
    };

    decryptAll();
  }, [participantPublicKey, chatId, isEncryptionReady, messages]);


  const loadMoreMessages = async () => {
    if (isFetchingMore || !hasMore || messages.length === 0) return;

    setIsFetchingMore(true);
    try {
      const oldestMessage = messages[messages.length - 1];
      const data = await messageService.getMessages(
        chatId as string,
        20,
        oldestMessage.createdAt
      );

      if (data.length > 0) {
        const pk = participantPublicKey;
        const decryptedData = await Promise.all(data.map(async (msg: any) => {
          try {
            if (msg.text.includes('"ciphertext":')) {
              const encryptedObj = JSON.parse(msg.text);
              if (isGroup === "true") {
                const text = await decryptGroupMessage(encryptedObj, chatId as string);
                return { ...msg, text: text || "🔒 [Lỗi giải mã nhóm]" };
              } else if (pk) {
                let decryptedText = decryptMessage(encryptedObj, pk);
                // Fix for previously double-encrypted messages
                if (decryptedText && decryptedText.includes('"ciphertext":')) {
                    try {
                        const innerObj = JSON.parse(decryptedText);
                        if (innerObj.ciphertext) {
                            const innerDec = decryptMessage(innerObj, pk);
                            if (innerDec) decryptedText = innerDec;
                        }
                    } catch (e) {}
                }
                return { ...msg, text: decryptedText || "🔒 [Không thể giải mã tin nhắn]" };
              }
            }
          } catch (e) {
            console.error("Error decrypting more messages:", e);
          }
          return msg;
        }));

        setMessages((prev) => [...prev, ...decryptedData]);
        setHasMore(data.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };


  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    
    const textToSend = inputText.trim();
    setIsSending(true);
    
    try {
      let finalContent = textToSend;
      
      if (isGroup === "true") {
        const encrypted = await encryptGroupMessage(textToSend, chatId as string);
        if (!encrypted) {
          console.error("Group encryption failed");
          setIsSending(false);
          return;
        }
        finalContent = JSON.stringify(encrypted);
      } else if (participantPublicKey) {
        const encrypted = encryptMessage(textToSend, participantPublicKey);
        if (!encrypted) {
          console.error("P2P encryption failed");
          setIsSending(false);
          return;
        }
        finalContent = JSON.stringify(encrypted);
      }

      // Add message locally for instant feedback
      const tempId = `temp-${Date.now()}`;
      const tempMessage: MessageData = {
          _id: tempId,
          text: textToSend, // Show plain text locally
          sender: user?.id || "",
          createdAt: new Date().toISOString()
      };
      setMessages(prev => [tempMessage, ...prev]);

      sendMessage(chatId as string, finalContent);
      setInputText("");
      sendTyping(chatId as string, false);
    } finally {
      // Small delay to prevent double-tap
      setTimeout(() => setIsSending(false), 500);
    }
  };

  const handleDeleteGroup = async () => {
    if (!chatId) return;
    
    const confirm = await new Promise((resolve) => {
      if (Platform.OS === 'web') {
        resolve(window.confirm("Bạn có chắc chắn muốn xóa nhóm này không?"));
      } else {
        const { Alert } = require('react-native');
        Alert.alert(
          "Xóa nhóm",
          "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa nhóm này?",
          [
            { text: "Hủy", onPress: () => resolve(false), style: "cancel" },
            { text: "Xóa", onPress: () => resolve(true), style: "destructive" }
          ]
        );
      }
    });

    if (!confirm) return;

    try {
      await chatService.deleteChat(chatId as string);
      router.replace("/(tabs)/messages");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Lỗi khi xóa nhóm.");
    }
  };


  const handleTyping = (text: string) => {
    setInputText(text);
    sendTyping(chatId as string, text.length > 0);
  };


  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          {avatar ? (
            <Image source={{ uri: avatar as string }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{(name as string)?.[0]?.toUpperCase() || "U"}</Text>
            </View>
          )}
          <View style={styles.textInfo}>
            <Text style={styles.username}>{name}</Text>
            {isTyping && <Text style={styles.typingStatus}>typing...</Text>}
          </View>
        </View>

        {isGroup === "true" && chatCreator === user?.id && (
          <TouchableOpacity style={styles.headerAction} onPress={handleDeleteGroup}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.headerAction}
          onPress={() => router.push(`/chat/settings/${chatId}`)}
        >
          <Ionicons name="information-circle-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>


      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.messageArea}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              inverted
              renderItem={({ item }) => {
                const senderId = typeof item.sender === 'string' ? item.sender : item.sender._id;
                
                // Resolve name: Nickname > Real Name
                let displayName = typeof item.sender === 'object' ? item.sender.name : 'Unknown';
                if (nicknames[senderId]) {
                  displayName = nicknames[senderId];
                }

                return (
                  <MessageBubble 
                    message={{...item, sender: { ...(typeof item.sender === 'object' ? item.sender : {}), name: displayName } as any}} 
                    isFromMe={senderId === user?.id} 
                    showSenderName={isGroup === "true"} 
                  />
                );
              }}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              onEndReached={loadMoreMessages}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                isRefreshing ? (
                  <ActivityIndicator style={{ marginVertical: 10 }} color="#007AFF" />
                ) : null
              }
            />
          )}
        </View>


        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={28} color="#007AFF" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="iMessage"
            value={inputText}
            onChangeText={handleTyping}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || !isEncryptionReady || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || !isEncryptionReady || isSending}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB", // Soft light background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F5",
  },
  avatarPlaceholder: {
    backgroundColor: "#E1E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066FF",
  },
  textInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  typingStatus: {
    fontSize: 12,
    color: "#0066FF",
    fontWeight: "500",
    marginTop: 1,
  },
  headerAction: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messageArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 20,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F5",
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, // Extra padding for iOS home indicator
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F5",
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F3F7",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 10,
    fontSize: 15,
    maxHeight: 120,
    color: "#1A1A1A",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D1D6",
    shadowOpacity: 0,
    elevation: 0,
  },
});



