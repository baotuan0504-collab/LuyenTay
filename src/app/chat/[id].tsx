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
  const { id: chatId, name, avatar, participantId } = useLocalSearchParams();
  const { user, accessToken, signOut } = useAuth();
  const { joinChat, leaveChat, sendMessage, sendTyping, isConnected, typingUsers, socket } = useChat();
  const { decryptFromUser, isReady: isEncryptionReady } = useEncryption();
  const router = useRouter();


  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [participantPublicKey, setParticipantPublicKey] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);


  const isTyping = typingUsers.get(chatId as string) === participantId;





  useEffect(() => {
    const initChat = async () => {
      if (accessToken && chatId) {
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
  }, [chatId, accessToken]);


  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;


    const handleNewMessage = (message: any) => {
      const messageChatId = typeof message.chat === "string"
        ? message.chat
        : message.chat?._id ?? String(message.chat);

      if (messageChatId === chatId) {
        setMessages((prev) => {
          const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
          
          // 1. Decrypt the incoming message first (if it's encrypted)
          let decryptedText = message.text;
          if (message.text.startsWith('{"ciphertext"') && participantPublicKey) {
            const decrypted = decryptFromUser(message.text, participantPublicKey);
            if (decrypted) {
              decryptedText = decrypted;
            }
          }

          // 2. Now check for duplicates using the DECRYPTED text
          const isDuplicate = prev.some(m => 
            m._id === message._id || 
            (m.sender === senderId && m.text === decryptedText && Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 15000)
          );
          
          if (isDuplicate) {
            // Update the temp message with real data from server
            return prev.map(m => {
              if (m._id.startsWith('temp-') && m.sender === senderId && m.text === decryptedText) {
                return { ...message, text: decryptedText };
              }
              return m;
            });
          }
          
          // 3. Not a duplicate, add as new message
          return [{ ...message, text: decryptedText }, ...prev];
        });
      }
    };


    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, chatId, participantPublicKey]);


  const loadParticipantInfo = async () => {
    try {
      // 1. If we have participantId, try fetching user directly
      if (participantId) {
        const data = await userService.getUserById(participantId as string);
        console.log('DEBUG: Participant user data from getUserById:', data);
        if (data && data.publicKey && data.publicKey.length > 0) {
          setParticipantPublicKey(data.publicKey);
          return data.publicKey;
        }
      }

      // 2. If no participantId or no publicKey, fetch chat details
      if (chatId) {
        const chat = await chatService.getChatById(chatId as string);
        console.log('DEBUG: Chat details from getChatById:', chat);
        if (chat && chat.participant && chat.participant.publicKey && chat.participant.publicKey.length > 0) {
          setParticipantPublicKey(chat.participant.publicKey);
          return chat.participant.publicKey;
        } else if (chat && chat.participant) {
          // Re-fetch user just in case
          const user = await userService.getUserById(chat.participant._id);
          console.log('DEBUG: Participant user data from re-fetch:', user);
          if (user && user.publicKey && user.publicKey.length > 0) {
            setParticipantPublicKey(user.publicKey);
            return user.publicKey;
          }
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
      
      // Use override key or current state key
      const activeKey = keyOverride !== undefined ? keyOverride : participantPublicKey;
      
      let processedData = data;
      if (activeKey) {
        processedData = data.map((msg: any) => {
          if (msg.text.startsWith('{"ciphertext"')) {
            const decrypted = decryptFromUser(msg.text, activeKey);
            return decrypted ? { ...msg, text: decrypted } : msg;
          }
          return msg;
        });
      }
      
      setMessages(processedData);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-decrypt messages when participantPublicKey becomes available
  useEffect(() => {
    if (participantPublicKey && messages.length > 0) {
      // Only update if there are messages that NEED decryption
      const hasEncrypted = messages.some(msg => msg.text.startsWith('{"ciphertext"'));
      if (!hasEncrypted) return;

      setMessages(prev => prev.map(msg => {
        if (msg.text.startsWith('{"ciphertext"')) {
          const decrypted = decryptFromUser(msg.text, participantPublicKey);
          return decrypted ? { ...msg, text: decrypted } : msg;
        }
        return msg;
      }));
    }
  }, [participantPublicKey]); // Only run when key changes


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
        const decryptedData = data.map((msg: any) => {
          if (participantPublicKey) {
            const decrypted = decryptFromUser(msg.text, participantPublicKey);
            return decrypted ? { ...msg, text: decrypted } : msg;
          }
          return msg;
        });

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
      // Add message locally for instant feedback
      const tempId = `temp-${Date.now()}`;
      const tempMessage: MessageData = {
          _id: tempId,
          text: textToSend,
          sender: user?.id || "",
          createdAt: new Date().toISOString()
      };
      setMessages(prev => [tempMessage, ...prev]);

      sendMessage(chatId as string, textToSend, participantPublicKey || undefined);
      setInputText("");
      sendTyping(chatId as string, false);
    } finally {
      // Small delay to prevent double-tap
      setTimeout(() => setIsSending(false), 500);
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

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="information-circle-outline" size={24} color="#000" />
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
                return <MessageBubble message={item} isFromMe={senderId === user?.id} />
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
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  textInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  typingStatus: {
    fontSize: 12,
    color: "#007AFF",
    fontStyle: "italic",
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
    padding: 16,
    paddingBottom: 20,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  attachButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E5EA",
  },
});



