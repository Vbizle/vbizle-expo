import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/profile");
    } catch (e: any) {
      setError(e.message);
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Giriş Yap</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
          <TextInput
            placeholder="E-posta"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Şifre"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            disabled={loading}
            onPress={handleLogin}
            style={[styles.loginBtn, loading && { opacity: 0.5 }]}
          >
            <Text style={styles.loginBtnText}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.registerText}>
          Hesabın yok mu?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            Kayıt Ol
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },

  error: {
    color: "#f87171",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },

  form: {
    gap: 12,
  },

  input: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    color: "white",
    fontSize: 16,
  },

  loginBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  loginBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  registerText: {
    textAlign: "center",
    marginTop: 16,
    color: "rgba(255,255,255,0.7)",
  },

  registerLink: {
    color: "#60a5fa",
    textDecorationLine: "underline",
  },
});
