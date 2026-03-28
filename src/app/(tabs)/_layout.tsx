import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs 
       screenOptions={{tabBarActiveTintColor: "orange"}}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name= {focused ? "home" : "home-outline"}
             color={color}
             size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name= {focused ? "person" : "person-outline"}
             color={color}
             size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name= {focused ? "information-circle" : "information-circle-outline"}
             color={color}
             size={size} />
          ),
        }}
      />
    </Tabs>
  );
}