import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getLevelBadge } from "@/app/components/level-badges/levelBadgeMap";
import { auth } from "@/firebase/firebaseConfig";
import UserBadgesRow from "@/src/badges/components/UserBadgesRow";
import { useRealtimeUserBadges } from "@/src/badges/hooks/useRealtimeUserBadges";
import { getVipColor, getVipRank } from "@/src/utils/vipSystem";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  uid?: string;
  avatar: string;
  username: string;
  vbId: string;
  gender?: string;
  age?: string | number;
  nationality?: any;
  gallery: string[];
  usernameEdit: boolean;
  savingUsername: boolean;
  vipScore: number;
  distanceKm?: number | null;


  isDealer?: boolean; // ✅ SADECE BURADA

  levelInfo: {
    level: number;
    label: string;
    color: string;
  };

  onAvatarChange: () => void;
  onUsernameClick: () => void;
  onUsernameChange: (val: string) => void;
  onUsernameSave: () => void;
  onCoverClick: () => void;
  onOpenCoverEdit: () => void;
  isPublic?: boolean;
};

export default function ProfileHeader({
  uid, 
  avatar,
  username,
  vbId,
  distanceKm, 
  gender,
  age,
  nationality,
  gallery,
  usernameEdit,
  savingUsername,
  vipScore,
  levelInfo,
  onAvatarChange,
  onUsernameClick,
  onUsernameChange,
  onUsernameSave,
  onCoverClick,
  onOpenCoverEdit,
  isPublic = false, // 🔴 EKLE
   isDealer, // ✅ EKLE
}: Props) {
  console.log("🟢 ProfileHeader render uid:", uid);

  const hasGallery = gallery.filter(Boolean).length > 0;
 const resolvedUid = isPublic
  ? uid ?? vbId // 🔥 ziyaret edilen kullanıcı
  : auth.currentUser?.uid;
console.log("🔥 resolvedUid (FINAL):", resolvedUid);

const { badges } = useRealtimeUserBadges(resolvedUid);
// 🔒 PLATFORM ROOT (UI SEVİYESİ)
const PLATFORM_ROOT_UID = "9G9jqVmQSdZXVD6B6ah8w8nJwDw2";

const isUiRootUser =
  resolvedUid === PLATFORM_ROOT_UID ||
  vbId === "VB-1";
  const isRootUser =
  badges?.roles?.root === true || isUiRootUser;



  const genderSymbol =
    gender === "male"
      ? "♂"
      : gender === "female"
      ? "♀"
      : null;

  const badgeColor =
    gender === "male"
      ? "#3B82F6"
      : gender === "female"
      ? "#EC4899"
      : "#9CA3AF";

  const showBadge = genderSymbol && age;

  const liveLevel = badges?.level ?? levelInfo.level;
const liveVipScore = badges?.vipScore ?? vipScore;

const vipRank = getVipRank(liveVipScore);
const vipColor = getVipColor(vipRank);
const LevelBadge = getLevelBadge(liveLevel);



 return (
  <View style={styles.wrapper}>
    {/* COVER */}
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onCoverClick?.()}
      style={styles.coverContainer}
    >
      {hasGallery ? (
        <View style={styles.coverInner}>
          {/* 🔥 ARKA PLAN (blur + cover) */}
          <Image
            source={{ uri: gallery[0] }}
            style={styles.coverBackground}
            resizeMode="cover"
            blurRadius={20}
          />

          {/* 🎯 ÖN PLAN (net + kırpma yok) */}
          <Image
            source={{ uri: gallery[0] }}
            style={styles.coverImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.noCoverBox}>
          <Text style={styles.noCoverText}>
            Henüz kapak fotoğrafı yok
          </Text>
        </View>
      )}

      {!isPublic && onOpenCoverEdit && (
        <TouchableOpacity
          style={styles.coverCameraBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onOpenCoverEdit();
          }}
        >
          <Text style={styles.coverCameraIcon}>📷</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>

      {/* AVATAR */}
      <TouchableOpacity
        onPress={onAvatarChange}
        activeOpacity={0.8}
        style={styles.avatarWrapper}
      >
        <Image
          source={{
            uri:
              avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* USER INFO */}
<View style={styles.userInfo}>
  {!usernameEdit ? (
    <View style={styles.usernameRow}>
      {isPublic ? (
        // 🔒 ZİYARETÇİ → TIKLANAMAZ
        <Text style={styles.username}>{username}</Text>
      ) : (
        // 👤 KENDİ PROFİLİ → ESKİ DAVRANIŞ AYNI
      <TouchableOpacity onPress={onUsernameClick}>
  <View style={styles.usernameEditWrapper}>
    <Text style={styles.username}>{username}</Text>

    <Text style={styles.editIconSuperscript}>
      ✏️
    </Text>
  </View>
</TouchableOpacity>
      )}
     {isRootUser && isPublic && (
  <LinearGradient
    colors={["#185ac4ff", "#f1f2f3ff", "#a82f2fff"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.officialBadge}
  >
    <Text style={styles.officialBadgeText}>✔ Resmi Hesap</Text>
  </LinearGradient>
)}

      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {genderSymbol}
            {age}
          </Text>
        </View>
      ) : null}

      {nationality?.flag ? (
        <Text style={styles.flagText}>{nationality.flag}</Text>
      ) : null}
    </View>
  ) : (
          <View style={styles.usernameEditBox}>
            <TextInput
              value={username}
              onChangeText={onUsernameChange}
              style={styles.usernameInput}
              placeholder="Kullanıcı adı"
              placeholderTextColor="#A1A1AA"
              maxLength={20}
            />

            <TouchableOpacity
              onPress={onUsernameSave}
              style={[styles.saveBtn, savingUsername && { opacity: 0.5 }]}
              disabled={savingUsername}
            >
              <Text style={styles.saveBtnText}>
                {savingUsername ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

   <Text style={styles.vbId}>
  ID: {vbId}

  {!isRootUser &&
    typeof distanceKm === "number" &&
    distanceKm >= 0 && (
      <Text style={styles.distanceText}>
        {" • "}
        <Text style={styles.locationIcon}>📍Yakınlık</Text>{" "}
        {distanceKm < 1 ? "1.0" : distanceKm.toFixed(1)}
        {" km "}
      </Text>
    )}
</Text>
      </View>

    {!isRootUser && (
  <View style={styles.rankRow}>
    <UserBadgesRow
  levelInfo={levelInfo}
  vipScore={liveVipScore}
  roles={badges?.roles}   // SVIP, admin buradan
  isDealer={isDealer}  
  svpLevel={badges?.svp?.level ?? 0}   // 🔥 BAYİ SADECE BURADAN
 />
  </View>
)}


    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
    position: "relative",
  },

 coverContainer: {
  width: "100%",
  height: 160,                 // ✅ eski boyut geri
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.1)",
  overflow: "hidden",
  marginBottom: 0,
  backgroundColor: "#F2F2F7",  // ✅ boşluk olursa şık dursun
},
// 👇 BURAYA EKLEDİN
  coverInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  coverBackground: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  coverImage: {
    width: "100%",
    height: "120%",
      },

  noCoverBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noCoverText: {
    color: "#6B7280",
    fontSize: 12,
  },

  coverCameraBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  coverCameraIcon: {
    fontSize: 18,
    color: "#1C1C1E",
  },

  avatarWrapper: {
    marginTop: -50,
    alignSelf: "flex-start",
    marginLeft: 1,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#F2F2F7",
    resizeMode: "cover",
  },

  userInfo: {
    marginTop: -54,
    alignItems: "flex-start",
    width: "100%",
    paddingLeft: 100,
  },

  rankRow: {
  position: "absolute",
  bottom: -26,
  left: 1,
  flexDirection: "row",
  alignItems: "center",
},
levelText: {
  color: "#fdf7f7ff",
  fontWeight: "700",
  fontSize: 11,           // gerekirse 9 da olur
},
  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 8,
    color: "#fff",
    fontWeight: "700",
    fontSize: 10,
  },

  vipTag: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
    color: "#fff",
    fontWeight: "700",
    fontSize: 10,
  },

  vbId: {
  fontSize: 11,
  color: "#6B7280",
  fontWeight: "500",
},

distanceText: {
  fontWeight: "600",
  color: "#111827",
  fontSize: 13,
},

locationIcon: {
  fontSize: 13,
  marginRight: 2,
},

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  badge: {
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderRadius: 12,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },

  flagText: {
    fontSize: 16,
    marginLeft: -2,
  },

  usernameEditBox: {
    marginTop: 10,
    alignItems: "center",
    gap: 8,
  },

  usernameInput: {
    width: 200,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    color: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 6,
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
 officialBadge: {
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 4,
  marginLeft: 6,
   marginTop: 6, 
  borderWidth: 1,
  borderColor: "rgba(32, 11, 109, 1)", // soft mavi çerçeve
},
officialBadgeText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#290909ff", // koyu mavi yazı
  textShadowColor: "rgba(255,255,255,0.6)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1,
},
usernameEditWrapper: {
  flexDirection: "row",
  alignItems: "flex-start", // 🔴 önemli
},

editIconSuperscript: {
  fontSize: 11,        // küçük
  opacity: 0.55,
  marginLeft: 4,       // nickten biraz ayır
  marginTop: 3,       // 🔥 yukarı kaldırır (üst sağ efekti)
  transform: [{ scaleX: -1 }], // 👈 kalem ucu sola bakar
},
});
