import { Button } from "@expo/ui/swift-ui";
import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
export default function Index() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* <Image
        source={require("../../assets/images/tabIcons/home.png")}
        style={{ width: 100, height: 100 }}
      /> */}

      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Link href="/about" style={{ marginTop: 20, fontSize: 18, color: "blue" }}>
        Go to About Us
      </Link>
      <Button onPress={()=> router.push("/about") }>
         <Text>Navigate</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
