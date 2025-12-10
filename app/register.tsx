import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // =======================================
  // REGISTER
  // =======================================
  async function handleRegister() {
    setError("");
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        username,
        email,
        avatar: "",
        createdAt: Date.now(),
      });

      router.push("/profile");
    } catch (e: any) {
      setError(e.message);
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>Kayıt Ol</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>

          <TextInput
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#bbb"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

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
            onPress={handleRegister}
            style={[styles.registerBtn, loading && { opacity: 0.5 }]}
          >
            <Text style={styles.registerBtnText}>
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.loginText}>
          Zaten hesabın var mı?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => router.push("/login")}
          >
            Giriş Yap
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
    justifyContent: "center",
    alignItems: "center",
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

  registerBtn: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  registerBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  loginText: {
    textAlign: "center",
    marginTop: 16,
    color: "rgba(255,255,255,0.7)",
  },

  loginLink: {
    color: "#60a5fa",
    textDecorationLine: "underline",
  },
});
