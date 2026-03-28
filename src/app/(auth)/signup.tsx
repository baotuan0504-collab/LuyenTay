import { register } from "@/services/auth.service";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async () => {
        const fullName = `${firstName} ${lastName}`

        // gọi API backend ở đây
        try {
            await register(fullName, email, password);
            router.push("/(auth)/login");
        } catch (error) {
            console.error("Registration error:", error);
        }

    }

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign Up to Get Started</Text>

                <View style={styles.form}>

                    <View style={styles.row}>
                        <TextInput
                            placeholder="First Name..."
                            placeholderTextColor={"#999"}
                            value={firstName}
                            onChangeText={setFirstName}
                            style={[styles.input, styles.halfInput]}
                        />

                        <TextInput
                            placeholder="Last Name..."
                            placeholderTextColor={"#999"}
                            value={lastName}
                            onChangeText={setLastName}
                            style={[styles.input, styles.halfInput]}
                        />
                    </View>

                    <TextInput
                        placeholder="Email..."
                        placeholderTextColor={"#999"}
                        keyboardType="email-address"
                        autoComplete="email"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Password..."
                        placeholderTextColor={"#999"}
                        secureTextEntry
                        autoComplete="password"
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                    >
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push("/(auth)/login")}
                    >
                        <Text style={styles.linkButtonText}>
                            Already have an account?
                            <Text style={styles.linkButtonTextBold}> Sign In</Text>
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        color: "#666",
    },
    form: {
        width: "100%",
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    button: {
        backgroundColor: "#000",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    linkButton: {
        alignItems: "center",
        marginTop: 16,
    },
    linkButtonText: {
        color: "#666",
        fontSize: 14,
    },
    linkButtonTextBold: {
        fontWeight: "bold",
        color: "#000",
    },
    halfInput: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        gap: 10,
    }
})