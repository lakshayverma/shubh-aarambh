import React, { useState } from 'react';
import { Wedding, WeddingCustomColors } from '../db/schema';
import { useWedding } from '../context/WeddingContext';
import {
  Settings,
  Palette,
  Sparkles,
  Check,
  X,
  Heart,
  Save,
  RefreshCw,
} from 'lucide-react';

interface WeddingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: Wedding;
}

const COLOR_PRESETS: { name: string; colors: WeddingCustomColors }[] = [
  {
    name: 'Royal Rajputana (Crimson & Gold)',
    colors: {
      primary: '#7B1113',
      secondary: '#D97706',
      accent: '#B45309',
      background: '#FCFBF7',
      card: '#FFFFFF',
      textMain: '#271E1D',
    },
  },
  {
    name: 'Peacock Grandeur (Teal & Amber)',
    colors: {
      primary: '#0F766E',
      secondary: '#CA8A04',
      accent: '#0D9488',
      background: '#F4FBFB',
      card: '#FFFFFF',
      textMain: '#132D2B',
    },
  },
  {
    name: 'Saffron Sunset (Terracotta & Gold)',
    colors: {
      primary: '#C2410C',
      secondary: '#D97706',
      accent: '#EA580C',
      background: '#FFFDF9',
      card: '#FFFFFF',
      textMain: '#382116',
    },
  },
  {
    name: 'Pastel Romance (Blush Pink & Rose Gold)',
    colors: {
      primary: '#BE185D',
      secondary: '#B45309',
      accent: '#E11D48',
      background: '#FDF9F8',
      card: '#FFFFFF',
      textMain: '#37282F',
    },
  },
  {
    name: 'Modern Sapphire (Midnight Blue & Indigo)',
    colors: {
      primary: '#1E3A8A',
      secondary: '#4F46E5',
      accent: '#2563EB',
      background: '#F8FAFC',
      card: '#FFFFFF',
      textMain: '#0F172A',
    },
  },
];

export const WeddingSettingsModal: React.FC<WeddingSettingsModalProps> = ({
  isOpen,
  onClose,
  wedding,
}) => {
  const { updateWedding } = useWedding();

  // Pair Terminology
  const [brideSideTerm, setBrideSideTerm] = useState(
    wedding.brideSideTerm || "Bride's Side (Ladkiwale)"
  );
  const [groomSideTerm, setGroomSideTerm] = useState(
    wedding.groomSideTerm || "Groom's Side (Ladkewale)"
  );
  const [brideSideName, setBrideSideName] = useState(wedding.brideSideName || '');
  const [groomSideName, setGroomSideName] = useState(wedding.groomSideName || '');

  // Custom Colors
  const [primaryColor, setPrimaryColor] = useState(
    wedding.customColors?.primary || '#7B1113'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    wedding.customColors?.secondary || '#D97706'
  );
  const [accentColor, setAccentColor] = useState(
    wedding.customColors?.accent || '#B45309'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    wedding.customColors?.background || '#FCFBF7'
  );

  if (!isOpen) return null;

  const handleApplyPreset = (preset: { name: string; colors: WeddingCustomColors }) => {
    setPrimaryColor(preset.colors.primary);
    setSecondaryColor(preset.colors.secondary);
    setAccentColor(preset.colors.accent);
    setBackgroundColor(preset.colors.background || '#FCFBF7');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const customColors: WeddingCustomColors = {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: backgroundColor,
      card: '#FFFFFF',
      textMain: '#271E1D',
    };

    await updateWedding({
      ...wedding,
      brideSideTerm: brideSideTerm.trim(),
      groomSideTerm: groomSideTerm.trim(),
      brideSideName: brideSideName.trim(),
      groomSideName: groomSideName.trim(),
      customColors,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-theme-card border border-theme-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border bg-theme-background/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Wedding Configuration & Custom Theme
              </h3>
              <p className="text-xs text-theme-text-muted">
                Configure pair terminology (Ladkiwale/Ladkewale) and wedding color theme.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: Configurable Pair Terminology */}
          <div className="space-y-4 bg-theme-background/60 p-4 rounded-2xl border border-theme-border">
            <div className="flex items-center gap-2 border-b border-theme-border/60 pb-2">
              <Heart className="w-4 h-4 text-theme-primary" />
              <h4 className="font-serif font-bold text-sm text-theme-text-main">
                Configurable Pair Terminology
              </h4>
            </div>
            <p className="text-xs text-theme-text-muted">
              Customize how the two sides are labeled throughout lists, tables, seating charts, and filters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">
                  Bride's Side Collective Term *
                </label>
                <input
                  type="text"
                  value={brideSideTerm}
                  onChange={(e) => setBrideSideTerm(e.target.value)}
                  placeholder="e.g. Bride's Side, Ladkiwale, Team Bride"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-card text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">
                  Groom's Side Collective Term *
                </label>
                <input
                  type="text"
                  value={groomSideTerm}
                  onChange={(e) => setGroomSideTerm(e.target.value)}
                  placeholder="e.g. Groom's Side, Ladkewale, Team Groom"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-card text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-theme-text-muted">
                  Bride Family Name / Title
                </label>
                <input
                  type="text"
                  value={brideSideName}
                  onChange={(e) => setBrideSideName(e.target.value)}
                  placeholder="e.g. Sharma Pariwaar"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-card text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-theme-text-muted">
                  Groom Family Name / Title
                </label>
                <input
                  type="text"
                  value={groomSideName}
                  onChange={(e) => setGroomSideName(e.target.value)}
                  placeholder="e.g. Verma Pariwaar"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-card text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Custom Wedding Colors & Theming */}
          <div className="space-y-4 bg-theme-background/60 p-4 rounded-2xl border border-theme-border">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-theme-secondary" />
                <h4 className="font-serif font-bold text-sm text-theme-text-main">
                  Wedding-Specific Color Theme
                </h4>
              </div>
            </div>
            <p className="text-xs text-theme-text-muted">
              Choose an Indian celebratory preset or pick custom hex colors for this specific wedding workspace.
            </p>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-theme-text-muted">
                Celebration Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-xl border border-theme-border bg-theme-card hover:border-theme-primary text-left flex items-center justify-between transition-all"
                  >
                    <span className="text-xs font-semibold text-theme-text-main">{preset.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.background }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Primary Accent</label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-theme-border bg-theme-card">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Secondary Gold</label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-theme-border bg-theme-card">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Highlight Color</label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-theme-border bg-theme-card">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Canvas Tint</label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-theme-border bg-theme-card">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-transparent outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Live Theme Swatch Preview */}
            <div
              className="p-4 rounded-2xl border shadow-inner flex items-center justify-between transition-colors"
              style={{ backgroundColor: backgroundColor, borderColor: secondaryColor }}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: secondaryColor }}>
                  {brideSideTerm} &bull; {groomSideTerm}
                </span>
                <div className="text-base font-serif font-bold" style={{ color: primaryColor }}>
                  {wedding.brideName} & {wedding.groomName}
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                Sample Button
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings & Colors</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
