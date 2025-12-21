import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTopSupporters } from "../hooks/useTopSupporters";
import TopSupporterRow from "./TopSupporterRow";

type Props = {
  open: boolean;
  uid: string;
  onClose: () => void;
};

export default function TopSupportersModal({ open, uid, onClose }: Props) {
  
  const { list, loading } = useTopSupporters(uid);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 90) {
            translateY.setValue(0);
            onClose();
            return;
          }
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [onClose, translateY]
  );

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />

        {/* ⭐ PREMIUM HEADER */}
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={["#080808ff", "#e7adadb6", "#080808fb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGlow}
          >
            <LinearGradient
              colors={["#f0f1f5ff", "#f0f1f5ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>👑 Katkıda Bulunanlar </Text>
            </LinearGradient>
          </LinearGradient>
        </View>

        <View style={styles.inner}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <FlatList
              data={list}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 22, paddingTop: 10 }}
              renderItem={({ item, index }) => (
                <TopSupporterRow data={item} rank={index + 1} />
              )}
            />
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    top: 90,
    backgroundColor: "#eff1f8fb",
    borderRadius: 22,
    padding: 12,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  handle: {
    alignSelf: "center",
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 10,
  },

  /* ===== HEADER ===== */
  headerWrap: {
    marginBottom: 10,
  },
  headerGlow: {
    borderRadius: 20,
    padding: 1,
  },
  header: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0B1020",
    textShadowColor: "rgba(255,255,255,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  inner: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 1,
  },

  center: {
    paddingTop: 40,
    alignItems: "center",
  },
});
