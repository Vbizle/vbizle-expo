import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
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

  // Cinsiyet
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [genderWarningShown, setGenderWarningShown] = useState(false);

  function selectGender(type: "male" | "female") {
    setGender(type);

    if (!genderWarningShown) {
      Alert.alert(
        "Bilgi",
        "Cinsiyet seçimi bazı kısımlarda değiştirilemeyebilir."
      );
      setGenderWarningShown(true);
    }
  }

  // Doğum tarihi
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  function calculateAge(date: Date) {
    const diff = Date.now() - date.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  // =======================
  // UYRUK DROPDOWN (YENİ)
  // =======================
  const NATIONALITIES = [
    { code: "TR", name: "Türkiye", flag: "🇹🇷" },
    { code: "US", name: "Amerika", flag: "🇺🇸" },
    { code: "DE", name: "Almanya", flag: "🇩🇪" },
    { code: "GB", name: "İngiltere", flag: "🇬🇧" },
    { code: "FR", name: "Fransa", flag: "🇫🇷" },
  ];

  const [nationality, setNationality] = useState<any>(null);
  const [showNationalityModal, setShowNationalityModal] = useState(false);

  // REGISTER
  async function handleRegister() {
    if (!gender) return setError("Lütfen cinsiyet seçiniz.");
    if (!birthday) return setError("Lütfen doğum tarihi seçiniz.");
    if (!nationality) return setError("Lütfen uyruk seçiniz.");

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

        gender,
        birthday: birthday.toISOString().split("T")[0],
        age,
        nationality,
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

          {/* CİNSİYET */}
          <Text style={{ color: "#fff", marginTop: 10 }}>Cinsiyet</Text>

          <View style={{ flexDirection: "row", marginTop: 6, gap: 10 }}>
            <TouchableOpacity
              onPress={() => selectGender("male")}
              style={[
                styles.genderBtn,
                gender === "male" && { backgroundColor: "#3b82f6" },
              ]}
            >
              <Text style={styles.genderText}>Erkek ♂</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectGender("female")}
              style={[
                styles.genderBtn,
                gender === "female" && { backgroundColor: "#ec4899" },
              ]}
            >
              <Text style={styles.genderText}>Kadın ♀</Text>
            </TouchableOpacity>
          </View>

          {/* DOĞUM TARİHİ */}
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

          {/* UYRUK */}
          <Text style={{ color: "#fff", marginTop: 16 }}>Uyruk</Text>

          <TouchableOpacity
            onPress={() => setShowNationalityModal(true)}
            style={styles.dropdownBtn}
          >
            <Text style={{ color: "#fff" }}>
              {nationality
                ? `${nationality.flag} ${nationality.name}`
                : "Ülke Seç"}
            </Text>
          </TouchableOpacity>

          {/* MODAL */}
          <Modal
            visible={showNationalityModal}
            transparent
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Uyruk Seç</Text>

                <ScrollView style={{ maxHeight: 300 }}>

                  {NATIONALITIES.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      onPress={() => {
                        setNationality(item);
                        setShowNationalityModal(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>
                        {item.flag} {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}

                </ScrollView>

                <TouchableOpacity
                  onPress={() => setShowNationalityModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={{ color: "#fff" }}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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

  dropdownBtn: {
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

  /* MODAL STYLES */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    marginBottom: 14,
  },

  modalItem: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 8,
    marginBottom: 8,
  },

  modalItemText: {
    color: "white",
    fontSize: 16,
  },

  modalCloseBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#444",
    borderRadius: 8,
    alignItems: "center",
  },
});
