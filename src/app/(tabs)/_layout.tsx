import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu-outline" size={24} color="#000" />
        </TouchableOpacity>

        {/* <Text style={styles.headerTitle}>My App</Text> */}
      </View>

      <TouchableOpacity style={styles.headerIcon}>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
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
              height: 64,
              paddingBottom: 8,
            },
          }}
        >
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
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="about"
            options={{
              title: "About",
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={
                    focused
                      ? "information-circle"
                      : "information-circle-outline"
                  }
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
        </Tabs>
      </View>
    </SafeAreaView>
  );
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
});