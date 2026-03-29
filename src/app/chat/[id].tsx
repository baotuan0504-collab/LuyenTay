import { MessageBubble, type MessageData } from "@/components/MessageBubble";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import * as messageService from "@/services/message.service";
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
  const { user, accessToken } = useAuth();
  const { joinChat, leaveChat, sendMessage, sendTyping, isConnected, typingUsers, socket } = useChat();
  const router = useRouter();


  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);


  const isTyping = typingUsers.get(chatId as string) === participantId;


  useEffect(() => {
    if (accessToken && chatId) {
      loadMessages();
      joinChat(chatId as string);
    }


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
      if (message.chat === chatId) {
        setMessages((prev) => {
            // Check if message already exists (to avoid duplicates if we also fetch)
            if (prev.find(m => m._id === message._id)) return prev;
            return [...prev, message];
        });
      }
    };


    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, chatId]);


  const loadMessages = async () => {
    try {
      const data = await messageService.getMessages(chatId as string, accessToken!);
      setMessages(data as any);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(chatId as string, inputText.trim());
    setInputText("");
    sendTyping(chatId as string, false);
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
              <Text style={styles.avatarText}>{ (name as string)?.[0]?.toUpperCase() || "U"}</Text>
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
              renderItem={({ item }) => {
                  const senderId = typeof item.sender === 'string' ? item.sender : item.sender._id;
                  return <MessageBubble message={item} isFromMe={senderId === user?.id} />
              }}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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



