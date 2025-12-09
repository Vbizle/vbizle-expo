// src/theme/colors.ts

// 💠 DARK THEME (Koyu) — Aynı kalıyor
export const darkColors = {
  background: "#000000",
  backgroundSoft: "#050505",
  card: "#111827",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  primary: "#2563EB",
  primarySoft: "#1D4ED8",
  accent: "#22C55E",
  danger: "#EF4444",
  inputBg: "#111827",
  inputBorder: "rgba(255,255,255,0.16)",
  bubbleMine: "#2563EB",
  bubbleOther: "#1F2933",
};

// 💠 LIGHT THEME (Mat / Soft / Premium 2.0)
export const lightColors = {
  // Daha mat, daha modern soft-white
  background: "#EDEDF0",        // Ana arkaplan → mat gri-beyaz
  backgroundSoft: "#F2F2F5",    // Header / list alanları için soft gri

  // Kartlar daha soft oldu
  card: "#FAFAFC",

  border: "rgba(0,0,0,0.05)",   // Çok hafif premium border

  // Yazılar
  text: "#1C1C1E",
  textMuted: "#6E6E73",

  // Ana renkler
  primary: "#2563EB",
  primarySoft: "#1D4ED8",

  accent: "#22C55E",
  danger: "#DC2626",

  // Input alanları
  inputBg: "#FAFAFC",
  inputBorder: "rgba(0,0,0,0.08)",

  // Mesaj balonları
  bubbleMine: "#2563EB",
  bubbleOther: "#E3E3E6",
};

export type ThemeName = "dark" | "light";

export type ThemeColors = typeof darkColors & typeof lightColors;

export const themeColorsByName: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
