import { login } from "@/services/auth.service";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        try {
            await login(email, password);
            router.push("/(tabs)");
        } catch (err) {
            const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Login failed. Please check your credentials.";
            setError(message);
        }
    };

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign In to Continue</Text>
                <View style={styles.form}>
                    <TextInput
                        placeholder="Email..."
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoComplete="email"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Password..."
                        placeholderTextColor="#999"
                        secureTextEntry
                        autoComplete="password"
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/(auth)/signup")}>
                        <Text style={styles.linkButtonText}>
                            Don't have an account? <Text style={styles.linkButtonTextBold}>Sign Up</Text>
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
        padding:24,
    },
    title:{
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle:{
        fontSize: 16,
        marginBottom: 32,
        color: "#666",
    },
    form:{
        width: "100%",
    },
    input:{
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    button:{
        backgroundColor: "#000",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    buttonText:{
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    linkButton:{
        alignItems: "center",
        marginTop: 16,
    },
    linkButtonText:{
        color: "#666",
        fontSize: 14,
    },
    linkButtonTextBold:{
        fontWeight: "bold",
        color: "#000",

    },
    errorText:{
        color: "red",
        marginBottom: 16,
        textAlign: "center",
    },
})