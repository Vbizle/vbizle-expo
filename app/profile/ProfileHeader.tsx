import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getLevelColor } from "@/src/utils/levelSystem"; // ⭐ METALİK LEVEL EKLENDİ
import { getVipColor, getVipRank } from "@/src/utils/vipSystem";

type Props = {
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

  levelInfo: { level: number; name: string };

  onAvatarChange: () => void;
  onUsernameClick: () => void;
  onUsernameChange: (val: string) => void;
  onUsernameSave: () => void;
  onCoverClick: () => void;
  onOpenCoverEdit: () => void;
};

export default function ProfileHeader({
  avatar,
  username,
  vbId,
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
}: Props) {
  const hasGallery = gallery.filter(Boolean).length > 0;

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

  const vipRank = getVipRank(vipScore);
  const vipColor = getVipColor(vipRank);

  return (
    <View style={styles.wrapper}>

      {/* COVER */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onCoverClick}
        style={styles.coverContainer}
      >
        {hasGallery ? (
          <Image source={{ uri: gallery[0] }} style={styles.coverImage} />
        ) : (
          <View style={styles.noCoverBox}>
            <Text style={styles.noCoverText}>Henüz kapak fotoğrafı yok</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.coverCameraBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onOpenCoverEdit();
          }}
        >
          <Text style={styles.coverCameraIcon}>📷</Text>
        </TouchableOpacity>
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
            <TouchableOpacity onPress={onUsernameClick}>
              <Text style={styles.username}>{username}</Text>
            </TouchableOpacity>

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

        <Text style={styles.vbId}>ID: {vbId}</Text>
      </View>

      {/* ⭐ LEVEL + VIP */}
      <View style={styles.rankRow}>
        <Text
          style={[
            styles.levelTag,
            { backgroundColor: getLevelColor(levelInfo.level) }, // ⭐ METALİK RENK
          ]}
        >
          Lv {levelInfo.level}
        </Text>

        <Text style={[styles.vipTag, { backgroundColor: vipColor }]}>
          VIP {vipRank}
        </Text>
      </View>

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
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginBottom: 0,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    paddingLeft: 95,
  },

  rankRow: {
    position: "absolute",
    bottom: -25,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 1,
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
    fontSize: 10,
    color: "#6B7280",
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
});
