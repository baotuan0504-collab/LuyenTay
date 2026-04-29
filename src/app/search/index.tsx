"use client"

import { useAuth } from "@/context/AuthContext"
import * as chatService from "@/services/chat.service"
import * as userService from "@/services/user.service"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useCallback, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function SearchPage() {
  const { accessToken } = useAuth()
  const router = useRouter()

  // text đang gõ
  const [query, setQuery] = useState("")

  // text đã search
  const [searchQuery, setSearchQuery] = useState("")

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const doSearch = async (q: string) => {
    if (!accessToken) return

    setLoading(true)

    try {
      console.log("🔍 Searching:", q)

      const users = await userService.searchUsers(q)

      console.log("doSearch received:", users)

      setResults(users || [])
    } catch (error: any) {
      if (error?.handled) {
        console.log("Request handled:", error.message)
      } else {
        console.error("Search failed", error)
      }
    } finally {
      setLoading(false)
    }
  }

  // chỉ search khi click icon
  const handleSearch = async () => {
    if (loading) return
    if (!query.trim()) return

    setSearchQuery(query)
    await doSearch(query)
  }

  const renderItem = useCallback(
    ({ item }: any) => (
      <SearchItem
        item={item}
        router={router}
        accessToken={accessToken}
      />
    ),
    [router, accessToken],
  )

  const keyExtractor = useCallback((item: any) => item._id, [])

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Search..."
            value={query}
            onChangeText={setQuery}
          />

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}>
            <Ionicons
              name="search"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* DEBUG */}
      <View style={{ padding: 12 }}>
        <Text>Results: {results.length}</Text>
      </View>

      {/* RESULTS */}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        />
      )}
    </View>
  )
}

/* ============================ */
/* Search Item */
/* ============================ */

const SearchItem = React.memo(({ item, router, accessToken }: any) => {
  console.log("render:", item)

  return (
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
            <Text>{item.name?.[0] || "U"}</Text>
          </View>
        )}

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.msgBtn}
        onPress={async () => {
          if (!accessToken) return

          const chat = await chatService.getOrCreateChat(item._id)

          router.push({
            pathname: "/chat/[id]",
            params: {
              id: chat._id,
              name: item.name,
              avatar: item.avatar || "",
              participantId: item._id,
            },
          })
        }}>
        <Text style={styles.msgBtnText}>Message</Text>
      </TouchableOpacity>
    </View>
  )
})

/* ============================ */
/* Styles */
/* ============================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  searchRow: {
    padding: 12,
  },

  inputRow: {
    flexDirection: "row",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },

  searchBtn: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  placeholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontWeight: "600",
  },

  username: {
    color: "#777",
  },

  msgBtn: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
  },

  msgBtnText: {
    color: "#fff",
  },
})
