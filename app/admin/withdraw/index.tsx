import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import WithdrawCard from "./WithdrawCard";

type StatusType = "pending" | "approved" | "rejected";

export default function AdminWithdrawScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<StatusType>("pending");

  useEffect(() => {
    const q = query(
      collection(db, "withdrawRequests"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setItems(arr);
    });

    return () => unsub();
  }, [status]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Çekim Talepleri</Text>

      {/* SEKME BUTONLARI */}
      <View style={styles.tabs}>
        <Tab
          label="Bekleyenler"
          active={status === "pending"}
          onPress={() => setStatus("pending")}
        />
        <Tab
          label="Onaylananlar"
          active={status === "approved"}
          onPress={() => setStatus("approved")}
        />
        <Tab
          label="Reddedilenler"
          active={status === "rejected"}
          onPress={() => setStatus("rejected")}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Kayıt bulunamadı</Text>
        }
        renderItem={({ item }) => {
          return (
            <WithdrawCard
              item={item}
              showActions={status === "pending"}
              onApproved={() =>
                setItems((prev) => prev.filter((i) => i.id !== item.id))
              }
              onRejected={() =>
                setItems((prev) => prev.filter((i) => i.id !== item.id))
              }
            />
          );
        }}
      />
    </View>
  );
}

/* 🔹 SEKME KOMPONENTİ */
function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={active ? styles.tabTextActive : styles.tabText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#BFDBFE",
  },
  tabText: {
    color: "#374151",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
});
