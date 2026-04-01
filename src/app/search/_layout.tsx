"use client"


import { Ionicons } from "@expo/vector-icons"
import { Slot, useRouter } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"


export default function SearchLayout() {
  const router = useRouter()


  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={22}
            color="#000"
          />
        </TouchableOpacity>


        <Text style={styles.title}>Search</Text>


        <View style={styles.rightPlaceholder} />
      </View>


      <Slot />
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  rightPlaceholder: { width: 40 },
  title: { fontSize: 18, fontWeight: "600" },
})
