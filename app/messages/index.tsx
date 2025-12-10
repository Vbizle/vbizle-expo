/* Tüm importlar aynı */
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebaseConfig";

/* ======================================================
   PROFIL POPUP — Expo Versiyonu
====================================================== */
function IdProfilePopup({ user, onClose }) {
  const router = useRouter();
  const photo = user.avatar || "/user.png";

  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupBg}>
        <View style={styles.popupCard}>
          <Image source={{ uri: photo }} style={styles.popupAvatar} />

          {user.vbId && <Text style={styles.popupId}>ID: {user.vbId}</Text>}
          <Text style={styles.popupName}>{user.name}</Text>

          <TouchableOpacity
            onPress={() => {
              router.push(`/messages/${user.uid}`);
              onClose();
            }}
            style={styles.popupBtn}
          >
            <Text style={styles.popupBtnText}>Mesaj Gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.popupCloseBtn}>
            <Text style={styles.popupCloseText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ======================================================
                       MESSAGES PAGE
====================================================== */
export default function MessagesPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchUser, setSearchUser] = useState(null);

  /* ======================================================
     KULLANICIYI ÇEK
  ====================================================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");

      const snap = await getDoc(doc(db, "users", u.uid));

      setMe({
        uid: u.uid,
        name: snap.data()?.username,
        avatar: snap.data()?.avatar,
      });
    });

    return () => unsub();
  }, []);

  /* ======================================================
     DM LİSTESİ YÜKLEME
  ====================================================== */
  useEffect(() => {
    if (!me) return;

    async function load() {
      const msgRef = collectionGroup(db, "messages");
      const qRef = query(msgRef, orderBy("time", "desc"));

      const snap = await getDocs(qRef);
      const conversations = {};

      snap.forEach((d) => {
        const data = d.data();
        const convId = d.ref.parent.parent?.id;
        if (!convId) return;

        const [a, b] = convId.split("_");
        const other = a === me.uid ? b : b === me.uid ? a : null;
        if (!other) return;

        // ⭐ Mesaj tipini ayır
        let preview = "";
        if (data.text) preview = data.text;
        else if (data.imgUrl) preview = "[Fotoğraf]";
        else if (data.voiceUrl) preview = "[Ses Kaydı]";
        else preview = "";

        if (!conversations[convId]) {
          conversations[convId] = {
            convId,
            otherId: other,
            lastMsg: preview,
            time: data.time,
          };
        }
      });

      const finalArr = [];

      for (let convId in conversations) {
        const item = conversations[convId];

        const userSnap = await getDoc(doc(db, "users", item.otherId));
        const uData = userSnap.data();

        const metaSnap = await getDoc(doc(db, "dm", convId, "meta", "info"));
        const unread =
          metaSnap.exists() && metaSnap.data().unread?.[me.uid]
            ? metaSnap.data().unread[me.uid]
            : 0;

        finalArr.push({
          ...item,
          otherName: uData.username,
          otherAvatar: uData.avatar,
          otherOnline: uData.online ?? false,
          unread,
        });
      }

      setList(finalArr);
      setLoading(false);
    }

    load();
    const unsub = onSnapshot(collectionGroup(db, "meta"), () => load());
    return () => unsub();
  }, [me]);

  /* ======================================================
     ID ARAMA
  ====================================================== */
  const handleSearch = async () => {
    setSearchError("");
    setSearchUser(null);

    const raw = searchId.trim();
    if (!raw) return;

    const term = raw.toUpperCase();
    setSearchLoading(true);

    try {
      const qRef = query(collection(db, "users"), where("vbId", "==", term));
      const snap = await getDocs(qRef);

      if (snap.empty) {
        setSearchError("Kullanıcı bulunamadı");
        return;
      }

      const docSnap = snap.docs[0];
      const d = docSnap.data();

      setSearchUser({
        uid: docSnap.id,
        name: d.username,
        avatar: d.avatar,
        vbId: d.vbId,
      });
    } catch {
      setSearchError("Bir hata oluştu");
    } finally {
      setSearchLoading(false);
    }
  };

  /* ======================================================
     LOADING
  ====================================================== */
  if (loading || !me) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#1C1C1E" }}>Yükleniyor...</Text>
      </View>
    );
  }

  /* ======================================================
     UI
  ====================================================== */
  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F5", paddingHorizontal: 14 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlarım</Text>

        <View style={styles.searchBox}>
          {searchOpen && (
            <View style={styles.searchInputWrap}>
              <TextInput
                value={searchId}
                onChangeText={setSearchId}
                placeholder="ID (VB-1)"
                placeholderTextColor="#9A9A9E"
                style={styles.searchInput}
              />

              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleSearch}
                disabled={searchLoading}
              >
                <Text style={styles.searchBtnText}>Ara</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.searchToggle}
            onPress={() => setSearchOpen((v) => !v)}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {searchError ? (
        <Text style={styles.searchError}>{searchError}</Text>
      ) : null}

      {/* DM LIST */}
      <ScrollView style={{ marginTop: 10 }}>
        {list.map((m, i) => (
          <TouchableOpacity
            key={i}
            style={styles.msgItem}
            onPress={() => router.push(`/messages/${m.otherId}`)}
          >
            <View>
              <Image source={{ uri: m.otherAvatar }} style={styles.avatar} />
              {m.otherOnline && <View style={styles.onlineDot} />}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.otherName}</Text>

              {/* ⭐ Önizleme — Tek satır + "..." */}
              <Text
                style={styles.lastMsg}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {m.lastMsg}
              </Text>
            </View>

            {m.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{m.unread}</Text>
              </View>
            )}

            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        {list.length === 0 && (
          <Text style={styles.empty}>Henüz mesaj yok</Text>
        )}
      </ScrollView>

      {searchUser && (
        <IdProfilePopup
          user={searchUser}
          onClose={() => setSearchUser(null)}
        />
      )}
    </View>
  );
}

