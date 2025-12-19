import React from "react";
import { Text, View } from "react-native";

export default function SystemMessageItem({ item }: any) {
  const isVB = item.type === "VB_LOAD";

  return (
    <View
      style={{
        backgroundColor: "#F8FAFC", // 🌿 soft açık gri
        padding: 14,
        borderRadius: 14,
        marginBottom: 12,

        // 🔹 ağır border yerine soft gölge
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      {/* BAŞLIK SATIRI */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#0F172A",
            marginRight: 8,
          }}
        >
          {item.title}
        </Text>

        {isVB && (
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: "#EAB308", // 🟡 soft gold
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#422006",
              }}
            >
              VB
            </Text>
          </View>
        )}
      </View>

      {/* MESAJ */}
      <Text
        style={{
          fontSize: 13,
          color: "#475569", // 🧠 göz yormayan gri
          lineHeight: 18,
        }}
      >
        {item.body}
      </Text>
    </View>
  );
}
