// app/messages/[uid]/hooks/useDirectMessage.ts
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
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";

import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { uploadVoice } from "../utils/uploadVoice";

export function useDirectMessage(uid: string, router: any) {
  const [me, setMe] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [metaSeen, setMetaSeen] = useState<any>({});
  const [newMsg, setNewMsg] = useState("");

  const [convId, setConvId] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null);

  const [recordingPopup, setRecordingPopup] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  let typingTimeout: any;

  // =============================
  // 1) Me bilgisi
  // =============================
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

  // =============================
  // 2) Other User
  // =============================
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

  // =============================
  // 3) convId
  // =============================
  useEffect(() => {
    if (!me || !uid) return;

    const a = me.uid;
    const b = String(uid);
    setConvId(a < b ? `${a}_${b}` : `${b}_${a}`);
  }, [me, uid]);

  // =============================
  // 4) unread reset
  // =============================
  useEffect(() => {
    if (!convId || !me) return;

    setDoc(
      doc(db, "dm", convId, "meta", "info"),
      { unread: { [me.uid]: 0 } },
      { merge: true }
    );
  }, [convId, me]);

  // =============================
  // 5) messages listener
  // =============================
  useEffect(() => {
    if (!convId) return;

    const qRef = query(collection(db, "dm", convId, "messages"), orderBy("time"));

    const unsub = onSnapshot(qRef, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(arr);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 60);
    });

    return () => unsub();
  }, [convId]);

  // =============================
  // 6) meta listener (seen, typing)
  // =============================
  useEffect(() => {
    if (!convId) return;

    const metaRef = doc(db, "dm", convId, "meta", "info");

    const unsub = onSnapshot(metaRef, (snap) => {
      const d = snap.data();
      if (!d) return;

      if (d?.typing) setOtherTyping(!!d.typing[String(uid)]);
      if (d?.seen) setMetaSeen(d.seen);
    });

    return () => unsub();
  }, [convId]);

  // =============================
  // Typing
  // =============================
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

  // =============================
  // unread artırma
  // =============================
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

  // =============================
  // TEXT MESSAGE SEND
  // =============================
  async function sendMessage() {
    if (!newMsg.trim()) return;

    await addDoc(collection(db, "dm", convId, "messages"), {
      uid: me.uid,
      text: newMsg,
      time: serverTimestamp(),
    });

    await increaseUnread();

    setNewMsg("");
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  // =============================
  // IMAGE PICK
  // =============================
  async function sendImage() {
    setMenuOpen(false);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert("İzin gerekli", "Fotoğraf göndermek için izin ver.");
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.9,
    });

    if (res.canceled || !res.assets?.length) return;

    setPendingImage(res.assets[0].uri);
  }

  // =============================
  // IMAGE UPLOAD
  // =============================
  async function uploadPendingImage() {
    if (!pendingImage) return;

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
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
    }
  }

  // =============================
  // VOICE FINISH
  // =============================
  async function onFinishVoice({ uri, duration }) {
    setRecordingPopup({ uri, duration });
  }

  // =============================
  // VOICE SEND
  // =============================
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

  // =============================
  // DELETE MESSAGE
  // =============================
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

  const lastMyMessageId = messages.filter((m) => m.uid === me?.uid).at(-1)?.id;

  // =============================
  // OUT
  // =============================
  return {
    me,
    otherUser,
    messages,
    metaSeen,
    newMsg,
    setNewMsg,
    otherTyping,
    typing,
    pendingImage,
    setPendingImage,
    uploadPendingImage,
    imageModal,
    setImageModal,
    sendMessage,
    sendImage,
    deleteMessage,
    onFinishVoice,
    handleSendVoice,
    handleTyping,
    recordingPopup,
    setRecordingPopup,
    menuOpen,
    setMenuOpen,
    scrollRef,
    lastMyMessageId,
  };
}
