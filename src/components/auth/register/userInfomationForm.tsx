import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import { validateUserInfo } from "./registerValidation"

const GENDERS = ["male", "female", "other"]

export interface UserInfo {
  firstName: string
  lastName: string
  birthDate: string
  gender: string
}

interface UserInformationFormProps {
  values: UserInfo
  onChange: (v: UserInfo) => void
  onNext: () => void
}

export default function UserInformationForm({
  values,
  onChange,
  onNext,
}: UserInformationFormProps) {
  const { firstName, lastName, birthDate, gender } = values

  const [error, setError] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const [date, setDate] = useState(new Date())

  const handleNext = () => {
    const err = validateUserInfo(values)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onNext()
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleConfirm = () => {
    const formatted = date.toISOString().split("T")[0]
    onChange({ ...values, birthDate: formatted })
    setShow(false)
  }

  return (
    <>
      {/* Name */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
        <TextInput
          placeholder="First Name"
          placeholderTextColor="#999"
          value={firstName}
          onChangeText={v => onChange({ ...values, firstName: v })}
          style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
        />

        <TextInput
          placeholder="Last Name"
          placeholderTextColor="#999"
          value={lastName}
          onChangeText={v => onChange({ ...values, lastName: v })}
          style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
        />
      </View>

      {/* Birth Date */}
      <TouchableOpacity onPress={() => setShow(true)}>
        <TextInput
          placeholder="Birth Date"
          placeholderTextColor="#999"
          value={birthDate}
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

      {/* Date Picker Modal */}
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
                <Text style={{ color: "#999", fontSize: 16 }}>Cancel</Text>
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
              style={{ backgroundColor: "#fff" }}
            />
          </View>
        </View>
      </Modal>

      {/* Gender */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {GENDERS.map(g => (
          <TouchableOpacity
            key={g}
            style={{
              flex: 1,
              backgroundColor: gender === g ? "#000" : "#f5f5f5",
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 4,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              alignItems: "center",
            }}
            onPress={() => onChange({ ...values, gender: g })}
          >
            <Text style={{ color: gender === g ? "#fff" : "#000" }}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <Text
          style={{
            color: "red",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      )}

      {/* Next Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
        onPress={handleNext}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Next
        </Text>
      </TouchableOpacity>
    </>
  )
}