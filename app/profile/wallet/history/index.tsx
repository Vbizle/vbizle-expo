import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";

export default function LoadHistoryScreen() {
  const user = auth.currentUser;

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 25;

  useEffect(() => {
    if (!user) return;
    loadInitial();
  }, [user]);

  async function loadInitial() {
    setLoading(true);

    const q = query(
      collection(db, "loadHistory"),
      where("toUid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);
    const list = await parseDocs(snap);

    setHistory(list);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setLoading(false);
  }

  async function loadMore() {
    if (!lastDoc) return;

    setLoadingMore(true);

    const q = query(
      collection(db, "loadHistory"),
      where("toUid", "==", user.uid),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);
    const list = await parseDocs(snap);

    setHistory((prev) => [...prev, ...list]);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setLoadingMore(false);
  }

  // ===================================================
  // VERİ OKUMA — KUSURSUZ, ÇÖKMEZ
  // ===================================================
  async function parseDocs(snap: any) {
    const list: any[] = [];

    for (let d of snap.docs) {
      const data = d.data();

      // TAM FALLBACK — ASLA undefined olmaz
      let displayUser = {
        username: "Sistem",
        avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        tag: "Sistem",
      };

      // ---- 1) Yeni sistem → admin:{} ----
      if (data.admin && typeof data.admin === "object") {
        displayUser = {
          username: data.admin.username || "Admin",
          avatar:
            data.admin.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          tag: data.admin.role || "Admin",
        };
      }

      // ---- 2) Eski sistem → fromUid ----
      else if (data.fromUid) {
        try {
          const fs = await getDoc(doc(db, "users", data.fromUid));
          if (fs.exists()) {
            const u = fs.data();
            displayUser = {
              username: u.username || "Kullanıcı",
              avatar:
                u.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              tag: u.role || "Kullanıcı",
            };
          }
        } catch (e) {
          console.log("fromUid read error:", e);
        }
      }

      // ---- 3) Kaynak → Root / Bayi / Sistem / Satın Alma ----
      if (data.source) {
        switch (data.source) {
          case "buyer":
            displayUser.tag = "Satın Alma";
            break;
          case "dealer":
            displayUser.tag = "Bayi";
            break;
          case "root":
            displayUser.tag = "Root";
            break;
          case "system":
            displayUser.tag = "Sistem";
            break;
          default:
            break;
        }
      }

      // ---- SON KONTROL: ASLA undefined olmasın ----
      if (!displayUser.avatar) {
        displayUser.avatar =
          "https://cdn-icons-png.flaticon.com/512/149/149071.png";
      }
      if (!displayUser.username) {
        displayUser.username = "Sistem";
      }
      if (!displayUser.tag) {
        displayUser.tag = "Sistem";
      }

      list.push({
        id: d.id,
        amount: data.amount,
        createdAt: data.createdAt,
        user: displayUser,
      });
    }

    return list;
  }

  // UI
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yükleme Geçmişim</Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>Henüz yükleme geçmişin yok.</Text>
      ) : (
        <>
          {history.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Image
                  source={{ uri: item.user.avatar }}
                  style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{item.user.username}</Text>

                  <Text
  style={[
    styles.tag,
    item.user.tag === "Bayi" && { color: "#2563eb" },
    item.user.tag === "Root" && { color: "#df0c0cff" },
    item.user.tag === "Sistem" && { color: "#6B7280" },
    item.user.tag === "Satın Alma" && { color: "#16a34a" },
  ]}
>
  {item.user.tag}
</Text>

                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>

                <Text style={styles.amount}>+{item.amount} VB</Text>
              </View>
            </View>
          ))}

          {lastDoc && (
            <TouchableOpacity
              style={styles.loadMore}
              onPress={loadMore}
              disabled={loadingMore}
            >
              <Text style={styles.loadMoreText}>
                {loadingMore ? "Yükleniyor..." : "Daha Fazla Yükle"}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    fontSize: 16,
    color: "#444",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1C1C1E",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  tag: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#22c55e",
  },
  loadMore: {
    padding: 14,
    alignItems: "center",
    backgroundColor: "#ECECEC",
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },
});
