import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Profile() {
  const { user } = useAuth();


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: user?.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || "No Name"}</Text>
          <Text style={styles.username}>@{user?.username || "username"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: "#999",
  },
});
