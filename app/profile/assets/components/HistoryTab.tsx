import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
} from "react-native";

type Props = {
  styles: any; // dışarıdan gelen ortak stiller
};

type DonationItem = {
  id: string;
  amount: number;
  createdAt: any;
  fromUser?: {
    username?: string;
    avatar?: string | null;
    role?: string;
  };
};

function formatDate(ts: any) {
  if (!ts) return "";
  const d =
    typeof ts === "number"
      ? new Date(ts)
      : ts?.toDate
      ? ts.toDate()
      : new Date(ts);

  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryTab({ styles }: Props) {
  const user = auth.currentUser;
  const [data, setData] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "donationHistory"),
      where("toUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: DonationItem[] = [];
      snap.forEach((doc) =>
        arr.push({ id: doc.id, ...(doc.data() as any) })
      );
      setData(arr);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "#666" }}>Henüz bağış yok.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 14 }}
      renderItem={({ item }) => {
        const u = item.fromUser || {};
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            {/* AVATAR */}
            <Image
              source={{
                uri:
                  u.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                marginRight: 12,
              }}
            />

            {/* ORTA ALAN */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 15 }}>
                {u.username || "Kullanıcı"}
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                {formatDate(item.createdAt)}
              </Text>
            </View>

            {/* SAĞ ALAN */}
            <Text
              style={{
                fontWeight: "800",
                fontSize: 15,
                color: "#16A34A",
              }}
            >
              +{item.amount} VB
            </Text>
          </View>
        );
      }}
    />
  );
}
