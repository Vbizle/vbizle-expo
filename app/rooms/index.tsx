import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "rooms"), where("active", "==", true));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setRooms(list);
    });

    return () => unsub();
  }, []);

  const renderRoom = ({ item }) => (
    <View style={styles.roomBox}>
      <Text style={styles.roomName}>{item.name}</Text>

      <Text style={styles.onlineText}>
        Aktif Kullanıcı: {item.onlineCount ?? 0}
      </Text>

      <TouchableOpacity
        style={styles.joinBtn}
        onPress={() => router.push(`/rooms/${item.id}`)}
      >
        <Text style={styles.joinText}>Odaya Gir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Odalar</Text>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 16,
  },
  header: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  roomBox: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 14,
  },
  roomName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  onlineText: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  joinBtn: {
    marginTop: 14,
    backgroundColor: "#2f6dff",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  joinText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
