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

// 💠 LIGHT THEME (YENİ — Mat / Soft / Premium)
export const lightColors = {
  // Daha soft, daha doğal beyaz (iOS style)
  background: "#F7F7F9",       // Ana arkaplan → Saf beyaz değil, mat gri-beyaz
  backgroundSoft: "#EFEFF2",   // Sekmeler / listeler için yumuşak gri ton
  card: "#FFFFFF",             // Kartlar hafif temiz beyaz — kontrast güzel
  border: "rgba(0,0,0,0.06)",  // Daha hafif border — premium his

  // Yazılar
  text: "#1C1C1E",             // iOS koyu gri
  textMuted: "#6E6E73",        // Soft muted gri — göz yormaz

  // Ana renkler
  primary: "#2563EB",          // Vbizle için değişmedi
  primarySoft: "#1D4ED8",

  // Accent (daha soft yeşil)
  accent: "#22C55E",

  danger: "#DC2626",

  // Input alanları
  inputBg: "#FFFFFF",          // Temiz ama çok parlak olmayan
  inputBorder: "rgba(0,0,0,0.10)",

  // Mesaj balonları
  bubbleMine: "#2563EB",
  bubbleOther: "#E8E8EB",      // Daha soft gri balon
};

export type ThemeName = "dark" | "light";

// Tipler
export type ThemeColors = typeof darkColors & typeof lightColors;

// ✔ Tema eşlemesi
export const themeColorsByName: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
