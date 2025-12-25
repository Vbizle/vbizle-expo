// app/profile/index.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { auth, db, storage } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { useRoomState } from "@/src/(providers)/RoomProvider";
import { useRouter } from "expo-router";

import CoverEditModal from "./CoverEditModal";
import FullscreenGallery from "./FullscreenGallery";
import ProfileHeader from "./ProfileHeader";
import ProfileTopBar from "./ProfileTopBar";

import ProfileWalletButtons from "./components/ProfileWalletButtons";

import { getLevelInfo } from "@/src/utils/levelSystem";

// Admin kontrolü
import { isAdmin } from "@/app/admin/core/isAdmin";
import MarketEntry from "@/app/market/MarketEntry";
import MarketModal from "@/app/market/MarketModal";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackpackEntry from "./backpack/BackpackEntry";
import BackpackModal from "./backpack/BackpackModal";
import ProfileFollowSection from "./social/ProfileFollowSection";
import TopSupportersButton from "./top-supporters/components/TopSupportersButton";


export default function ProfileScreen() {
    const insets = useSafeAreaInsets(); // 👈 EKLENECEK
  const router = useRouter();
  const user = auth.currentUser;
  const { clearRoom } = useRoomState();

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [vbId, setVbId] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [nationality, setNationality] = useState(null);

  const [vipScore, setVipScore] = useState(0);
  const [vbTotalSent, setVbTotalSent] = useState(0);

  const [usernameEdit, setUsernameEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [notice, setNotice] = useState("");

  const [coverEditOpen, setCoverEditOpen] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  // ⭐ EKLENDİ — BAYİ FLAG
  const [isDealerFlag, setIsDealerFlag] = useState(false);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);



  // ==========================================================
  // PROFİL YÜKLE
  // ==========================================================
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    async function load() {
      const refDoc = doc(db, "users", user.uid);
      const snap = await getDoc(refDoc);

      if (snap.exists()) {
        const d: any = snap.data();

        setUsername(d.username || "");
        setAvatar(d.avatar || "");
        setVbId(d.vbId || "");
        setGallery(d.galleryPhotos || []);
        setGender(d.gender || "");
        setAge(d.age || "");
        setNationality(d.nationality || null);

        setVipScore(d.vipScore ?? 0);
        setVbTotalSent(d.vbTotalSent ?? 0);

        // ⭐ BAYİ kontrolü
        setIsDealerFlag(d.isDealer === true);
      } else {
        await setDoc(
          refDoc,
          {
            vipScore: 0,
            vbTotalSent: 0,
          },
          { merge: true }
        );

        setVipScore(0);
        setVbTotalSent(0);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  // ==========================================================
  // AVATAR YÜKLEME
  // ==========================================================
  async function handleAvatarUpload() {
    if (!user) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), { avatar: url });

      setAvatar(url);
      showNotice("Profil fotoğrafı güncellendi!");
    } catch (err) {
      showNotice("Avatar yükleme hatası!");
    }
  }

  // ==========================================================
  // GALERİ YÜKLEME
  // ==========================================================
  async function handleGalleryUpload(index: number) {
    if (!user) return;

    const pick = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (pick.canceled) return;

    try {
      const asset = pick.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `gallery/${user.uid}/${index}.jpg`);
      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);
      const updated = [...gallery];

      updated[index] = url;

      await updateDoc(doc(db, "users", user.uid), {
        galleryPhotos: updated,
      });

      setGallery(updated);
      showNotice("Kapak fotoğrafı güncellendi!");
    } catch {
      showNotice("Kapak yüklenirken hata oluştu!");
    }
  }

  // ==========================================================
  // USERNAME KAYDET
  // ==========================================================
  async function saveUsername() {
    if (!user) return;

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        username,
        updatedAt: Date.now(),
      });

      setUsernameEdit(false);
      showNotice("Kullanıcı adı güncellendi!");
    } catch {
      showNotice("Kullanıcı adı güncellenirken hata oldu.");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // ÇIKIŞ
  // ==========================================================
  async function logout() {
    clearRoom();
    await auth.signOut();
    router.replace("/login");
  }

  function showNotice(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2000);
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1C1C1E" />
      </View>
    );

  const hasGallery = gallery.filter(Boolean).length > 0;
  const levelInfo = getLevelInfo(vbTotalSent);

  // ==========================================================
  // RENDER
  // ==========================================================
 return (
  <View
    style={[
      styles.container,
      { paddingTop: insets.top } // 👈 SADECE BU
    ]}
  >
    {notice ? (
  <View style={[styles.noticeBox, { top: insets.top + 12 }]}>
    <Text style={styles.noticeText}>{notice}</Text>
  </View>
) : null}


    {/* ❗ SABİT KALSIN */}
    <ProfileTopBar
  onLogout={logout}
  isDealer={isDealerFlag}
/>

    {/* 👇 SCROLL BAŞLIYOR */}
   <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 120 }}
