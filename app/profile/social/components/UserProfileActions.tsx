import { auth } from "@/firebase/firebaseConfig";
import React, { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { openDmWithUser } from "../../user/services/openDmWithUser";

import { useFollowStatus } from "../../social/hooks/useFollowStatus";
import { followUser, unfollowUser } from "../../social/services/followService";

type Props = {
  targetUid?: string;
};

function isValidUid(uid: any): uid is string {
  return typeof uid === "string" && uid.trim().length > 0 && uid !== "undefined" && uid !== "null";
}

// 🔒 PLATFORM ROOT UID (UI SEVİYESİ)
const PLATFORM_ROOT_UID = "9G9jqVmQSdZXVD6B6ah8w8nJwDw2";

export default function UserProfileActions({ targetUid }: Props) {
  const myUid = auth.currentUser?.uid;

  /* =====================================================
     🔴 targetUid GELMEDİYSE → BEYAZ EKRAN YAPMA
  ===================================================== */
  if (!isValidUid(targetUid)) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledBox}>
          <Text style={styles.disabledText}>
            Profil işlemleri yüklenemedi
          </Text>
        </View>
      </View>
    );
  }

  /* =====================================================
     🔒 Kendi profili veya auth yoksa → aksiyon gösterme
  ===================================================== */
  if (!isValidUid(myUid) || myUid === targetUid) {
    return null;
  }

  // 🔒 ROOT PROFİLİ ZİYARET EDİLİYOR MU?
  const isTargetRoot = targetUid === PLATFORM_ROOT_UID;

  /* =====================================================
     ✅ FOLLOW DURUMU
  ===================================================== */
  const { isFollowing, isFriend, loading } = useFollowStatus(targetUid);

  const followLabel = useMemo(() => {
    if (isFriend) return "Arkadaşsın";
    if (isFollowing) return "Takibi Bırak";
    return "Takip Et";
  }, [isFriend, isFollowing]);

  async function handleFollowPress() {
    try {
      if (isFollowing) {
        await unfollowUser(targetUid);
      } else {
        await followUser(targetUid);
      }
    } catch (e: any) {
      Alert.alert("Hata", e?.message || "İşlem yapılamadı");
    }
  }

  function handleMessagePress() {
    openDmWithUser(targetUid);
  }

  /* =====================================================
     ⏳ LOADING → BEYAZ EKRAN YOK
  ===================================================== */
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledBox}>
          <Text style={styles.disabledText}>Yükleniyor…</Text>
        </View>
      </View>
    );
  }

  /* =====================================================
     ✅ ROOT ZİYARET → SADECE MESAJ
  ===================================================== */
  if (isTargetRoot) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.messageBtn} onPress={handleMessagePress}>
          <Text style={styles.messageText}>Mesaj Gönder</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* =====================================================
     ✅ NORMAL RENDER
  ===================================================== */
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.followBtn, isFollowing && styles.following]}
        onPress={handleFollowPress}
        disabled={isFriend}
      >
        <Text style={styles.followText}>{followLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.messageBtn} onPress={handleMessagePress}>
        <Text style={styles.messageText}>Mesaj Gönder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  followBtn: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  following: {
    backgroundColor: "#444",
  },
  followText: {
    color: "#fff",
    fontWeight: "600",
  },
  messageBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  messageText: {
    fontWeight: "600",
  },

  /* 🔒 targetUid / loading yokken görünen güvenli UI */
  disabledBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EEE",
    alignItems: "center",
  },
  disabledText: {
    color: "#666",
    fontWeight: "600",
  },
});
