// src/utils/vipSystem.ts

// ==========================================================
// VIP seviye aralıkları (YÜKLEMEYE BAĞLI)
//
// VIP0 :    0        – 999
// VIP1 :    1.000    – 20.000
// VIP2 :   20.001    – 50.000
// VIP3 :   50.001    – 75.000
// VIP4 :   75.001    – 125.000
// VIP5 :  125.001    – 200.000
// VIP6 :  200.001    – 300.000
// VIP7 :  300.001    – 450.000
// VIP8 :  450.001    – 650.000
// VIP9 :  650.001+
// ==========================================================

export function getVipRank(vipScore: number = 0): number {
  if (vipScore >= 350001) return 9;
  if (vipScore >= 250001) return 8;
  if (vipScore >= 150001) return 7;
  if (vipScore >= 75001) return 6;
  if (vipScore >= 30001) return 5;
  if (vipScore >= 15001) return 4;
  if (vipScore >= 10001) return 3;
  if (vipScore >= 5001) return 2;
  if (vipScore >= 100) return 1;
  return 0;
}

// ==========================================================
// VIP seviyesine göre PREMIUM METALİK renkler
// VIP1–VIP5: MEVCUT RENKLER (DEĞİŞTİRİLMEDİ)
// VIP6–VIP9: ÜST SEVİYE METALİK / PRESTİJ
// ==========================================================

export function getVipColor(rank: number): string {
  switch (rank) {
    // --- MEVCUT (DOKUNULMADI) ---
    case 1:
      return "#ffda74ff"; // Açık Altın (VIP1)
    case 2:
      return "#FFD24C"; // Zengin Altın (VIP2)
    case 3:
      return "#71b935ff"; // Derin Altın / Mavi (VIP3)
    case 4:
      return "#8000ffff"; // Metalik Mor-Altın (VIP4)
    case 5:
      return "#ee5e0aff"; // Premium Metalik Gold (VIP5)

    // --- YENİ ÜST SEVİYELER ---
    case 6:
      return "#a71717ff"; // Neon Cyan Metalik (VIP6)
    case 7:
      return "#7917a7ff"; // Ateş Turuncu Metalik (VIP7)
    case 8:
      return "#921777ff"; // Royal Gold (VIP8)
    case 9:
      return "#071d80ff"; // Dark Royal Premium (VIP9)

    default:
      return "#9CA3AF"; // Gri (VIP0)
  }
}

// ==========================================================
// VIP etiketi
// ==========================================================

export function getVipLabel(rank: number): string {
  if (rank <= 0) return "👑 VIP0";
  return `👑 VIP${rank}`;
}

// ==========================================================
// TEK NOKTADAN KULLANIM (ÖNERİLEN)
// ==========================================================

export function getVipInfo(vipScore: number = 0) {
  const rank = getVipRank(vipScore);

  return {
    rank,
    label: getVipLabel(rank),
    color: getVipColor(rank),
  };
}
