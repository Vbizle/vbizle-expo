// src/services/walletEngine.ts
import { auth } from "@/firebase/firebaseConfig";

const PROJECT_ID = "vbizle-f018f";
const REGION = "us-central1";
const BASE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

/* ============================================================
   GENEL API CALL — onRequest için
============================================================ */
async function callApi(fnName: string, body: any) {
  const user = auth.currentUser;
  if (!user) throw new Error("Giriş yapılmamış.");

  const token = await user.getIdToken();

  const url = `${BASE_URL}/${fnName}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`Sunucu hatası: HTTP ${res.status}`);
  }

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error ||
      json?.message ||
      `Fonksiyon hatası: HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

/* ============================================================
   WALLET ENGINE — onRequest uyumlu
============================================================ */
class WalletEngine {
  // 1) Kullanıcıdan kullanıcıya VB gönderme
  async sendVb({ toUid, amount, roomId = null }) {
    return await callApi("VbGonder", { toUid, amount, roomId });
  }

  // 2) Odaya bağış
  async donateToRoom({ roomId, amount }) {
    return await callApi("VbBagis", { roomId, amount });
  }

  // 3) Admin → UID ile yükleme
  async adminLoad({ targetUid, amount, source }) {
    return await callApi("VbAdmin", { targetUid, amount, source });
  }

  // 4) Admin → VB-ID ile yükleme  (DÜZELTİLDİ — source eklendi)
  async adminLoadByVbId({ toVbId, amount, source }) {
    return await callApi("VbAdminByVbId", { toVbId, amount, source });
  }

  // 5) Bağış bar aç/kapat
  async toggleDonationBar(roomId) {
    return await callApi("VbBagisBarToggle", { roomId });
  }

  // 6) Admin rolü ver/al
  async setAdminRole({ vbId, makeAdmin }) {
    return await callApi("VbSetRole", {
      targetVbId: vbId,
      role: makeAdmin ? "admin" : "user",
    });
  }
}

export const walletEngine = new WalletEngine();
