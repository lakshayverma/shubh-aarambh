# Theming & Visual Styling Module

> **Path**: `src/context/ThemeContext.tsx` & `src/index.css`  
> **Classification**: Global Styling & Dynamic CSS Theme Engine  
> **Dependencies**: React Context, Tailwind CSS  
> **Parent Specification**: [`DESIGN.md` Section 3](../../DESIGN.md)

---

## 1. Module Overview

The Theming System injects dynamic CSS custom properties into the `:root` and `[data-theme]` attributes of the document, enabling instantaneous switching between curated cultural palettes and per-wedding custom color schemes.

```
src/
├── context/
│   └── ThemeContext.tsx    # ThemeProvider, useTheme hook, and 5 curated cultural themes
└── index.css               # Tailwind directives and CSS theme custom properties
```

---

## 2. The 5 Curated Cultural Palettes

Configured in `src/context/ThemeContext.tsx`:

1. **Royal Festive** (`royal-festive`): Deep Crimson Maroon (`#7B1113`), Marigold Gold (`#D97706`), Warm Ivory (`#FCFBF7`). Traditional & Grand.
2. **Minimalist Slate** (`minimalist-slate`): Modern Charcoal (`#1E293B`), Indigo (`#4F46E5`), Pure White (`#F8FAFC`). Clean & Contemporary.
3. **Pastel Luxury** (`pastel-luxury`): Blush Rose (`#BE185D`), Rose Gold (`#B45309`), Sage Green (`#FDF9F8`). Soft & Romantic.
4. **Peacock Splendor** (`peacock-splendor`): Royal Peacock Teal (`#0F766E`), Emerald, Champagne Gold (`#CA8A04`). Vibrant & Majestic.
5. **Sunlit Saffron** (`sunlit-saffron`): Warm Saffron (`#C2410C`), Terracotta, Sandalwood (`#D97706`). Auspicious & Warm.

---

## 3. Dynamic CSS Variables

The application references semantic CSS variables rather than hardcoded Tailwind color names:

- `bg-theme-background`: Canvas surface
- `bg-theme-card`: Card and modal background
- `border-theme-border`: Card and divider borders
- `text-theme-text-main`: Primary high-contrast text
- `text-theme-text-muted`: Secondary subtitles and label text
- `bg-theme-primary`, `text-theme-primary`: Primary brand accents and headers
- `bg-theme-secondary`, `text-theme-secondary`: Secondary badges and highlight chips

---

## 4. Per-Wedding Custom Color Overrides

In `WeddingSettingsModal.tsx`, planners can configure custom colors for a specific wedding:
- When a wedding with `customColors` is selected, `WeddingContext` dynamically writes inline CSS variables onto the root container, ensuring that wedding-specific invitations and themes reflect the couple's bespoke stationery.
