import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  avatar: string;
  username: string;
  vbId: string;
  gender?: string;    // ⭐ yeni
  age?: string | number; // ⭐ yeni
  gallery: string[];
  usernameEdit: boolean;
  savingUsername: boolean;
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
  gallery,
  usernameEdit,
  savingUsername,
  onAvatarChange,
  onUsernameClick,
  onUsernameChange,
  onUsernameSave,
  onCoverClick,
  onOpenCoverEdit,
}: Props) {
  const hasGallery = gallery.filter(Boolean).length > 0;

  // --------------------------------------------------------
  //  BADGE (cinsiyet + yaş)
  // --------------------------------------------------------
  const genderSymbol =
    gender === "male"
      ? "♂"
      : gender === "female"
      ? "♀"
      : null;

  const badgeColor =
    gender === "male"
      ? "#3B82F6" // mavi
      : gender === "female"
      ? "#EC4899" // pembe
      : "#9CA3AF";

  const showBadge = genderSymbol && age;

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
        <Text style={styles.vbId}>ID: {vbId}</Text>

        {/* KULLANICI ADI + BADGE */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  /* COVER */
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

  /* AVATAR */
  avatarWrapper: {
    marginTop: -48,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#F2F2F7",
    resizeMode: "cover",
  },

  /* USER INFO */
  userInfo: {
    marginTop: 16,
    alignItems: "center",
  },

  vbId: {
    fontSize: 12,
    color: "#6B7280",
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  /* BADGE */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
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
