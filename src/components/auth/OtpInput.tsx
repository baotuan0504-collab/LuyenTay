import React, { useRef } from "react"
import { StyleSheet, TextInput, View } from "react-native"

interface OtpInputProps {
  value: string
  onChange: (v: string) => void
  length?: number
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
}: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([])

  const handleChange = (text: string, idx: number) => {
    let newValue = value.split("")
    if (text.length > 1) {
      // Paste case
      newValue = text.split("").slice(0, length)
      onChange(newValue.join(""))
      if (newValue.length === length) inputs.current[length - 1]?.blur()
      return
    }
    newValue[idx] = text
    const joined = newValue.join("").replace(/[^0-9]/g, "")
    onChange(joined)
    if (text && idx < length - 1) {
      inputs.current[idx + 1]?.focus()
    }
    if (!text && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={ref => {
            inputs.current[idx] = ref || null
          }}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={value[idx] || ""}
          onChangeText={text => handleChange(text, idx)}
          autoFocus={idx === 0}
          textAlign="center"
          returnKeyType="next"
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  input: {
    width: 44,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    fontSize: 24,
    textAlign: "center",
  },
})
