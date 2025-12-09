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
function IdProfilePopup({
  user,
  onClose,
}: {
  user: { uid: string; name: string; avatar?: string; vbId?: string };
  onClose: () => void;
}) {
  const router = useRouter();
  const photo = user.avatar || "/user.png";

  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupBg}>
        <View style={styles.popupCard}>
          <Image
            source={{ uri: photo }}
            style={styles.popupAvatar}
          />

          {user.vbId && (
            <Text style={styles.popupId}>ID: {user.vbId}</Text>
          )}

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

  const [me, setMe] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ID Arama
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchUser, setSearchUser] = useState<any | null>(null);

  /* ------------------------------------------------------
     Kullanıcıyı çek
  ------------------------------------------------------ */
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

  /* ------------------------------------------------------
     DM LİSTESİ
  ------------------------------------------------------ */
  useEffect(() => {
    if (!me) return;

    async function load() {
      const msgRef = collectionGroup(db, "messages");
      const qRef = query(msgRef, orderBy("time", "desc"));

      const snap = await getDocs(qRef);

      const conversations: any = {};

      snap.forEach((d) => {
        const data = d.data();
        const convId = d.ref.parent.parent?.id;
        if (!convId) return;

        const [a, b] = convId.split("_");
        const other = a === me.uid ? b : b === me.uid ? a : null;
        if (!other) return;

        if (!conversations[convId]) {
          conversations[convId] = {
            convId,
            otherId: other,
            lastMsg: data.text || "[Fotoğraf]",
            time: data.time,
          };
        }
      });

      const finalArr: any[] = [];

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

  /* ------------------------------------------------------
     ID ARAMA
  ------------------------------------------------------ */
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
    } catch (err) {
      setSearchError("Bir hata oluştu");
    } finally {
      setSearchLoading(false);
    }
  };

  /* ------------------------------------------------------
     LOADING
  ------------------------------------------------------ */
  if (loading || !me) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Yükleniyor...</Text>
      </View>
    );
  }

  /* ------------------------------------------------------
     UI
  ------------------------------------------------------ */
  return (
    <View style={{ flex: 1, backgroundColor: "black", paddingHorizontal: 14 }}>
      {/* BAŞLIK + ID ARAMA */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlarım</Text>

        <View style={styles.searchBox}>
          {searchOpen && (
            <View style={styles.searchInputWrap}>
              <TextInput
                value={searchId}
                onChangeText={setSearchId}
                placeholder="ID (VB-1)"
                placeholderTextColor="#aaa"
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

      {/* DM LİSTESİ */}
      <ScrollView style={{ marginTop: 10 }}>
        {list.map((m, i) => (
          <TouchableOpacity
            key={i}
            style={styles.msgItem}
            onPress={() => router.push(`/messages/${m.otherId}`)}
          >
            {/* AVATAR */}
            <View>
              <Image
                source={{ uri: m.otherAvatar }}
                style={styles.avatar}
              />
              {m.otherOnline && <View style={styles.onlineDot} />}
            </View>

            {/* İSİM + LAST MSG */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.otherName}</Text>
              <Text style={styles.lastMsg}>{m.lastMsg}</Text>
            </View>

            {/* UNREAD */}
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

      {/* ID SEARCH POPUP */}
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
                     STYLESHEET
====================================================== */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#000",
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
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  searchBox: { flexDirection: "row", alignItems: "center" },
  searchInputWrap: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    height: 36,
    marginRight: 6,
  },
  searchInput: {
    color: "#fff",
    width: 80,
    marginRight: 6,
  },
  searchBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchBtnText: { color: "white", fontSize: 12 },

  searchToggle: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },

  searchError: {
    color: "#f44",
    marginTop: 6,
    marginLeft: 4,
  },

  msgItem: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
    borderColor: "#111",
  },

  name: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  lastMsg: {
    color: "rgba(255,255,255,0.6)",
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
    color: "rgba(255,255,255,0.4)",
  },

  empty: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 40,
  },

  popupBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupCard: {
    backgroundColor: "#111",
    width: 280,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  popupAvatar: {
    width: 90,
    height: 90,
    borderRadius: 999,
    marginBottom: 10,
  },
  popupId: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  popupName: { color: "#fff", fontSize: 20, marginBottom: 14 },

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
