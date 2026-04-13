import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

interface BirthDateInputProps {
  value: string
  onChange: (v: string) => void
}

export default function BirthDateInput({
  value,
  onChange,
}: BirthDateInputProps) {
  const [show, setShow] = useState(false)
  const [date, setDate] = useState(new Date())

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleConfirm = () => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const formatted = `${year}-${month}-${day}`

    onChange(formatted)
    setShow(false)
  }

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)}>
        <TextInput
          placeholder="Birth Date"
          placeholderTextColor="#999"
          value={value}
          editable={false}
          pointerEvents="none"
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
        />
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 20,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={{ color: "#999", fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                Select Birth Date
              </Text>

              <TouchableOpacity onPress={handleConfirm}>
                <Text style={{ color: "#000", fontWeight: "600" }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          </View>
        </View>
      </Modal>
    </>
  )
}