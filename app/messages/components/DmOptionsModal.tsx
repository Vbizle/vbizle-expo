// app/messages/components/DmOptionsModal.tsx
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

type Props = {
  visible: boolean;
  conv: any | null;
  onClose: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
};

export default function DmOptionsModal({
  visible,
  conv,
  onClose,
  onPin,
  onUnpin,
  onDelete,
  onBlock,
}: Props) {
  if (!visible || !conv) return null;

  const user = auth.currentUser;
  const isPinned = conv.isPinned === true;

  const metaRef = doc(db, "dm", conv.convId, "meta", "info");

  /* ======================================================
       SABİTLE
  ====================================================== */
  const handlePin = async () => {
    if (!user) return;

    try {
      await setDoc(
        metaRef,
        {
          pinFor: { [user.uid]: true },
          pinTime: Date.now(),
        },
        { merge: true }
      );

      console.log("📌 DM pinned:", conv.convId);
      onPin && onPin();
    } catch (e) {
      console.log("Pin error:", e);
    } finally {
      onClose();
    }
  };

  /* ======================================================
       SABİT KALDIR
  ====================================================== */
  const handleUnpin = async () => {
    if (!user) return;

    try {
      await setDoc(
        metaRef,
        {
          pinFor: { [user.uid]: false },
        },
        { merge: true }
      );

      console.log("❌ Pin removed:", conv.convId);
      onUnpin && onUnpin();
    } catch (e) {
      console.log("Unpin error:", e);
    } finally {
      onClose();
    }
  };

  /* ======================================================
       DM SİL (SOFT DELETE)
  ====================================================== */
  const handleDelete = async () => {
    if (!user) return;

    try {
      await setDoc(
        metaRef,
        {
          hiddenFor: {
            [user.uid]: true,
          },
          lastSeenTime: Date.now(),
        },
        { merge: true }
      );

      console.log("🗑️ DM hidden:", conv.convId);
      onDelete && onDelete();
    } catch (e) {
      console.log("Delete error:", e);
    } finally {
      onClose();
    }
  };

  /* ======================================================
       ENGELLE
  ====================================================== */
  const handleBlock = async () => {
    if (!user) return;

    try {
      const ref = doc(db, "blocked", user.uid, "users", conv.otherId);
      await setDoc(
        ref,
        {
          otherId: conv.otherId,
          blockedAt: Date.now(),
        },
        { merge: true }
      );

      console.log("🚫 blocked:", conv.otherId);
      onBlock && onBlock();
    } catch (e) {
      console.log("Block error:", e);
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.bg}>
        <View style={styles.card}>

          {/* Eğer sabit değilse → sabitle */}
          {!isPinned && (
            <TouchableOpacity style={styles.item} onPress={handlePin}>
              <Text style={styles.itemText}>Başa sabitle</Text>
            </TouchableOpacity>
          )}

          {/* Eğer sabit ise → sabit kaldır */}
          {isPinned && (
            <TouchableOpacity style={styles.item} onPress={handleUnpin}>
              <Text style={styles.itemText}>Sabitlenmeyi kaldır</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.item} onPress={handleDelete}>
            <Text style={[styles.itemText, { color: "#dc2626" }]}>
              Mesajlaşmayı sil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleBlock}>
            <Text style={styles.itemText}>Engelle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 8,
    overflow: "hidden",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  itemText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  cancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6E6E73",
  },
});
