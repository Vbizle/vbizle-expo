import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { db } from "@/firebase/firebaseConfig";
import UserBadgesRow from "@/src/badges/components/UserBadgesRow";
import { useRealtimeUserBadges } from "@/src/badges/hooks/useRealtimeUserBadges";
import { resolveDisplayProfile } from "@/src/premium/resolveDisplayProfile";
import { formatDistanceKm } from "@/src/utils/formatDistanceKm";
import { getLevelInfo } from "@/src/utils/levelSystem";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";

type Props = {
  user: {
    uid: string;
    username?: string;
    avatar?: string;
    age?: number;
    gender?: "male" | "female";
    country?: string;
    premiumStatus?: any;
    distanceKm: number;
     online?: boolean;
  };
};

export default function NearbyUserCard({ user }: Props) {
  const router = useRouter();

  // 🔴 canlı username / avatar (profil ile senkron)
  const [liveUsername, setLiveUsername] = React.useState<string | undefined>(
    user.username
  );
  const [liveAvatar, setLiveAvatar] = React.useState<string | undefined>(
    user.avatar
  );

  useEffect(() => {
    if (!user.uid) return;

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      setLiveUsername(d.username);
      setLiveAvatar(d.avatar);
    });

    return unsub;
  }, [user.uid]);

  const { badges } = useRealtimeUserBadges(user.uid);
  const levelInfo = getLevelInfo(badges?.vbTotalSent ?? 0);

  const displayProfile = resolveDisplayProfile({
    username: liveUsername || "Kullanıcı",
    avatarUrl: liveAvatar || "",
    premiumStatus: user.premiumStatus,
  });

  const canPress = !displayProfile.isMasked;

  const avatarSource =
    displayProfile.isMasked && displayProfile.avatarSource
      ? displayProfile.avatarSource
      : liveAvatar
      ? { uri: liveAvatar }
      : require("../../../assets/icons/user-placeholder.png");

  return (
    <Pressable
      disabled={!canPress}
      onPress={() => router.push(`/profile/user/${user.uid}`)}
      style={styles.row}
    >
      {/* AVATAR */}
      <View style={{ position: "relative" }}>
        <Image source={avatarSource} style={styles.avatar} />
          {/* 🖼️ AVATAR ÇERÇEVESİ */}
  {user.activeFrame && (
    <Image
      source={{ uri: user.activeFrame.imageUrl }}
      style={styles.avatarFrame}
    />
  )}

        {/* 🟢 ONLINE DOT */}
       <View
  style={[
    styles.onlineDot,
    { backgroundColor: "#22c55e" },
  ]}
/>
      </View>

      {/* ORTA */}
      <View style={styles.mid}>
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            {displayProfile.nickname}
          </Text>

          {user.gender && user.age ? (
            <View
              style={[
                styles.miniBadge,
                {
                  backgroundColor:
                    user.gender === "male" ? "#3B82F6" : "#EC4899",
                },
              ]}
            >
              <Text style={styles.miniBadgeText}>
                {user.gender === "male" ? "♂" : "♀"}
                {user.age}
              </Text>
            </View>
          ) : null}

          {user.country ? (
            <Text style={styles.miniFlag}>{user.country}</Text>
          ) : null}
        </View>

        {/* ROZETLER */}
        {!displayProfile.isMasked && (
          <View style={styles.badgeWrap}>
            <UserBadgesRow
              levelInfo={levelInfo}
              vipScore={badges?.vipScore ?? 0}
              svpLevel={badges?.svp?.level ?? 0}
              isDealer={badges?.roles?.dealer === true}
              roles={badges?.roles}
              compact
              wrap
            />
          </View>
        )}

        {/* MESAFE */}
        <Text style={styles.distance}>
          {formatDistanceKm(user.distanceKm)} uzaklıkta
        </Text>
      </View>

      {/* SAĞ */}
      <Pressable
        onPress={() => router.push(`/messages/${user.uid}`)}
        style={styles.helloBtn}
      >
        <Text style={styles.helloText}>Merhaba</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: "#f3f4f6ef",
    minHeight: 70,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
  },

  mid: {
    flex: 1,
    marginLeft: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },

  username: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    maxWidth: "70%",
  },

  miniBadge: {
    paddingHorizontal: 4,
    borderRadius: 10,
    marginLeft: 4,
  },

  miniBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  miniFlag: {
    fontSize: 14,
    marginLeft: 4,
  },

  badgeWrap: {
    marginTop: 2,
    transform: [{ scale: 0.9 }],
    transformOrigin: "left",
  },

  distance: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },

  helloBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    marginLeft: 8,
  },

  helloText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  avatarFrame: {
  position: "absolute",
  top: -6,
  left: -6,
  width: 60,
  height: 60,
  resizeMode: "contain",
  pointerEvents: "none",
},
});
