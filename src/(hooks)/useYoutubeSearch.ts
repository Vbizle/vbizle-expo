"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

const YT_API_KEY = "AIzaSyBZlMpwLz7gTf5dkM8lN2wFdtxqwrQibmw";

export function useYoutubeSearch(roomId: string, user: any, room: any) {
  const [ytQuery, setYtQuery] = useState("");
  const [ytResults, setYtResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* ---------------------------------------------------------
     🔍 YOUTUBE SEARCH (Hata Yakalama + Encode + Güvenlik)
  --------------------------------------------------------- */
  async function searchYoutube() {
    try {
      if (user?.uid !== room?.ownerId) return;          // sadece host
      if (!ytQuery.trim()) return;

      setSearchLoading(true);

      // Türkçe karakter sorunlarını engeller
      const encoded = encodeURIComponent(ytQuery.trim());

      const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&maxResults=10&q=${encoded}&key=${YT_API_KEY}`;

      const res = await fetch(url);

      // API DOWN veya RATE LIMIT kontrolü
      if (!res.ok) {
        console.warn("❌ YouTube API Yanıtı Hatalı →", await res.text());
        setYtResults([]);
        setSearchLoading(false);
        return;
      }

      const data = await res.json();

      // items boş veya undefined ise koruma
      setYtResults(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("🔥 YouTube Arama Hatası:", err);
      setYtResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  /* ---------------------------------------------------------
     🎬 HOST → Video seçimi
  --------------------------------------------------------- */
  async function selectVideo(videoId: string) {
    if (user?.uid !== room?.ownerId) return;

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        youtube: videoId,
        videoTime: 0,
        playerState: 2,
        lastUpdate: serverTimestamp(),
      });
    } catch (err) {
      console.error("🔥 Video güncelleme hatası:", err);
    }
  }

  return {
    ytQuery,
    setYtQuery,
    ytResults,
    searchLoading,
    searchYoutube,
    selectVideo,
  };
}
