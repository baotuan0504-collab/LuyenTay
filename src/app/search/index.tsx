"use client";


import { useAuth } from "@/context/AuthContext";
import * as userService from "@/services/user.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";


export default function SearchPage() {
  const { accessToken } = useAuth();
  const router = useRouter();


  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [friendsOnly, setFriendsOnly] = useState(false);


  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length >= 0) {
        doSearch(query);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query, friendsOnly]);


  const doSearch = async (q: string) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const users = await userService.searchUsers(q, accessToken, friendsOnly);
      setResults(users || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };


  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/profile/${item._id}`)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={styles.avatarText}>
            {item.name?.[0]?.toUpperCase() || "U"}
          </Text>
        </View>
      )}
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Users</Text>
      </View>


      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search by name or username"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <View style={styles.switchRow}>
          <Text style={{ marginRight: 8 }}>Friends</Text>
          <Switch value={friendsOnly} onValueChange={setFriendsOnly} />
        </View>
      </View>


      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  searchRow: { padding: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  placeholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#666" },
  name: { fontWeight: "600" },
  username: { color: "#777" },
});



