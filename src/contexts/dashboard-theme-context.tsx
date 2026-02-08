"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface DashboardThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  mounted: boolean;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | null>(null);

const STORAGE_KEY = "dashboard-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && ["system", "light", "dark"].includes(stored)) {
      setThemeState(stored);
      setResolvedTheme(resolveTheme(stored));
    } else {
      setResolvedTheme(resolveTheme("system"));
    }
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  return (
    <DashboardThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (context === null) {
    throw new Error("useDashboardTheme must be used within a DashboardThemeProvider");
  }
  return context;
}