/* ======================================================
                     STYLES — MAT BEYAZ
====================================================== */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#F2F2F5",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#1C1C1E",
    fontSize: 22,
    fontWeight: "700",
  },

  searchBox: { flexDirection: "row", alignItems: "center" },
  searchInputWrap: {
    flexDirection: "row",
    backgroundColor: "#FAFAFC",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    height: 36,
    marginRight: 6,
  },
  searchInput: {
    color: "#1C1C1E",
    width: 80,
    marginRight: 6,
  },
  searchBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchBtnText: { color: "#fff", fontSize: 12 },

  searchToggle: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  searchError: {
    color: "#dc2626",
    marginTop: 6,
    marginLeft: 4,
  },

  msgItem: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  avatar: { width: 54, height: 54, borderRadius: 999 },
  onlineDot: {
    width: 12,
    height: 12,
    backgroundColor: "#22c55e",
    borderRadius: 20,
    position: "absolute",
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  name: {
    fontSize: 18,
    color: "#1C1C1E",
    fontWeight: "600",
  },

  lastMsg: {
    color: "#6E6E73",
    marginTop: 2,
  },

  unreadBadge: {
    position: "absolute",
    top: 6,
    right: 34,
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  arrow: {
    marginLeft: 6,
    color: "#6E6E73",
  },

  empty: {
    color: "#7A7A7E",
    textAlign: "center",
    marginTop: 40,
  },

  popupBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupCard: {
    backgroundColor: "#FFFFFF",
    width: 280,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  popupAvatar: {
    width: 90,
    height: 90,
    borderRadius: 999,
    marginBottom: 10,
  },
  popupId: {
    color: "#1C1C1E",
    fontSize: 14,
    marginBottom: 4,
  },
  popupName: { color: "#1C1C1E", fontSize: 20, marginBottom: 14 },

  popupBtn: {
    backgroundColor: "#2563eb",
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  popupBtnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  popupCloseBtn: {
    backgroundColor: "#dc2626",
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
  },
  popupCloseText: { color: "#fff", textAlign: "center" },
});
