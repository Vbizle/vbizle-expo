import { db } from "@/firebase/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auth } from "@/firebase/firebaseConfig";

import { calculateDistanceKm } from "../../../location";
import FullscreenGallery from "../FullscreenGallery"; // ✅ ZATEN VAR
import ProfileHeader from "../ProfileHeader";
import UserProfileActions from "../social/components/UserProfileActions";
import ProfileFollowSection from "../social/ProfileFollowSection";
import { useUserProfile } from "./hooks/useUserProfile";


export default function UserProfileScreen() {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  // 🔥 UID NORMALIZE
  const params = useLocalSearchParams<{ uid?: string | string[] }>();
  const rawUid = params.uid;
  const targetUid = Array.isArray(rawUid) ? rawUid[0] : rawUid;



  if (!targetUid) {
    return (
      <View style={styles.center}>
        <Text>Profil açılamadı (uid yok)</Text>
      </View>
    );
  }

  const myUid = auth.currentUser?.uid;
  const isOwnProfile = myUid === targetUid;

  const { data, loading } = useUserProfile(targetUid);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  

useEffect(() => {
  console.log("📍 [DISTANCE] useEffect başladı");
  console.log("📍 [DISTANCE] myUid:", myUid);
  console.log("📍 [DISTANCE] targetUid:", targetUid);

  if (!myUid || !targetUid || myUid === targetUid) {
    console.log("⛔ [DISTANCE] guard tetiklendi → mesafe hesaplanmadı");
    setDistanceKm(null);
    return;
  }

  let unsubTarget: (() => void) | null = null;

  const unsubMe = onSnapshot(doc(db, "users", myUid), (meSnap) => {
    const myLoc = meSnap.data()?.location;

    console.log("📡 [DISTANCE] my location raw:", myLoc);

    if (!myLoc?.enabled) {
      console.log("⛔ [DISTANCE] my location disabled / yok");
      setDistanceKm(null);
      return;
    }

    // önce eski target listener’ı kapat
    if (unsubTarget) {
      unsubTarget();
      unsubTarget = null;
    }

    unsubTarget = onSnapshot(doc(db, "users", targetUid), (tSnap) => {
      const tLoc = tSnap.data()?.location;

      console.log("📡 [DISTANCE] target location raw:", tLoc);

      if (!tLoc?.enabled) {
        console.log("⛔ [DISTANCE] target location disabled / yok");
        setDistanceKm(null);
        return;
      }

      const km = calculateDistanceKm(
        myLoc.lat,
        myLoc.lng,
        tLoc.lat,
        tLoc.lng
      );

      console.log("📏 [DISTANCE] hesaplanan km:", km);

      setDistanceKm(km);
    });
  });

  return () => {
    console.log("🧹 [DISTANCE] cleanup");
    unsubMe();
    if (unsubTarget) unsubTarget();
  };
}, [myUid, targetUid]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Kullanıcı bulunamadı</Text>
      </View>
    );
  }

  // 🔒 PLATFORM ROOT (ZİYARET TESPİTİ)
  const PLATFORM_ROOT_UID = "9G9jqVmQSdZXVD6B6ah8w8nJwDw2";
  const isRootTarget =
    data.uid === PLATFORM_ROOT_UID || data.vbId === "VB-1";
console.log("🔥 UserProfileScreen data.uid:", data.uid);

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <ProfileHeader
        uid={data.uid}
        avatar={data.avatar}
        username={data.username}
        vbId={data.vbId}
        gender={data.gender}
        age={data.age}
        nationality={data.nationality}
        gallery={data.gallery}
        vipScore={data.vipScore}
        levelInfo={data.levelInfo}
         isDealer={data.isDealer}   // 🔴 BU SATIR

        // 🔒 ZİYARETÇİ MODU
        isPublic={!isOwnProfile}
         distanceKm={distanceKm} 

        // ✅ KAPAK TIKLANINCA MODAL AÇ
        onCoverClick={() => {
          if (!data.gallery || data.gallery.length === 0) return;
          setFullScreenOpen(true);
        }}
      />

      {/* 🔢 TAKİP / ARKADAŞ / TAKİPÇİ */}
      {!(isRootTarget && !isOwnProfile) && (
        <ProfileFollowSection targetUid={targetUid} />
      )}

      {/* 🔘 TAKİP / MESAJ */}
      {!isOwnProfile && (
        <View style={styles.actionsWrapper}>
          <UserProfileActions targetUid={targetUid} />
        </View>
      )}

      {/* 🖼️ FULLSCREEN GALERİ (ZİYARETÇİ + SAHİP) */}
      <FullscreenGallery
        open={fullScreenOpen}
        gallery={data.gallery}
        onClose={() => setFullScreenOpen(false)}
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
    alignItems: "center",
    justifyContent: "center",
  },
  actionsWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
