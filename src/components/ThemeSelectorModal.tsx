import React from 'react';
import { useTheme, ThemeName } from '../context/ThemeContext';
import { Palette, Check, X } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, availableThemes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-theme-card border border-theme-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-theme-border flex items-center justify-between bg-theme-background/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-theme-text-main text-lg font-serif">Wedding Theme & Atmosphere</h3>
              <p className="text-xs text-theme-text-muted">Choose from 5 Indian & contemporary design palettes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main hover:bg-theme-border/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {availableThemes.map((t) => {
            const isSelected = theme === t.id;
            const [primary, secondary, background] = t.previewColors;

            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id as ThemeName)}
                className={`group p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-theme-primary bg-theme-primary-light/40 shadow-sm'
                    : 'border-theme-border hover:border-theme-primary/50 hover:bg-theme-background'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Color Swatches */}
                  <div
                    className="w-12 h-12 rounded-xl p-1 flex items-center justify-center gap-1 shadow-inner border border-black/10"
                    style={{ backgroundColor: background }}
                  >
                    <span
                      className="w-4 h-8 rounded-md shadow-sm"
                      style={{ backgroundColor: primary }}
                    />
                    <span
                      className="w-4 h-8 rounded-md shadow-sm"
                      style={{ backgroundColor: secondary }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-theme-text-main group-hover:text-theme-primary transition-colors">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-theme-secondary-light text-theme-accent border border-theme-border">
                        {t.accentBadge}
                      </span>
                    </div>
                    <p className="text-xs text-theme-text-muted mt-0.5">{t.description}</p>
                  </div>
                </div>

                <div className="flex items-center pl-3">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-theme-primary text-white flex items-center justify-center shadow">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-theme-border group-hover:border-theme-primary/60" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3.5 bg-theme-background/60 border-t border-theme-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-theme-primary text-white text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
