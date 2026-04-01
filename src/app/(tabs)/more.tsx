import { StyleSheet, Text, View } from "react-native";
export default function More() {
  return (
    <View style={styles.container}>
      <Text>More</Text>
      <Text>More content coming soon...</Text>
      <View>
        <Text>zxcvbnm</Text>
        <Text></Text>
        <Text>zxcvbnm</Text>
        <Text></Text>
        <Text>zxcvbnm</Text>  
      </View>
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
