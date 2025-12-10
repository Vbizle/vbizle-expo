import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [gender, setGender] = useState<"male" | "female" | "">("");

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ===========================================================
  // REGISTER
  // ===========================================================
  async function handleRegister() {
    setError("");

    if (!gender) {
      setError("Lütfen cinsiyet seçin");
      return;
    }

    if (!birthDate) {
      setError("Lütfen doğum tarihi seçin");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const birthISO = birthDate.toISOString().split("T")[0];

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        username,
        email,
        avatar: "",
        gender,
        birthDate: birthISO,
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
          {/* =========================== */}
          {/* Kullanıcı Adı */}
          {/* =========================== */}
          <TextInput
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#bbb"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          {/* =========================== */}
          {/* Email */}
          {/* =========================== */}
          <TextInput
            placeholder="E-posta"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {/* =========================== */}
          {/* Şifre */}
          {/* =========================== */}
          <TextInput
            placeholder="Şifre"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {/* =========================== */}
          {/* CİNSİYET RADIO BUTTON */}
          {/* =========================== */}
          <Text style={styles.label}>Cinsiyet</Text>

          <View style={styles.genderRow}>
            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => setGender("female")}
            >
              <View
                style={[
                  styles.radioCircle,
                  gender === "female" && styles.radioSelected,
                ]}
              />
              <Text style={styles.genderText}>Kadın</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => setGender("male")}
            >
              <View
                style={[
                  styles.radioCircle,
                  gender === "male" && styles.radioSelected,
                ]}
              />
              <Text style={styles.genderText}>Erkek</Text>
            </TouchableOpacity>
          </View>

          {/* =========================== */}
          {/* DOĞUM TARİHİ - DATE PICKER */}
          {/* =========================== */}
          <Text style={styles.label}>Doğum Tarihi</Text>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDate(true)}
          >
            <Text style={{ color: birthDate ? "white" : "#bbb" }}>
              {birthDate
                ? birthDate.toLocaleDateString()
                : "Doğum tarihi seçin"}
            </Text>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={birthDate || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (event.type === "dismissed") {
                  setShowDate(false);
                  return;
                }
                setShowDate(false);
                if (selectedDate) setBirthDate(selectedDate);
              }}
            />
          )}

          {/* =========================== */}
          {/* Kayıt Butonu */}
          {/* =========================== */}
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

        {/* =========================== */}
        {/* Login Link */}
        {/* =========================== */}
        <Text style={styles.loginText}>
          Zaten hesabın var mı?{" "}
          <Text style={styles.loginLink} onPress={() => router.push("/login")}>
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

  label: {
    color: "white",
    marginTop: 4,
    marginBottom: 2,
    fontSize: 14,
  },

  genderRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 6,
  },

  genderOption: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 8,
  },

  radioSelected: {
    backgroundColor: "#60a5fa",
    borderColor: "#60a5fa",
  },

  genderText: {
    color: "white",
    fontSize: 15,
  },

  dateInput: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
