// src/(providers)/ThemeProvider.tsx
import {
    themeColorsByName,
    ThemeName,
} from "@/src/theme/colors";
import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

const DEFAULT_THEME: ThemeName = "light";

type ThemeContextValue = {
  theme: ThemeName;
  colors: typeof themeColorsByName[keyof typeof themeColorsByName];
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  function setTheme(name: ThemeName) {
    setThemeState(name);
  }

  function toggleTheme() {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const value = useMemo(
    () => ({
      theme,
      colors: themeColorsByName[theme],
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Hook
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}

// ⭐ Eksik olan buydu — Default export!
export default ThemeProvider;
