import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // YENİ → Cinsiyet
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  // YENİ → Doğum Tarihi
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  function calculateAge(date: Date) {
    const diff = Date.now() - date.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  // =======================================
  // REGISTER
  // =======================================
  async function handleRegister() {
    if (!gender) return setError("Lütfen cinsiyet seçiniz.");
    if (!birthday) return setError("Lütfen doğum tarihi seçiniz.");

    setError("");
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      const age = calculateAge(birthday);

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        username,
        email,
        avatar: "",
        createdAt: Date.now(),

        // YENİ ALANLAR
        gender,
        birthday: birthday.toISOString().split("T")[0],
        age,
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

        <View className="form">
          {/* Kullanıcı adı */}
          <TextInput
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#bbb"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          {/* Email */}
          <TextInput
            placeholder="E-posta"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {/* Şifre */}
          <TextInput
            placeholder="Şifre"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {/* YENİ → CİNSİYET */}
          <Text style={{ color: "#fff", marginTop: 10 }}>Cinsiyet</Text>
          <View style={{ flexDirection: "row", marginTop: 6, gap: 10 }}>
            <TouchableOpacity
              onPress={() => setGender("male")}
              style={[
                styles.genderBtn,
                gender === "male" && styles.genderSelected,
              ]}
            >
              <Text style={styles.genderText}>Erkek ♂</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGender("female")}
              style={[
                styles.genderBtn,
                gender === "female" && styles.genderSelected,
              ]}
            >
              <Text style={styles.genderText}>Kadın ♀</Text>
            </TouchableOpacity>
          </View>

          {/* YENİ → DOĞUM TARİHİ */}
          <Text style={{ color: "#fff", marginTop: 16 }}>Doğum Tarihi</Text>

          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.dateBtn}
          >
            <Text style={{ color: "#fff" }}>
              {birthday
                ? birthday.toISOString().split("T")[0]
                : "Doğum tarihi seç"}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={birthday || new Date(2000, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, date) => {
                setShowPicker(false);
                if (date) setBirthday(date);
              }}
            />
          )}

          {/* KAYIT BUTONU */}
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

  input: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    color: "white",
    fontSize: 16,
  },

  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    alignItems: "center",
  },

  genderSelected: {
    backgroundColor: "#16a34a",
  },

  genderText: {
    color: "white",
    fontSize: 16,
  },

  dateBtn: {
    marginTop: 6,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
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
