import { onSnapshot } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  followersQuery,
  followingQuery,
} from "../../social/services/followService";
import { UserProfileData } from "../hooks/useUserProfile";

type Props = {
  profile: UserProfileData;
  isOwnProfile: boolean;
};

export default function UserProfileHeader({ profile, isOwnProfile }: Props) {
  // =====================================================
  // 1) COVER (fallback alanlar)
  // =====================================================
  const coverUri = useMemo(() => {
    const p: any = profile;

    // olası alanlar: cover (string), covers (string[]), coverPhotos (string[])
    const arr: string[] =
      (Array.isArray(p.covers) ? p.covers : []) ||
      (Array.isArray(p.coverPhotos) ? p.coverPhotos : []) ||
      [];

    // eğer tek cover varsa onu başa koy
    const single = typeof p.cover === "string" ? p.cover : "";
    const merged = [
      ...(single ? [single] : []),
      ...arr,
    ].filter(Boolean);

    return merged.length > 0 ? merged[0] : "";
  }, [profile]);

  // =====================================================
  // 2) LV / VIP (fallback alanlar)
  // =====================================================
  const levelText = useMemo(() => {
    const p: any = profile;
    const level =
      Number(p.level ?? p.lv ?? p.levelScore ?? 0) || 0;
    return level;
  }, [profile]);

  const vipText = useMemo(() => {
    const p: any = profile;
    const vip =
      Number(p.vipScore ?? p.vip ?? p.vipPoints ?? 0) || 0;
    return vip;
  }, [profile]);

  // =====================================================
  // 3) Takip / Arkadaş / Takipçi (follows koleksiyonundan canlı sayım)
  //    - following: from == uid (to alanlarını say)
  //    - followers: to == uid (from alanlarını say)
  //    - friends: intersection (mutual)
  // =====================================================
  const [counts, setCounts] = useState({
    following: 0,
    friends: 0,
    followers: 0,
  });

  useEffect(() => {
    const uid = (profile as any)?.uid;
    if (!uid) {
      setCounts({ following: 0, friends: 0, followers: 0 });
      return;
    }

    let followingSet = new Set<string>();
    let followerSet = new Set<string>();

    function recompute() {
      const following = followingSet.size;
      const followers = followerSet.size;

      let friends = 0;
      // mutual = intersection
      for (const u of followingSet) {
        if (followerSet.has(u)) friends += 1;
      }

      setCounts({ following, friends, followers });
    }

    const unsubFollowing = onSnapshot(followingQuery(uid), (snap) => {
      const s = new Set<string>();
      snap.docs.forEach((d) => {
        const to = (d.data() as any)?.to;
        if (typeof to === "string" && to) s.add(to);
      });
      followingSet = s;
      recompute();
    });

    const unsubFollowers = onSnapshot(followersQuery(uid), (snap) => {
      const s = new Set<string>();
      snap.docs.forEach((d) => {
        const from = (d.data() as any)?.from;
        if (typeof from === "string" && from) s.add(from);
      });
      followerSet = s;
      recompute();
    });

    return () => {
      unsubFollowing();
      unsubFollowers();
    };
  }, [(profile as any)?.uid]);

  return (
    <View>
      {/* COVER */}
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}

      {/* AVATAR + INFO */}
      <View style={styles.infoRow}>
        <Image
          source={{
            uri:
              (profile as any)?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.username}>
            {(profile as any)?.username || (profile as any)?.name || "Kullanıcı"}
          </Text>

          <Text style={styles.sub}>
  LV {profile.level} · VIP {profile.vip}
  {profile.age ? ` · ${profile.age}` : ""}
  {profile.countryFlag ? ` ${profile.countryFlag}` : ""}
</Text>
        </View>
      </View>

      {/* ZİYARET EDİLEN PROFİL → SAYAC */}
      {!isOwnProfile && (
        <View style={styles.counterRow}>
          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{counts.following}</Text>
            <Text style={styles.counterLabel}>Takip</Text>
          </View>

          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{counts.friends}</Text>
            <Text style={styles.counterLabel}>Arkadaş</Text>
          </View>

          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{counts.followers}</Text>
            <Text style={styles.counterLabel}>Takipçi</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    height: 160,
  },
  coverPlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#eee",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    marginTop: 2,
    fontSize: 13,
    color: "#666",
  },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingHorizontal: 24,
  },
  counterItem: {
    alignItems: "center",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  counterLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
