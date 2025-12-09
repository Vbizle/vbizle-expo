import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { useVbWallet } from "../../src/(hooks)/useVbWallet";

export default function ChatInput({ newMsg, setNewMsg, sendMessage }) {
  const [showWallet, setShowWallet] = useState(false);

  // 🔥 Wallet state
  const { wallet } = useVbWallet();
  const vbBalance = wallet?.vbBalance ?? 0;

  return (
    <View style={styles.container}>
      {/* INPUT */}
      <TextInput
        value={newMsg}
        onChangeText={(t) => setNewMsg(t)}
        placeholder="Mesaj yaz..."
        placeholderTextColor="rgba(255,255,255,0.4)"
        style={styles.input}
      />

      {/* SEND BUTTON */}
      <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
        <Text style={styles.sendText}>Gönder</Text>
      </TouchableOpacity>

      {/* VB BUTTON */}
      <TouchableOpacity
        onPress={() => setShowWallet(!showWallet)}
        style={styles.walletBtn}
      >
        <Text style={styles.walletIcon}>💰</Text>
      </TouchableOpacity>

      {/* VB WALLET POPUP */}
      {showWallet && (
        <View style={styles.walletPopup}>
          <Text style={styles.walletTitle}>💰 Vb Cüzdanı</Text>

          <Text style={styles.walletBalance}>
            Bakiye:{" "}
            <Text style={{ color: "#4ade80", fontWeight: "bold" }}>
              {vbBalance} Vb
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },

  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderRadius: 10,
    color: "white",
  },

  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2563eb",
    borderRadius: 999,
  },

  sendText: {
    color: "white",
    fontWeight: "600",
  },

  walletBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fbbf24",
    alignItems: "center",
    justifyContent: "center",
  },

  walletIcon: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
  },

  walletPopup: {
    position: "absolute",
    right: 8,
    bottom: 60,
    width: 160,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 12,
  },

  walletTitle: {
    color: "#facc15",
    fontWeight: "bold",
    marginBottom: 4,
  },

  walletBalance: {
    color: "white",
  },
});
