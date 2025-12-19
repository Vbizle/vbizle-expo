/**
 * Tüm sistem mesaj metinleri burada
 * Koddan ve business logic'ten ayrıdır
 */

module.exports = {
  vbLoaded: (amount) => ({
    category: "wallet",
    type: "vb_loaded",
   title: "🎉 Tebrikler! VB Yüklemeniz Başarılı.",
body: `Hesabınıza 💰 ${amount.toLocaleString("tr-TR")} VB yüklendi.`,
    meta: { amount },
  }),

  svpUp: (level) => ({
    category: "svp",
    type: "svp_up",
    title: `SVP${level} Oldunuz`,
    body:
      "Tebrikler! Yeni SVP seviyenizin ayrıcalıklarını doya doya çıkarın.",
    meta: { level },
    pinned: true,
  }),

  svpWarning: () => ({
    category: "svp",
    type: "svp_warning",
    title: "SVP Seviyen Risk Altında",
    body:
      "SVP seviyeni korumak için 3 günün kaldı. Yükleme yapmazsan bir kademe düşecektir.",
    pinned: true,
  }),

  adminNotice: (title, body) => ({
    category: "announcement",
    type: "admin_notice",
    title,
    body,
    pinned: true,
  }),
  svpLevelUp: (level) => ({
  category: "svp",
  type: "svp_level_up",
  title: `SVP${level} Seviyesine Ulaştınız`,
  body:
    "Tebrikler! Yeni SVP seviyenizin tüm ayrıcalıklarından faydalanabilirsiniz.",
  meta: { level },
  pinned: true,
}),

svpExpiryWarning: (daysLeft) => ({
  category: "svp",
  type: "svp_expiry_warning",
  title:
    daysLeft === 1
      ? "SVP Seviyen Bugün Sona Eriyor"
      : `SVP Seviyen İçin ${daysLeft} Gün Kaldı`,
  body:
    daysLeft === 1
      ? "SVP seviyeni korumak için bugün yükleme yapmalısın."
      : `SVP seviyeni korumak için ${daysLeft} günün kaldı.`,
  meta: { daysLeft },
  pinned: true,
}),

};

