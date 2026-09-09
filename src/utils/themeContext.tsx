import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "night" | "bright";

interface ThemeContextType {
  theme: ThemeMode;
  isBright: boolean;
  isNight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = "nse_jewellery_theme_mode";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "bright" || saved === "night") {
        return saved;
      }
    } catch {
      // fallback
    }
    return "night"; // default night mode
  });

  const applyThemeToDOM = (mode: ThemeMode) => {
    const root = document.documentElement;
    const body = document.body;
    if (mode === "bright") {
      root.classList.add("theme-bright");
      root.classList.remove("theme-night");
      body.classList.add("theme-bright");
      body.classList.remove("theme-night");
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#F8FAFC");
      }
    } else {
      root.classList.add("theme-night");
      root.classList.remove("theme-bright");
      body.classList.add("theme-night");
      body.classList.remove("theme-bright");
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#0B0E14");
      }
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "night" ? "bright" : "night"));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isBright: theme === "bright",
        isNight: theme === "night",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
