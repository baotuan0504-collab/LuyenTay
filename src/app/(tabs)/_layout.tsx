import { Ionicons } from "@expo/vector-icons"
import { Tabs, useRouter } from "expo-router"
import { StyleSheet, TouchableOpacity, View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNotification } from "@/context/NotificationContext"

function AppHeader() {
  const router = useRouter()
  const { unreadCount } = useNotification()

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="menu-outline"
            size={24}
            color="#000"
          />
        </TouchableOpacity>

        {/* <Text style={styles.headerTitle}>My App</Text> */}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push("/search")}>
          <Ionicons
            name="search-outline"
            size={22}
            color="#000"
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => router.push("/notifications")}
        >
          <View>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#000"
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <View style={styles.tabs}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "black",
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#eaeaea",
              height: 65,
              paddingTop: 20,
              paddingBottom: 8,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="friends"
            options={{
              title: "Bạn bè",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "people" : "people-outline"}
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: "Chat",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "chatbubbles" : "chatbubbles-outline"}
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="more"
            options={{
              title: "More",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={
                    focused
                      ? "ellipsis-horizontal"
                      : "ellipsis-horizontal-outline"
                  }
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    width: "100%",
    height: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#fff",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  tabs: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
})
