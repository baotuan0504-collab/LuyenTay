import { ColorPicker, Host, VStack } from "@expo/ui/swift-ui";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
export default function ColorPickerIosComponent() {

  const [color, setColor] = useState("#FF6347");
  return (
    <View style={styles.container}>
      <Host>
         <VStack>
              <ColorPicker  selection ={color} onSelectionChange ={setColor}/>
          </VStack>
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
