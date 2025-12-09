import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

type Props = {
  avatar: string;
  username: string;
  vbId: string;
  gallery: string[];
  usernameEdit: boolean;
  savingUsername: boolean;
  onAvatarChange: () => void;         // Expo Image Picker tetikleyici
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

  return (
    <View style={styles.wrapper}>

      {/* ============================= */}
      {/* KAPAK FOTOĞRAF BÖLÜMÜ        */}
      {/* ============================= */}
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

        {/* Sağ üst kamera ikonu */}
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

      {/* ============================= */}
      {/* AVATAR                        */}
      {/* ============================= */}
      <TouchableOpacity
        onPress={onAvatarChange}
        activeOpacity={0.8}
        style={styles.avatarWrapper}
      >
        <Image
          source={{ uri: avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* ============================= */}
      {/* USERNAME + ID                 */}
      {/* ============================= */}
      <View style={styles.userInfo}>
        <Text style={styles.vbId}>ID: {vbId}</Text>

        {!usernameEdit ? (
          <TouchableOpacity onPress={onUsernameClick}>
            <Text style={styles.username}>{username}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.usernameEditBox}>
            <TextInput
              value={username}
              onChangeText={onUsernameChange}
              style={styles.usernameInput}
              placeholder="Kullanıcı adı"
              placeholderTextColor="#aaa"
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

  /* Kapak Fotoğrafı */
  coverContainer: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    marginBottom: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
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
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },

  coverCameraBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  coverCameraIcon: {
    fontSize: 18,
    color: "white",
  },

  /* Avatar */
  avatarWrapper: {
    marginTop: -48,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#000",
    resizeMode: "cover",
  },

  /* Username Bölümü */
  userInfo: {
    marginTop: 16,
    alignItems: "center",
  },

  vbId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  username: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },

  usernameEditBox: {
    marginTop: 10,
    alignItems: "center",
    gap: 8,
  },

  usernameInput: {
    width: 200,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },

  saveBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  saveBtnText: {
    color: "white",
    fontSize: 14,
  },
});
