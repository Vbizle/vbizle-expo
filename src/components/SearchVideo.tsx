import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function SearchVideo({
  visible,
  ytQuery,
  setYtQuery,
  ytResults,
  searchYoutube,
  selectVideo,
  searchLoading,
  onClose,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Video Ara</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* SEARCH INPUT */}
          <TextInput
            placeholder="Video ara..."
            placeholderTextColor="#bbb"
            style={styles.input}
            value={ytQuery}
            onChangeText={setYtQuery}
          />

          {/* SEARCH BUTTON */}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={searchYoutube}
            disabled={searchLoading}
          >
            <Text style={styles.searchBtnText}>
              {searchLoading ? "Aranıyor..." : "Ara"}
            </Text>
          </TouchableOpacity>

          {/* RESULTS */}
          <ScrollView style={styles.results}>
            {ytResults.length === 0 && (
              <Text style={styles.noResult}>
                Arama sonucu bulunamadı...
              </Text>
            )}

            {ytResults.map((v) => {
              const videoId = v?.id?.videoId;

              return (
                <TouchableOpacity
                  key={videoId || v.etag}
                  style={styles.item}
                  onPress={() => videoId && selectVideo(videoId)}
                >
                  <Image
                    source={{
                      uri: v.snippet?.thumbnails?.default?.url,
                    }}
                    style={styles.thumbnail}
                  />

                  <Text numberOfLines={2} style={styles.videoTitle}>
                    {v.snippet?.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* -----------------------------------------
   STYLE
----------------------------------------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 10,
  },

  box: {
    width: 300,
    maxWidth: "90%",
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },

  closeBtn: {
    color: "#ccc",
    fontSize: 22,
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  searchBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  searchBtnText: {
    color: "white",
    fontWeight: "600",
  },

  results: {
    maxHeight: 300,
    marginTop: 14,
  },

  noResult: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },

  thumbnail: {
    width: 70,
    height: 50,
    borderRadius: 6,
  },

  videoTitle: {
    flex: 1,
    color: "white",
    fontSize: 13,
  },
});
