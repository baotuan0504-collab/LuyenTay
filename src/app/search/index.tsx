"use client"


import { useAuth } from "@/context/AuthContext"
import * as chatService from "@/services/chat.service"
import * as userService from "@/services/user.service"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
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
} from "react-native"


export default function SearchPage() {
  const { accessToken } = useAuth()
  const router = useRouter()


  const searchParams = useLocalSearchParams()
  const qRaw = searchParams.q
  const initialQuery = Array.isArray(qRaw) ? qRaw[0] : (qRaw ?? "")
  const [query, setQuery] = useState<string>(initialQuery)
  const [results, setResults] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const foRaw = searchParams.friendsOnly
  const initialFriendsOnly =
    (Array.isArray(foRaw) ? foRaw[0] : foRaw) === "true"
  const [friendsOnly, setFriendsOnly] = useState<boolean>(initialFriendsOnly)


  // keep state in sync with URL params but do NOT auto-search on typing
  useEffect(() => {
    const qRawNow = searchParams.q
    const paramQ = Array.isArray(qRawNow) ? qRawNow[0] : (qRawNow ?? "")
    if (paramQ !== query) setQuery(paramQ)


    const foRawNow = searchParams.friendsOnly
    const paramFo =
      (Array.isArray(foRawNow) ? foRawNow[0] : foRawNow) === "true"
    if (paramFo !== friendsOnly) setFriendsOnly(paramFo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.q, searchParams.friendsOnly])


  const doSearch = async (q: string) => {
    if (!accessToken) {
      console.warn("No accessToken available for search")
      return
    }
    setLoading(true)
    try {
      console.log("Searching users with query:", q, "friendsOnly:", friendsOnly)
      const users = await userService.searchUsers(q, accessToken, friendsOnly)
      console.log(
        "Search response count:",
        Array.isArray(users) ? users.length : users,
      )
      console.log("Search response items:", users)
      setResults(users || [])
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setLoading(false)
    }
  }


  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardLeft}
        onPress={() => router.push(`/profile/${item._id}`)}>
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={styles.cardAvatar}
          />
        ) : (
          <View style={[styles.cardAvatar, styles.placeholder]}>
            <Text style={styles.avatarText}>
              {item.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
        )}


        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </TouchableOpacity>


      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.msgBtn}
          onPress={async () => {
            if (!accessToken) return
            try {
              const chat = await chatService.getOrCreateChat(
                item._id,
                accessToken,
              )
              router.push({
                pathname: "/chat/[id]",
                params: {
                  id: chat._id,
                  name: item.name,
                  avatar: item.avatar || "",
                  participantId: item._id,
                },
              })
            } catch (err) {
              console.error("Error opening chat:", err)
            }
          }}>
          <Text style={styles.msgBtnText}>Message</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => router.push(`/profile/${item._id}`)}>
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  )


  const handleSearch = async () => {
    if (loading) return
    const q = encodeURIComponent(query || "")
    const fo = friendsOnly ? "&friendsOnly=true" : ""
    router.push(`/search?q=${q}${fo}`)
    await doSearch(query)
  }


  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Search by name or username"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
          />
          <TouchableOpacity
            style={[styles.searchBtn, loading ? { opacity: 0.6 } : {}]}
            onPress={() => handleSearch()}
            disabled={loading}>
            <Ionicons
              name="search"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>


        <View style={styles.switchRow}>
          <Text style={{ marginRight: 8 }}>Friends</Text>
          <Switch
            value={friendsOnly}
            onValueChange={setFriendsOnly}
          />
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
          keyExtractor={i => i._id}
          renderItem={renderItem}
        />
      )}
    </View>
  )
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
    flex: 1,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardAvatar: { width: 56, height: 56, borderRadius: 28 },
  cardActions: { flexDirection: "row", gap: 8, marginLeft: 12 },
  msgBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  msgBtnText: { color: "#fff", fontWeight: "600" },
  viewBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: { color: "#333", fontWeight: "600" },
})



