import { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import BirthDateInput from "./BirthDateInput"
import FirstNameInput from "./FirstNameInput"
import GenderPicker from "./GenderPicker"
import LastNameInput from "./LastNameInput"
import { validateUserInfo } from "./registerValidation"

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

  const handleNext = () => {
    const err = validateUserInfo(values)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onNext()
  }

  return (
    <>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <FirstNameInput
            value={firstName}
            onChange={v => onChange({ ...values, firstName: v })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <LastNameInput
            value={lastName}
            onChange={v => onChange({ ...values, lastName: v })}
          />
        </View>
      </View>
      <BirthDateInput
        value={birthDate}
        onChange={v => onChange({ ...values, birthDate: v })}
      />
      <GenderPicker
        value={gender}
        onChange={v => onChange({ ...values, gender: v })}
      />
      {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
      <TouchableOpacity
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
        onPress={handleNext}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Next
        </Text>
      </TouchableOpacity>
    </>
  )
}
