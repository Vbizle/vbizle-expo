import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles";

type Props = {
  preview: any;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (d: Date | null) => void;
  setEndDate: (d: Date | null) => void;
  setShowStartPicker: (v: boolean) => void;
  setFilteredLogs: (v: any[]) => void;
  setTotalAmount: (v: number) => void;
};

export default function DealerPreviewCard({
  preview,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setShowStartPicker,
  setFilteredLogs,
  setTotalAmount,
}: Props) {
  if (!preview || preview.notFound) return null;

  return (
    <View style={styles.previewCard}>
      <Image source={{ uri: preview.avatar }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.username}>{preview.username}</Text>
        <Text style={styles.role}>{preview.role}</Text>
      </View>

      {/* 📅 TARİH ALANI */}
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
            setShowStartPicker(true);
          }}
        >
          <Text style={styles.dateText}>
            {!startDate && !endDate
              ? "Tarih Aralığı Seç"
              : startDate && !endDate
              ? `Başlangıç: ${startDate.toLocaleDateString("tr-TR")} (Bitiş seç)`
              : `${startDate.toLocaleDateString("tr-TR")} - ${endDate!.toLocaleDateString(
                  "tr-TR"
                )}`}
          </Text>
        </TouchableOpacity>

        {(startDate || endDate) && (
          <TouchableOpacity
            style={{ marginTop: 6 }}
            onPress={() => {
              setStartDate(null);
              setEndDate(null);
              setFilteredLogs([]);
              setTotalAmount(0);
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#b91c1c",
                fontWeight: "600",
              }}
            >
              Temizle
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
