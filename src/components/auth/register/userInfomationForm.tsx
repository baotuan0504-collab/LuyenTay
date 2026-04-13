import { Text, TextInput, TouchableOpacity, View } from "react-native"

const GENDERS = ["male", "female", "other"]

export default function UserInformationForm({ values, onChange, onNext }) {
  const { firstName, lastName, birthDate, gender } = values
  return (
    <>
      <TextInput
        placeholder="First Name"
        placeholderTextColor="#999"
        value={firstName}
        onChangeText={v => onChange({ ...values, firstName: v })}
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
      <TextInput
        placeholder="Last Name"
        placeholderTextColor="#999"
        value={lastName}
        onChangeText={v => onChange({ ...values, lastName: v })}
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
      <TextInput
        placeholder="Birth Date (YYYY-MM-DD)"
        placeholderTextColor="#999"
        value={birthDate}
        onChangeText={v => onChange({ ...values, birthDate: v })}
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
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {GENDERS.map(g => (
          <TouchableOpacity
            key={g}
            style={{
              backgroundColor: gender === g ? "#000" : "#f5f5f5",
              borderRadius: 12,
              padding: 12,
              marginRight: 8,
            }}
            onPress={() => onChange({ ...values, gender: g })}>
            <Text style={{ color: gender === g ? "#fff" : "#000" }}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
        onPress={onNext}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Next
        </Text>
      </TouchableOpacity>
    </>
  )
}
