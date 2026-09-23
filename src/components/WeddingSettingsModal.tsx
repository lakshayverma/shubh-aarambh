import React, { useState } from 'react';
import { Wedding, WeddingCustomColors } from '../db/schema';
import { useWedding } from '../context/WeddingContext';
import { NestedScreen } from './common/NestedScreen';
import {
  Palette,
  Sparkles,
  Check,
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

  const handleApplyPreset = (preset: { name: string; colors: WeddingCustomColors }) => {
    setPrimaryColor(preset.colors.primary);
    setSecondaryColor(preset.colors.secondary);
    setAccentColor(preset.colors.accent);
    setBackgroundColor(preset.colors.background || '#FCFBF7');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWedding({
      ...wedding,
      brideSideTerm,
      groomSideTerm,
      brideSideName,
      groomSideName,
      customColors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        background: backgroundColor,
        card: '#FFFFFF',
        textMain: '#271E1D',
      },
    });
    onClose();
  };

  const handleResetColors = () => {
    setPrimaryColor('#7B1113');
    setSecondaryColor('#D97706');
    setAccentColor('#B45309');
    setBackgroundColor('#FCFBF7');
  };

  return (
    <NestedScreen
      isOpen={isOpen}
      onClose={onClose}
      title="Wedding Theme & Settings"
      subtitle={`Configure colors and pair terminology for ${wedding.brideName} & ${wedding.groomName}`}
      mode="drawer"
      width="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted hover:bg-theme-border/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings & Colors</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Pair Terminology Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Pair & Family Group Terminology</span>
          </div>
          <p className="text-xs text-theme-text-muted">
            Customize how both sides are addressed across calendar filters, guest lists, seating charts, and e-invites.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-theme-text-muted mb-1">
                Bride's Side Display Term
              </label>
              <input
                type="text"
                value={brideSideTerm}
                onChange={(e) => setBrideSideTerm(e.target.value)}
                placeholder="e.g. Bride's Side, Ladkiwale, Team Ananya"
                className="w-full px-3 py-2 text-xs rounded-xl border border-theme-border bg-theme-card text-theme-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text-muted mb-1">
                Groom's Side Display Term
              </label>
              <input
                type="text"
                value={groomSideTerm}
                onChange={(e) => setGroomSideTerm(e.target.value)}
                placeholder="e.g. Groom's Side, Ladkewale, Team Aarav"
                className="w-full px-3 py-2 text-xs rounded-xl border border-theme-border bg-theme-card text-theme-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text-muted mb-1">
                Bride Family Full Label
              </label>
              <input
                type="text"
                value={brideSideName}
                onChange={(e) => setBrideSideName(e.target.value)}
                placeholder="e.g. Ladkiwale (Sharma Family)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-theme-border bg-theme-card text-theme-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text-muted mb-1">
                Groom Family Full Label
              </label>
              <input
                type="text"
                value={groomSideName}
                onChange={(e) => setGroomSideName(e.target.value)}
                placeholder="e.g. Ladkewale (Verma Family)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-theme-border bg-theme-card text-theme-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-theme-border pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
              <Palette className="w-4 h-4" />
              <span>Wedding Custom Theme & Palette</span>
            </div>
            <button
              type="button"
              onClick={handleResetColors}
              className="inline-flex items-center gap-1 text-[11px] text-theme-text-muted hover:text-theme-primary"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <p className="text-xs text-theme-text-muted">
            Define royal colors specific to this wedding that override the default app theme when managing this celebration.
          </p>

          {/* Preset Palettes */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">
              Festive Preset Palettes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected =
                  primaryColor === preset.colors.primary &&
                  secondaryColor === preset.colors.secondary;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-theme-primary bg-theme-primary/10 shadow-sm'
                        : 'border-theme-border hover:border-theme-primary/40 bg-theme-card'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold text-theme-text-main truncate">
                        {preset.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.colors.secondary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.colors.accent }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.colors.background }}
                        />
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-theme-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="pt-2 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">
              Custom Hex Color Override
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-theme-text-muted mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-theme-border cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-card uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-theme-text-muted mb-1">
                  Secondary (Gold)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-theme-border cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-card uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-theme-text-muted mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-theme-border cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-card uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-theme-text-muted mb-1">
                  Page Tint
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-theme-border cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-card uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Theme Swatch Preview */}
          <div
            className="p-4 rounded-2xl border shadow-inner flex items-center justify-between transition-colors mt-4"
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
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </form>
    </NestedScreen>
  );
};
