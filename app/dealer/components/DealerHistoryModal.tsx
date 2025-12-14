import React from "react";
import { FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles";

type Props = {
  visible: boolean;
  historyAll: any[];
  onClose: () => void;
  formatVB: (value: number) => string;
};

export default function DealerHistoryModal({
  visible,
  historyAll,
  onClose,
  formatVB,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Tüm İşlem Geçmişi</Text>

        <FlatList
          data={historyAll}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Image source={{ uri: item.avatar }} style={styles.logAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.logName}>{item.username}</Text>
                <Text style={styles.logAmount}>+{formatVB(item.amount)} VB</Text>
              </View>
              <Text style={styles.logDate}>
                {new Date(item.date).toLocaleString("tr-TR")}
              </Text>
            </View>
          )}
        />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
