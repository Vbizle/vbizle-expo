const { FieldValue } = require("firebase-admin/firestore");

/**
 * SADECE WRITE YAPAR
 * READ YOK (supporterSnap DIŞARIDAN gelir)
 *
 * @param trx Firestore transaction
 * @param supporterRef users/{toUid}/topSupporters/{fromUid}
 * @param supporterSnap trx.get(supporterRef) sonucu
 * @param amount bağış miktarı
 * @param fromUserSnapshot { uid, username, avatar, badges } (opsiyonel cache)
 */
function updateTopSupporter(
  trx,
  supporterRef,
  supporterSnap,
  amount,
  fromUserSnapshot
) {
  const now = FieldValue.serverTimestamp();

  // 🔹 UI ana veriyi users/{uid} üzerinden okur
  // 🔹 burası sadece cache / snapshot (zorunlu değil)
  const payloadBase = {
    supporterUid: fromUserSnapshot?.uid || supporterRef.id,
    username: fromUserSnapshot?.username || "Kullanıcı",
    avatar: fromUserSnapshot?.avatar || null,

    // 🔹 fallback / cache (UI esas almaz)
    badges: fromUserSnapshot?.badges ?? null,

    lastDonationAt: now,
    updatedAt: now,
  };

  if (!supporterSnap.exists) {
    trx.set(supporterRef, {
      ...payloadBase,
      totalVb: Number(amount) || 0,
      createdAt: now,
    });
  } else {
    const prev = supporterSnap.data() || {};
    trx.update(supporterRef, {
      ...payloadBase,
      totalVb: (prev.totalVb ?? 0) + (Number(amount) || 0),
    });
  }
}

module.exports = { updateTopSupporter };
