import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { auth } from "../../firebase/firebaseConfig";
import ProfilePopup from "./ProfilePopup";

export default function OnlineUsers({ visible, room, onClose }) {
  if (!visible) return null;

  const users = room?.onlineUsers || [];
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUid = auth.currentUser?.uid;
  const isHost = currentUid === room?.ownerId;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Online Kullanıcılar</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* USER LIST */}
          <ScrollView style={{ maxHeight: 320 }}>
            {users.length === 0 && (
              <Text style={styles.empty}>Kimse yok...</Text>
            )}

            {users.map((u) => {
              const avatar =
                u.photo ||
                u.avatar ||
                "https://i.imgur.com/4ZQZ4Z4.png";

              return (
                <TouchableOpacity
                  key={u.uid}
                  style={styles.userRow}
                  onPress={() => setSelectedUser(u)}
                >
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                  <Text style={styles.username}>{u.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* PROFILE POPUP */}
          {selectedUser && (
            <ProfilePopup
              user={selectedUser}
              isOwner={isHost}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 260,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  close: {
    fontSize: 20,
    color: "white",
    opacity: 0.7,
  },
  empty: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: "white",
    fontSize: 14,
  },
});
