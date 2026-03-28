import ColorPickerIosComponent from "@/components/color-picker.io";
import { Host } from "@expo/ui/swift-ui";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
export default function Profile() {

  const [isOpened, setIsOpened] = useState(false);
  const [color, setColor] = useState("#FF6347");
  return (
    <View style={styles.container}>


      <Text>Profile</Text>
      <Host>
          {Platform.OS === "ios" && <ColorPickerIosComponent />}
      </Host>
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
