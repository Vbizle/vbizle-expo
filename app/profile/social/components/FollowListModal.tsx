import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MiniUser } from "../types";
import FollowListItem from "./FollowListItem";

type Mode = "following" | "followers" | "friends";

type Props = {
  visible: boolean;
  mode: Mode; // dışarıdan hangi sayaçtan girildiği
  following: MiniUser[];
  followers: MiniUser[];
  friends: MiniUser[];
  onClose: () => void;
  onUnfollow?: (uid: string) => void;
};

export default function FollowListModal({
  visible,
  mode,
  following,
  followers,
  friends,
  onClose,
  onUnfollow,
}: Props) {
  const [activeTab, setActiveTab] = useState<Mode>(mode);

  // Modal her açıldığında dışarıdan gelen moda senkronla
  useEffect(() => {
    if (visible) setActiveTab(mode);
  }, [visible, mode]);

  const data =
    activeTab === "following"
      ? following
      : activeTab === "followers"
      ? followers
      : friends;

  return (
  <Modal
  visible={visible}
  animationType="slide"
  onRequestClose={onClose}   // 👈 ANDROID GERİ TUŞU İÇİN ZORUNLU
>
  <SafeAreaView style={styles.container}>
    {/* HEADER */}
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} hitSlop={10}>
        <Text style={styles.back}>‹</Text>
      </TouchableOpacity>

          <Text style={styles.title}>Kişiler</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <Tab
            label={`Takip (${following.length})`}
            active={activeTab === "following"}
            onPress={() => setActiveTab("following")}
          />
          <Tab
            label={`Arkadaşlar (${friends.length})`}
            active={activeTab === "friends"}
            onPress={() => setActiveTab("friends")}
          />
          <Tab
            label={`Takipçiler (${followers.length})`}
            active={activeTab === "followers"}
            onPress={() => setActiveTab("followers")}
          />
        </View>

        {/* LIST */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <FollowListItem
              user={item}
              actionLabel={
                activeTab === "following" || activeTab === "friends"
                  ? "Takibi Bırak"
                  : undefined
              }
              onAction={
                onUnfollow
                  ? () => onUnfollow(item.uid)
                  : undefined
              }
            />
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

/* ================= TAB BUTTON ================= */

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabActive]}>
        {label}
      </Text>
      {active && <View style={styles.tabLine} />}
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    fontSize: 22,
    fontWeight: "600",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    color: "#999",
  },
  tabActive: {
    color: "#000",
    fontWeight: "700",
  },
  tabLine: {
    marginTop: 6,
    height: 2,
    width: 28,
    backgroundColor: "#000",
    borderRadius: 1,
  },
});
