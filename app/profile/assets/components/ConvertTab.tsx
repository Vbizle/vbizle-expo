import React, { useMemo, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "@/firebase/firebaseConfig";

type Props = {
  diamonds: number;
  styles: any;
};

const PRESETS = [2500, 5000, 10000, 25000, 50000];
const RATE = 2; // 2 Elmas = 1 VB

export default function ConvertTab({ diamonds, styles }: Props) {
  const [amount, setAmount] = useState<number | null>(null);

  const vbValue = useMemo(() => {
    if (!amount || amount < 2500) return 0;
    return Math.floor(amount / RATE);
  }, [amount]);

  function selectPreset(val: number) {
    if (val > diamonds) return;
    setAmount(val);
  }

  function handleManualInput(text: string) {
    const n = Number(text.replace(/\D/g, ""));
    setAmount(n || null);
  }

  async function handleConvert() {
    if (!amount || amount < 2500) {
      Alert.alert("Vb", "Minimum dönüşüm 2500 elmas.");
      return;
    }

    if (amount > diamonds) {
      Alert.alert("Vb", "Yetersiz elmas bakiyesi.");
      return;
    }

    Alert.alert(
      "Vb",
      "Bu işlem geri alınamaz. Devam etmek istiyor musunuz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              const token = await auth.currentUser?.getIdToken();
              if (!token) {
                throw new Error("Oturum bulunamadı.");
              }

              const res = await fetch(
                "https://us-central1-vbizle-f018f.cloudfunctions.net/convertDiamondToVB",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ amount }),
                }
              );

              const json = await res.json();

              if (!res.ok || json.error) {
                throw new Error(json.error || "İşlem başarısız.");
              }

              Alert.alert("Vb", "Dönüşüm başarıyla tamamlandı.");
            } catch (err: any) {
              Alert.alert("Vb", err.message || "Sunucu hatası.");
            }
          },
        },
      ]
    );
  }

  return (
    <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
      {/* BAKİYE */}
      <Text style={styles.title}>Elmas: {diamonds}</Text>
      <Text style={{ marginTop: 2, color: "#666", fontSize: 13 }}>
        Dönüşüm oranı: 2 Elmas = 1 VB
      </Text>

      {/* PRESET GRID */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginTop: 14,
        }}
      >
        {PRESETS.map((v) => {
          const disabled = v > diamonds;
          const selected = amount === v;

          return (
            <TouchableOpacity
              key={v}
              disabled={disabled}
              onPress={() => selectPreset(v)}
              style={{
                width: "47%",
                paddingVertical: 12,
                marginBottom: 10,
                borderRadius: 12,
                backgroundColor: disabled ? "#E5E7EB" : "#F9FAFB",
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? "#2563EB" : "#E5E7EB",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: disabled ? "#9CA3AF" : "#000",
                }}
              >
                {v} Elmas
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: "600",
                  color: disabled ? "#9CA3AF" : "#2563EB",
                }}
              >
                {v / RATE} VB
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MANUEL GİRİŞ */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ marginBottom: 4, fontWeight: "600", fontSize: 13 }}>
          Bozdurulacak Elmas
        </Text>

        <TextInput
          keyboardType="numeric"
          placeholder="Minimum 2500"
          onChangeText={handleManualInput}
          value={amount ? String(amount) : ""}
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            fontSize: 14,
          }}
        />

        {amount ? (
          <Text style={{ marginTop: 6, fontWeight: "600", fontSize: 13 }}>
            Alacağınız VB: {vbValue}
          </Text>
        ) : null}
      </View>

      {/* BOZDUR BUTONU */}
      <TouchableOpacity
        onPress={handleConvert}
        disabled={!amount || amount < 2500 || amount > diamonds}
        style={{
          marginTop: 18,
          backgroundColor: "#2563EB",
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
          opacity:
            !amount || amount < 2500 || amount > diamonds ? 0.5 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
          VB BAKİYEYE ÇEVİR
        </Text>
      </TouchableOpacity>
    </View>
  );
}
