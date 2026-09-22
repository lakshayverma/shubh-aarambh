import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName =
  | 'royal-festive'
  | 'minimalist-slate'
  | 'pastel-luxury'
  | 'peacock-splendor'
  | 'sunlit-saffron';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  description: string;
  previewColors: [string, string, string]; // [primary, secondary, background]
  accentBadge: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'royal-festive',
    name: 'Royal Festive',
    description: 'Deep Maroon, Marigold Gold, and warm Ivory accents',
    previewColors: ['#7B1113', '#D97706', '#FCFBF7'],
    accentBadge: 'Traditional & Grand',
  },
  {
    id: 'minimalist-slate',
    name: 'Minimalist Slate',
    description: 'Crisp Slate Gray, Modern Indigo, and Pure White',
    previewColors: ['#1E293B', '#4F46E5', '#F8FAFC'],
    accentBadge: 'Clean & Contemporary',
  },
  {
    id: 'pastel-luxury',
    name: 'Pastel Luxury',
    description: 'Blush Rose, Rose Gold, and delicate Sage Green',
    previewColors: ['#BE185D', '#B45309', '#FDF9F8'],
    accentBadge: 'Soft & Romantic',
  },
  {
    id: 'peacock-splendor',
    name: 'Peacock Splendor',
    description: 'Royal Peacock Teal, Emerald, and Champagne Gold',
    previewColors: ['#0F766E', '#CA8A04', '#F4FBFB'],
    accentBadge: 'Vibrant & Majestic',
  },
  {
    id: 'sunlit-saffron',
    name: 'Sunlit Saffron',
    description: 'Warm Saffron, Terracotta, and Sandy Gold',
    previewColors: ['#C2410C', '#D97706', '#FFFDF9'],
    accentBadge: 'Auspicious & Warm',
  },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeConfig[];
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'vivah_planner_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return 'royal-festive';
  });

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const currentThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: THEMES,
        currentThemeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
