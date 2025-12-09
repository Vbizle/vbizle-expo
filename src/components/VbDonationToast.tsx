import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from "react-native";

type VbDonationToastProps = {
  visible: boolean;
  fromName: string;
  toName: string;
  fromAvatar?: string | null;
  amount: number;
  onHide?: () => void;
};

export default function VbDonationToast({
  visible,
  fromName,
  toName,
  fromAvatar,
  amount,
  onHide,
}: VbDonationToastProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      // hide anim
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -200,
          duration: 450,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
        onHide && onHide();
      });

      return;
    }

    setInternalVisible(true);

    // show anim
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // auto hide after 3 sec
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -200,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
        onHide && onHide();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!internalVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      {/* Avatar */}
      {fromAvatar ? (
        <Image source={{ uri: fromAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}

      {/* Text Content */}
      <View style={{ flexDirection: "column" }}>
        <Text style={styles.label}>Vb Bağışı</Text>

        <Text style={styles.textLine}>
          <Text style={styles.bold}>{fromName}</Text> →{" "}
          <Text style={styles.bold}>{toName}</Text> kişisine gönderdi
        </Text>

        <Text style={styles.amount}>+{amount} Vb ✨</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 160,
    left: 80,
    zIndex: 99999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.7)",
    backgroundColor: "rgba(37,99,235,0.15)",
    backdropFilter: "blur(10px)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: "rgba(59,130,246,0.2)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.4)",
  },
  label: {
    fontSize: 12,
    color: "rgba(191,219,254,0.8)",
    marginBottom: 1,
  },
  bold: {
    fontWeight: "bold",
    color: "white",
  },
  textLine: {
    fontSize: 13,
    color: "white",
    marginBottom: 2,
  },
  amount: {
    fontSize: 20,
    color: "#facc15",
    fontWeight: "800",
  },
});
