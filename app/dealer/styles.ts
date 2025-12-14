import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
  flexDirection: "column",   // 🔴 EN KRİTİK SATIR
  alignItems: "center",
  marginBottom: 12,
},
  tabs: { flexDirection: "row" },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
  },
  tabActive: {
    backgroundColor: "#dcd0ff",
  },
  dealerBalance: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 1,
    color: "#7c3aed",
     marginTop: 15,
  },
  input: {
    backgroundColor: "#ECECEC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "700" },
  role: { fontSize: 12, color: "#666" },
  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  btnText: { color: "white", fontWeight: "700" },
  historyTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  logItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  logAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  logName: { fontSize: 14, fontWeight: "600" },
  logAmount: { color: "#16a34a", fontWeight: "700" },
  logDate: { fontSize: 11, color: "#666" },
  moreBtn: { alignSelf: "center", marginTop: 10 },
  moreText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
  modalBox: { flex: 1, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  closeBtn: {
    backgroundColor: "#b91c1c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeText: { color: "white", fontWeight: "700" },
  dateBtn: {
  backgroundColor: "#ECECEC",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 8,
},

dateText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#444",
},

});

export default styles;