>
  <View style={{ width: "100%", alignItems: "center" }}>
    <ProfileHeader
      uid={user?.uid}
      isDealer={isDealerFlag}
      avatar={avatar}
      username={username}
      vbId={vbId}
      gender={gender}
      age={age}
      nationality={nationality}
      gallery={gallery}
      usernameEdit={usernameEdit}
      savingUsername={saving}
      onAvatarChange={handleAvatarUpload}
      onUsernameClick={() => setUsernameEdit(true)}
      onUsernameChange={setUsername}
      onUsernameSave={saveUsername}
      onCoverClick={() => hasGallery && setFullScreenOpen(true)}
      onOpenCoverEdit={() => setCoverEditOpen(true)}
      vipScore={vipScore}
      levelInfo={levelInfo}
    />

    <ProfileFollowSection />

    <View style={styles.topActionsRow}>
      {isAdmin(vbId) && (
        <TouchableOpacity
          onPress={() => router.push("/admin")}
          style={styles.adminBtn}
        >
          <Text style={styles.adminBtnText}>Admin Paneli</Text>
        </TouchableOpacity>
      )}

          </View>

    <ProfileWalletButtons />
    <TopSupportersButton uid={user.uid} />
    <BackpackEntry onPress={() => setBackpackOpen(true)} />
    <MarketEntry onPress={() => setMarketOpen(true)} />
  </View>
</ScrollView>


      <CoverEditModal
        open={coverEditOpen}
        gallery={gallery}
        onClose={() => setCoverEditOpen(false)}
        onSelectFile={handleGalleryUpload}
      />

      <FullscreenGallery
        open={fullScreenOpen}
        gallery={gallery}
        onClose={() => setFullScreenOpen(false)}
      />
      <BackpackModal
  visible={backpackOpen}
  onClose={() => setBackpackOpen(false)}
/>
<MarketModal
  visible={marketOpen}
  onClose={() => setMarketOpen(false)}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
         },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
 noticeBox: {
  position: "absolute",
  zIndex: 50,
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: "#2563eb",
  borderRadius: 8,
},
  noticeText: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  adminBtn: {
  position: "absolute",
   bottom: 50,          // 🔹 VbBayim’in biraz üstü
  right: 10,
  paddingVertical: 6,
  paddingHorizontal: 20,
  backgroundColor: "#1e3a8a",
  borderRadius: 10,
  zIndex: 10,
},
adminBtnText: {
  color: "white",
  fontSize: 9,
  fontWeight: "600",
},


  // Bayi butonu
  dealerBtn: {
  paddingVertical: 6,
  paddingHorizontal: 22,
  borderRadius: 14,

  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 5,

  overflow: "hidden",
},

dealerBtnText: {
  color: "#2E2100",
  fontSize: 14,
  fontWeight: "800",
  letterSpacing: 0.4,
  textShadowColor: "rgba(255,255,255,0.55)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1,
},

dealerGloss: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "45%",
  backgroundColor: "rgba(255,255,255,0.35)",
},
topActionsRow: {
  width: "100%",
  height: 1, // absolute butonlar için referans alanı
},

}); 