import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import TopSupportersModal from "./TopSupportersModal";

type Props = {
  uid: string; // profil sahibi uid (kimin topSupporters'ı gösterilecek)
  title?: string; // buton yazısı opsiyonel
};

export default function TopSupportersButton({ uid, title = "En İyiler" }: Props) {
  const [open, setOpen] = useState(false);

  const subtitle = useMemo(() => {
    // Şimdilik statik; sonraki adımda liste sayısı / toplam vb göstereceğiz
    return "Katkıda Bulunanlar";
  }, []);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.92 }]}
      >
        <LinearGradient
          // Premium hissi: altın -> mor -> lacivert
          colors={["#F5D98B", "#B886F8", "#1E3A8A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          {/* Sol: taç */}
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>👑</Text>
          </View>

          {/* Orta: başlık + alt başlık */}
          <View style={styles.textWrap}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <Text numberOfLines={1} style={styles.subTitle}>
              {subtitle}
            </Text>
          </View>

          {/* Sağ: ok */}
          <View style={styles.chevWrap}>
            <Text style={styles.chev}>›</Text>
          </View>

          {/* Üst parlama */}
          <View pointerEvents="none" style={styles.gloss} />
        </LinearGradient>
      </Pressable>

      {/* Modal (yarım ekran - üstte boşluk kalacak) */}
      <TopSupportersModal
        open={open}
        uid={uid}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 14,
  },

  btn: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },

  textWrap: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0B1020",
    letterSpacing: 0.2,
  },
  subTitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(11,16,32,0.72)",
  },

  chevWrap: {
    width: 26,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  chev: {
    fontSize: 22,
    fontWeight: "900",
    color: "rgba(11,16,32,0.70)",
    marginTop: -2,
  },

  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
