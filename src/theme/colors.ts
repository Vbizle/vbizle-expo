// src/theme/colors.ts

// 💠 DARK THEME (Koyu)
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

// 💠 LIGHT THEME (Açık)
export const lightColors = {
  background: "#FFFFFF",
  backgroundSoft: "#F3F4F6",
  card: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  text: "#111827",
  textMuted: "#6B7280",
  primary: "#2563EB",
  primarySoft: "#1D4ED8",
  accent: "#16A34A",
  danger: "#DC2626",
  inputBg: "#FFFFFF",
  inputBorder: "rgba(0,0,0,0.12)",
  bubbleMine: "#2563EB",
  bubbleOther: "#E5E7EB",
};

export type ThemeName = "dark" | "light";

// ❗ Burada tip hatasını çözüyoruz: darkColors'a sabitlemiyoruz.
// İki tema nesnesinin birleşimini otomatik türetiyoruz.
export type ThemeColors = typeof darkColors & typeof lightColors;

// ✔ Tam güvenli tema eşlemesi
export const themeColorsByName: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
