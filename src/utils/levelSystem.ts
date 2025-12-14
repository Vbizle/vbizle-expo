// src/utils/levelSystem.ts

// ==========================================================
// LEVEL BİLGİ TİPİ (DEĞİŞMEDİ)
// ==========================================================
export type LevelInfo = {
  level: number;
  label: string;
  color: string;
};

// ==========================================================
// LEVEL TABLOSU (1–51) — BAĞIŞA BAĞLI
// vbTotalSent kullanılır
// ==========================================================
const LEVEL_TABLE = [
  { level: 1, min: 50 },
  { level: 2, min: 500 },
  { level: 3, min: 1000 },
  { level: 4, min: 2500 },
  { level: 5, min: 4000 },
  { level: 6, min: 5000 },
  { level: 7, min: 6000 },
  { level: 8, min: 7500 },
  { level: 9, min: 9000 },
  { level: 10, min: 10000 },
  { level: 11, min: 12000 },
  { level: 12, min: 14000 },
  { level: 13, min: 16000 },
  { level: 14, min: 18000 },
  { level: 15, min: 19000 },
  { level: 16, min: 20000 },
  { level: 17, min: 22000 },
  { level: 18, min: 25000 },
  { level: 19, min: 27500 },
  { level: 20, min: 30000 },
  { level: 21, min: 35000 },
  { level: 22, min: 40000 },
  { level: 23, min: 45000 },
  { level: 24, min: 50000 },
  { level: 25, min: 55000 },

  { level: 26, min: 60000 },
  { level: 27, min: 65000 },
  { level: 28, min: 70000 },
  { level: 29, min: 85000 },
  { level: 30, min: 100000 },
  { level: 31, min: 110000 },
  { level: 32, min: 115000 },
  { level: 33, min: 120000 },
  { level: 34, min: 125000 },
  { level: 35, min: 130000 },
  { level: 36, min: 150000 },
  { level: 37, min: 175000 },
  { level: 38, min: 200000 },
  { level: 39, min: 250000 },
  { level: 40, min: 300000 },
  { level: 41, min: 400000 },
  { level: 42, min: 450000 },
  { level: 43, min: 500000 },
  { level: 44, min: 750000 },
  { level: 45, min: 1000000 },
  { level: 46, min: 1050000 },
  { level: 47, min: 1100000 },
  { level: 48, min: 1200000 },
  { level: 49, min: 1300000 },
  { level: 50, min: 1500000 },
  { level: 51, min: 2000000 },
];

// ==========================================================
// LEVEL HESAPLAMA (GERİYE DÖNÜK UYUMLU)
// ==========================================================
export function getLevelInfo(
  vbTotalSent: number | undefined | null
): LevelInfo {
  const score = vbTotalSent ?? 0;

  let currentLevel = 0;

  for (const item of LEVEL_TABLE) {
    if (score >= item.min) {
      currentLevel = item.level;
    } else {
      break;
    }
  }

  return {
    level: currentLevel,
    label: `Lv${currentLevel}`,
    color: getLevelColor(currentLevel),
  };
}

// ==========================================================
// LEVEL METALİK PREMIUM RENKLER
// 1–14 : Temiz mavi tonlar
// 15+  : Karışık / çift metalik premium
// ==========================================================
export function getLevelColor(level: number): string {
  if (level === 0) return "#9CA3AF"; // Gri

  // 🔹 1–5 (soft metalic blue)
  if (level <= 5) return "#9DBCF9";

  // 🔹 6–10 (premium blue)
  if (level <= 10) return "#6FA8F7";

  // 🔹 11–15 (royal blue)
  if (level <= 15) return "#3F83F8";

  // 🔹 16–20 (deep royal)
  if (level <= 20) return "#2457D6";

  // 🔹 21–30 (mavi + mor metalik)
  if (level <= 30) return "#5B4BDB";

  // 🔹 31–40 (royal mor)
  if (level <= 40) return "#6D28D9";

  // 🔹 41–50 (premium violet)
  if (level <= 50) return "#7C3AED";

  // 🔹 51 (ULTIMATE)
  return "#A855F7";
}
