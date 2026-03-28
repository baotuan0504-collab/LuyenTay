import { StyleSheet, Text, View } from "react-native";
export default function About() {
  return (
    <View style={styles.container}>
      {/* <Image
        source={require("../../assets/images/tabIcons/home.png")}
        style={{ width: 100, height: 100 }}
      /> */}

      <Text>About Us</Text>
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
