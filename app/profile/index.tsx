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

export default function ProfileScreen() {
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
    <View style={styles.container}>
      {notice ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <ProfileTopBar onLogout={logout} />

      <ProfileHeader
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

      {/* ⭐ Admin Paneli */}
      {isAdmin(vbId) && (
        <TouchableOpacity
          onPress={() => router.push("/admin")}
          style={styles.adminBtn}
        >
          <Text style={styles.adminBtnText}>Admin Paneli</Text>
        </TouchableOpacity>
      )}

      {/* ⭐ Yeni: Bayi Paneli */}
      {isDealerFlag && (
        <TouchableOpacity
          onPress={() => router.push("/dealer")}
          style={styles.dealerBtn}
        >
          <Text style={styles.dealerBtnText}>VbBayim</Text>
        </TouchableOpacity>
      )}

      <ProfileWalletButtons />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 40,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  noticeBox: {
    position: "absolute",
    top: 40,
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

  // Admin butonu
  adminBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
  },
  adminBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Bayi butonu
  dealerBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#7c3aed",
    borderRadius: 10,
  },
  dealerBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
