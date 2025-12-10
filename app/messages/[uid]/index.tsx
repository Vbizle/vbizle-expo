// test auto push disabled
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadVoice } from "./(utils)/uploadVoice";

import { auth, db, storage } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { useUi } from "../../../src/(providers)/UiProvider";

import DmUserStatusHeader from "./components/DmUserStatusHeader";
import VoicePreviewModal from "./components/VoicePreviewModal";

// YENİ COMPONENTLER
import ImageModals from "./components/ImageModals";
import MessagesList from "./components/MessagesList";
import SendBar from "./components/SendBar";

export default function DirectMessagePage() {
  const router = useRouter();
  const { uid } = useLocalSearchParams();
  const { setActiveDM } = useUi();

  const [me, setMe] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");

  const [convId, setConvId] = useState("");
  const [metaSeen, setMetaSeen] = useState({});

  const scrollRef = useRef<ScrollView>(null);

  const [recordingPopup, setRecordingPopup] = useState<any>(null);

  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  let typingTimeout: any;

  useFocusEffect(
    React.useCallback(() => {
      if (uid) setActiveDM(String(uid));
      return () => setActiveDM(null);
    }, [uid])
  );

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return router.push("/login");

      const snap = await getDoc(doc(db, "users", u.uid));
      setMe({
        uid: u.uid,
        name: snap.data()?.username,
        avatar: snap.data()?.avatar || "",
      });
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;

    async function load() {
      const snap = await getDoc(doc(db, "users", String(uid)));
      if (snap.exists()) {
        const d = snap.data();
        setOtherUser({
          uid,
          name: d.username,
          avatar: d.avatar || "",
          online: d.online ?? false,
          lastSeen: d.lastSeen || null,
        });
      }
    }
    load();
  }, [uid]);

  useEffect(() => {
    if (!me || !uid) return;
    const a = me.uid;
    const b = String(uid);
    setConvId(a < b ? `${a}_${b}` : `${b}_${a}`);
  }, [me, uid]);

  useEffect(() => {
    if (!convId || !me) return;
    setDoc(
      doc(db, "dm", convId, "meta", "info"),
      { unread: { [me.uid]: 0 } },
      { merge: true }
    );
  }, [convId, me]);

  useEffect(() => {
    if (!convId) return;

    const qRef = query(collection(db, "dm", convId, "messages"), orderBy("time"));

    const unsub = onSnapshot(qRef, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(arr);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 80);
    });

    return () => unsub();
  }, [convId]);

  useEffect(() => {
    if (!convId) return;

    const refMeta = doc(db, "dm", convId, "meta", "info");

    const unsub = onSnapshot(refMeta, (snap) => {
      const d = snap.data();
      if (!d) return;

      if (d?.typing) setOtherTyping(!!d.typing[String(uid)]);
      if (d?.seen) setMetaSeen(d.seen);
    });

    return () => unsub();
  }, [convId, uid]);

  function handleTyping() {
    if (!convId || !me) return;

    if (!typing) {
      setTyping(true);
      setDoc(
        doc(db, "dm", convId, "meta", "info"),
        { typing: { [me.uid]: true } },
        { merge: true }
      );
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTyping(false);
      setDoc(
        doc(db, "dm", convId, "meta", "info"),
        { typing: { [me.uid]: false } },
        { merge: true }
      );
    }, 700);
  }

  async function increaseUnread() {
    const metaRef = doc(db, "dm", convId, "meta", "info");
    const snap = await getDoc(metaRef);
    const d = snap.data() || {};

    await updateDoc(metaRef, {
      unread: {
        [String(uid)]: (d.unread?.[String(uid)] || 0) + 1,
        [me.uid]: 0,
      },
      time: serverTimestamp(),
      lastSender: me.uid,
    });
  }

  async function sendMessage() {
    if (!newMsg.trim()) return;

    await addDoc(collection(db, "dm", convId, "messages"), {
      uid: me.uid,
      text: newMsg,
      time: serverTimestamp(),
    });

    await increaseUnread();

    setNewMsg("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  async function sendImage() {
    try {
      setMenuOpen(false);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted)
        return Alert.alert("İzin gerekli", "Fotoğraf göndermek için izin ver.");

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.9,
      });

      if (res.canceled || !res.assets?.length) return;

      setPendingImage(res.assets[0].uri);
    } catch (err) {
      console.log("DM Image Error:", err);
    }
  }

  async function uploadPendingImage() {
    if (!pendingImage || !convId || !me) return;

    try {
      const blob = await (await fetch(pendingImage)).blob();

      const imgRef = ref(storage, `dm/${convId}/${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(imgRef, blob, {
        contentType: "image/jpeg",
      });

      uploadTask.on(
        "state_changed",
        undefined,
        (error) => console.log("UPLOAD ERR:", error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "dm", convId, "messages"), {
            uid: me.uid,
            imgUrl: url,
            time: serverTimestamp(),
          });

          await increaseUnread();

          setPendingImage(null);
        }
      );
    } catch (e) {
      console.log("UPLOAD ERROR:", e);
    }
  }

  async function onFinishVoice({ uri, duration }) {
    setRecordingPopup({ uri, duration });
  }

  async function handleSendVoice() {
    if (!recordingPopup) return;

    const url = await uploadVoice(recordingPopup.uri, convId);

    await addDoc(collection(db, "dm", convId, "messages"), {
      uid: me.uid,
      voiceUrl: url,
      duration: recordingPopup.duration,
      time: serverTimestamp(),
    });

    await increaseUnread();

    setRecordingPopup(null);
  }

  async function deleteMessage(id: string) {
    Alert.alert("Mesaj silinsin mi?", "", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "dm", convId, "messages", id));
        },
      },
    ]);
  }

  if (!me || !otherUser) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#1C1C1E" }}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  const lastMyMessageId = messages.filter((msg) => msg.uid === me.uid).at(-1)?.id;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F2F2F5" barStyle="dark-content" />

        {/* HEADER */}
        <DmUserStatusHeader
          styles={styles}
          router={router}
          otherUser={otherUser}
          otherTyping={otherTyping}
          convId={convId}
          me={me}
          messages={messages}
          setMetaSeen={setMetaSeen}
        />

        {/* SES ÖNİZLEME MODALI */}
        <VoicePreviewModal
          data={recordingPopup}
          onCancel={() => setRecordingPopup(null)}
          onSend={handleSendVoice}
        />

        {/* RESİM MODALLARI */}
        <ImageModals
          pendingImage={pendingImage}
          setPendingImage={setPendingImage}
          uploadPendingImage={uploadPendingImage}
          imageModal={imageModal}
          setImageModal={setImageModal}
          styles={styles}
        />

        {/* MESAJ LİSTESİ */}
        <MessagesList
          messages={messages}
          me={me}
          otherUser={otherUser}
          metaSeen={metaSeen}
          lastMyMessageId={lastMyMessageId}
          deleteMessage={deleteMessage}
          setImageModal={setImageModal}
          scrollRef={scrollRef}
          styles={styles}
        />

        {/* ALT SEND BAR */}
        <SendBar
          newMsg={newMsg}
          setNewMsg={setNewMsg}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          sendMessage={sendMessage}
          sendImage={sendImage}
          handleTyping={handleTyping}
          onFinishVoice={onFinishVoice}
          styles={styles}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  backBtn: { fontSize: 24, color: "#1C1C1E" },
  avatar: { width: 45, height: 45, borderRadius: 999 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: { fontSize: 18, color: "#1C1C1E", fontWeight: "600" },
  onlineText: { fontSize: 12, color: "#16A34A" },
  typing: { fontSize: 12, color: "#2563EB" },
  msgList: { padding: 10, paddingBottom: 2 },
  bubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "75%",
    marginBottom: 3,
  },
  bubbleText: { color: "#1C1C1E" },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#88b4dd67",
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E8E8EB",
    borderBottomLeftRadius: 0,
  },
  imgBubble: { marginBottom: 10 },
  msgImg: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  right: { alignSelf: "flex-end" },
  left: { alignSelf: "flex-start" },
  seenText: {
    color: "#6E6E73",
    fontSize: 11,
    marginLeft: "auto",
    marginRight: 4,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 50,
  },
  modalImg: { width: "90%", height: "90%" },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    marginRight: 10,
  },
  cancelText: { color: "#1C1C1E", fontSize: 15 },
  sendImgBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },
  sendImgText: { color: "#fff", fontSize: 15 },
  sendBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: "#F2F2F5",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: "#FAFAFC",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginHorizontal: 1,
    color: "#1C1C1E",
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    height: 37,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sendAirplane: {
    color: "#fff",
    fontSize: 10,
  },
  hamburgerBtn: {
    width: 42,
    height: 32,
    backgroundColor: "#FAFAFC",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  popupMenu: {
    position: "absolute",
    bottom: 50,
    left: 0,
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 10,
    width: 150,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    zIndex: 9999,
  },
  popupItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  popupText: {
    color: "#1C1C1E",
    fontSize: 15,
  },
});
