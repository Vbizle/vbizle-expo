import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AudioSlot({
  seatNumber,
  occupant,
  isSelf,
  isHost,
  onInvite,
  onKick,
  onToggleMic,
  onHostMute,
}) {
  const [talking, setTalking] = useState(false);

  /* 🔒 EK: güvenli callback sarmalları (mevcut akış korunur) */
  const handleToggleMic = () => {
    if (onToggleMic) onToggleMic();
  };

  const handleKick = () => {
    if (onKick) onKick(seatNumber);
  };

  const handleHostMute = () => {
    if (onHostMute && occupant?.uid) onHostMute(occupant.uid);
  };

  const handleInvite = () => {
    if (onInvite) onInvite(seatNumber);
  };

  /* -------------------------------------------------------
     🔥 Konuşma Algılama (LiveKit AudioLevel)
     • getMonitorLevel bazı cihazlarda null dönebilir → fix var
     • 150 ms ideal: daha hızlı tepki + düşük CPU
  -------------------------------------------------------- */
  useEffect(() => {
    if (!occupant?.audioTrack) return;

    const track = occupant.audioTrack;

    const interval = setInterval(() => {
      let level = 0;

      try {
        level = track.getMonitorLevel?.() ?? 0;
      } catch {
        level = 0;
      }

      setTalking(level > 0.05);
    }, 150);

    return () => clearInterval(interval);
  }, [occupant?.audioTrack]);

  const isEmpty = !occupant;

  return (
    <View style={styles.container}>
      {/* ---------------------------------------------
           Ses Slotu (Konuşma Animasyonu)
      ---------------------------------------------- */}
      <View
        style={[
          styles.slot,
          talking ? styles.talking : null,
          occupant?.hostMute ? styles.hostMutedBorder : null,
        ]}
      >
        {/* BOŞ SLOT */}
        {isEmpty && <Text style={styles.emptyText}>Ses {seatNumber}</Text>}

        {/* DOLU SLOT */}
        {!isEmpty && (
          <Image
            source={{
              uri: occupant.avatar || "https://i.imgur.com/4ZQZ4Z4.png",
            }}
            style={styles.avatar}
          />
        )}
      </View>

      {/* Kullanıcı adı */}
      <Text style={styles.username}>
        {isEmpty ? `Ses ${seatNumber}` : occupant.name}
      </Text>

      {/* ---------------------------------------------
           SELF → Kullanıcı kendi audio koltuğunda ise
      ---------------------------------------------- */}
      {!isEmpty && isSelf && (
        <View style={styles.row}>
          {/* Mikrofon Aç/Kapa */}
          <TouchableOpacity
            onPress={handleToggleMic}
            style={styles.selfBtn}
          >
            <Text style={styles.btnText}>
              {occupant.mic ? "🎙" : "🔇"}
            </Text>
          </TouchableOpacity>

          {/* Koltuktan inme */}
          <TouchableOpacity
            onPress={handleKick}
            style={styles.selfBtn2}
          >
            <Text style={styles.btnText}>⬇️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---------------------------------------------
           HOST → Yönetim (Susturma / Kaldırma)
      ---------------------------------------------- */}
      {isHost && !isSelf && !isEmpty && (
        <View style={styles.row}>
          {/* Sustur / Susturmayı kaldır */}
          <TouchableOpacity
            onPress={handleHostMute}
            style={styles.hostMuteBtn}
          >
            <Text style={styles.btnText}>🔇</Text>
          </TouchableOpacity>

          {/* Kullanıcıyı Koltuktan Kaldır */}
          <TouchableOpacity
            onPress={handleKick}
            style={styles.hostKickBtn}
          >
            <Text style={styles.btnText}>❌</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---------------------------------------------
           HOST → boş koltuk → davet
      ---------------------------------------------- */}
      {isHost && isEmpty && onInvite && (
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={handleInvite}
        >
          <Text style={styles.inviteText}>Davet Et</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* -------------------------------------------------------
   🎨 STYLES — Optimize edilmiş React Native tasarımı
-------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },

  slot: {
    width: 42,
    height: 42,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  talking: {
    borderColor: "#a855f7", // mor parıltı
    borderWidth: 2,
  },

  hostMutedBorder: {
    borderColor: "#eab308", // sarı "host mute" efekti
    borderWidth: 2,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },

  emptyText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    textAlign: "center",
  },

  username: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    width: 50,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    gap: 4,
    marginTop: 3,
  },

  selfBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 20,
  },

  selfBtn2: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 20,
  },

  hostMuteBtn: {
    backgroundColor: "#ca8a04",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 20,
  },

  hostKickBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 20,
  },

  inviteBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 3,
  },

  inviteText: {
    color: "white",
    fontSize: 9,
    textAlign: "center",
  },

  btnText: {
    color: "white",
    fontSize: 10,
  },
});
