"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  preference: "system",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [preference, setPreference] = useState<ThemePreference>("system");

  const applyTheme = (resolvedTheme: Theme) => {
    setThemeState(resolvedTheme);
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.body?.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let savedPreference: ThemePreference = "system";
    try {
      const saved = localStorage.getItem("kopdes_theme") as ThemePreference | null;
      if (saved === "dark" || saved === "light" || saved === "system") savedPreference = saved;
    } catch {
      // Ignore localStorage errors in restricted environments
    }
    setPreference(savedPreference);
    applyTheme(savedPreference === "system" ? (media.matches ? "dark" : "light") : savedPreference);

    const handleSystemChange = (event: MediaQueryListEvent) => {
      let currentPreference: ThemePreference = "system";
      try {
        const current = localStorage.getItem("kopdes_theme");
        if (current === "light" || current === "dark" || current === "system") currentPreference = current;
      } catch {}
      if (currentPreference === "system") applyTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const setTheme = (newPreference: ThemePreference) => {
    setPreference(newPreference);
    try {
      localStorage.setItem("kopdes_theme", newPreference);
    } catch {}
    const resolved = newPreference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : newPreference;
    applyTheme(resolved);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
