import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import VoiceRecorder from "./VoiceRecorder";

export default function SendBar({
  newMsg,
  setNewMsg,
  menuOpen,
  setMenuOpen,
  sendMessage,
  sendImage,
  handleTyping,
  onFinishVoice,
  styles,
}) {
  return (
    <View style={styles.sendBar}>
      <View>
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={styles.hamburgerBtn}
        >
          <Text style={{ color: "#1C1C1E", fontSize: 22 }}>☰</Text>
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.popupMenu}>
            <TouchableOpacity onPress={sendImage} style={styles.popupItem}>
              <Text style={styles.popupText}>🖼️ Resim Gönder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <VoiceRecorder onFinish={onFinishVoice} />

      <TextInput
        style={styles.input}
        value={newMsg}
        onChangeText={(t) => {
          setNewMsg(t);
          handleTyping();
        }}
        placeholder="Mesaj yaz..."
        placeholderTextColor="#9A9A9E"
      />

      <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
        <Text style={styles.sendAirplane}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}
