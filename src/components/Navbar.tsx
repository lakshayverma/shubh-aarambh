import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext';
import { useTheme, THEMES, ThemeName } from '../context/ThemeContext';
import { downloadBackupFile, importDatabaseFromJson } from '../db/backup';
import {
  Sparkles,
  Palette,
  Download,
  Upload,
  ChevronDown,
  Plus,
  LayoutGrid,
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Wifi,
  WifiOff,
  Check,
  MapPin,
  KeyRound,
} from 'lucide-react';
import { hasConfiguredAIKey, AI_SETTINGS_UPDATED_EVENT } from '../services/aiService';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenTagManager?: () => void;
  onOpenAIKeyManager?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal, onOpenAIKeyManager }) => {
  const { weddings, activeWedding, activeWeddingId, setActiveWeddingId } = useWedding();
  const { theme, setTheme, currentThemeConfig } = useTheme();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isGearMenuOpen, setIsGearMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasAIKey, setHasAIKey] = useState(hasConfiguredAIKey());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const gearMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize AI key state
  useEffect(() => {
    const handleUpdate = () => setHasAIKey(hasConfiguredAIKey());
    window.addEventListener(AI_SETTINGS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(AI_SETTINGS_UPDATED_EVENT, handleUpdate);
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsSwitcherOpen(false);
      }
      if (gearMenuRef.current && !gearMenuRef.current.contains(e.target as Node)) {
        setIsGearMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Muhurat Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (!activeWedding?.primaryDate) return;

    const calculateTime = () => {
      const target = new Date(`${activeWedding.primaryDate}T18:00:00`).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [activeWedding?.primaryDate]);

  const handleBackupExport = async () => {
    setIsGearMenuOpen(false);
    await downloadBackupFile();
    setBackupNotice({ type: 'success', message: 'IndexedDB backup exported successfully!' });
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsGearMenuOpen(false);

    try {
      const text = await file.text();
      const res = await importDatabaseFromJson(text);
      if (res.success) {
        setBackupNotice({ type: 'success', message: res.message });
      } else {
        setBackupNotice({ type: 'error', message: res.message });
      }
    } catch {
      setBackupNotice({ type: 'error', message: 'Failed to read backup file.' });
    }
    setTimeout(() => setBackupNotice(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-theme-border shadow-xs transition-all duration-300"
        style={{
          background: activeWedding
            ? `linear-gradient(135deg, var(--theme-background) 0%, var(--theme-card) 55%, var(--theme-primary-light) 100%)`
            : 'var(--theme-card)',
        }}
      >
        {/* Festive Top Accent Strip matching Wedding Theme */}
        {activeWedding && (
          <div className="h-1 w-full bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent opacity-90 transition-all" />
        )}
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Wedding Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveWeddingId(null)}
              className="flex items-center gap-2.5 text-left group shrink-0"
              title="Return to Weddings Dashboard"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-theme-primary to-theme-accent text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-theme-secondary-light" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif font-bold text-base text-theme-primary tracking-wide block leading-tight">
                  Vivah Planner
                </span>
                <span className="text-[9px] text-theme-text-muted font-medium tracking-wider uppercase block">
                  Indian Wedding Hub
                </span>
              </div>
            </button>

            {/* Wedding Switcher Dropdown (with + New Wedding inside) */}
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors max-w-[180px] sm:max-w-[240px] md:max-w-[280px]"
              >
                <Heart className="w-3.5 h-3.5 text-theme-primary shrink-0" />
                <span className="truncate">
                  {activeWedding ? activeWedding.title : 'All Weddings'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-theme-text-muted shrink-0 ml-auto transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-theme-card border border-theme-border shadow-2xl py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-text-muted border-b border-theme-border/60">
                    Switch Wedding
                  </div>

                  <button
                    onClick={() => {
                      setActiveWeddingId(null);
                      setIsSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-theme-background transition-colors ${
                      activeWeddingId === null ? 'bg-theme-primary-light text-theme-primary font-bold' : 'text-theme-text-main'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 text-theme-primary" />
                    <div>
                      <div className="font-medium">All Weddings Overview</div>
                      <div className="text-[10px] text-theme-text-muted">Master dashboard of all weddings</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-theme-border/60" />

                  <div className="max-h-56 overflow-y-auto">
                    {weddings && weddings.length > 0 ? (
                      weddings.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            setActiveWeddingId(w.id);
                            setIsSwitcherOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-theme-background transition-colors ${
                            activeWeddingId === w.id ? 'bg-theme-primary-light text-theme-primary font-bold' : 'text-theme-text-main'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-theme-secondary shrink-0" />
                          <div className="truncate flex-1">
                            <div className="truncate font-semibold">{w.brideName} & {w.groomName}</div>
                            <div className="text-[10px] text-theme-text-muted truncate">{w.city} • {w.primaryDate}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-theme-text-muted text-center">
                        No weddings created yet
                      </div>
                    )}
                  </div>

                  {/* + New Wedding Button Inside Dropdown */}
                  <div className="mt-1 pt-1.5 border-t border-theme-border/60 px-2">
                    <button
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        onOpenCreateModal();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover flex items-center justify-center gap-2 shadow transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create New Wedding</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Merged Wedding Banner Info (when wedding is active) */}
          {activeWedding && (
            <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-2xl bg-theme-background/60 border border-theme-border/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-theme-primary">
                  {activeWedding.brideName} & {activeWedding.groomName}
                </span>
                <span className="text-xs text-theme-text-muted">&bull;</span>
                <div className="flex items-center gap-1 text-xs text-theme-text-muted">
                  <MapPin className="w-3 h-3 text-theme-secondary" />
                  <span>{activeWedding.city}</span>
                </div>
              </div>

              {/* Muhurat Live Countdown Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m to Muhurat
                </span>
              </div>
            </div>
          )}

          {/* Right: AI Key Manager & Settings Submenu */}
          <div className="flex items-center gap-2">
            {/* AI Key Manager Quick Trigger */}
            <button
              type="button"
              onClick={onOpenAIKeyManager}
              className="relative p-2.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-theme-text-main shadow-2xs transition-all flex items-center justify-center"
              title="App-Wide AI Key & Model Manager"
              aria-label="AI Key Manager"
            >
              <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              {hasAIKey && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900"
                  title="AI Keys Active"
                />
              )}
            </button>

            {/* Settings Submenu via Gear Icon */}
            <div className="relative" ref={gearMenuRef}>
              <button
                onClick={() => setIsGearMenuOpen(!isGearMenuOpen)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isGearMenuOpen
                    ? 'border-theme-primary ring-2 ring-theme-primary/20 bg-theme-primary-light text-theme-primary'
                    : 'border-theme-border bg-theme-background hover:bg-theme-border/30 text-theme-text-main shadow-2xs'
                }`}
                title="Settings & System Menu"
                aria-label="Settings"
              >
                <Settings className={`w-5 h-5 transition-transform duration-200 ${isGearMenuOpen ? 'rotate-90' : ''}`} />
              </button>

            {isGearMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-theme-card border border-theme-border shadow-2xl py-3 z-50 animate-fade-in space-y-3">
                <div className="px-4 pb-2 border-b border-theme-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                    Settings & System
                  </span>
                  {/* Offline Status Badge inside gear menu */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
                    <span>{isOnline ? 'Online / PWA Ready' : 'Offline Cached'}</span>
                  </div>
                </div>

                {/* Theme Selector Section */}
                <div className="px-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-theme-text-main">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-theme-primary" />
                      <span>App Color Theme</span>
                    </span>
                    <span className="text-[11px] text-theme-text-muted">
                      {currentThemeConfig.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {THEMES.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id as ThemeName)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
                            isSelected
                              ? 'border-theme-primary bg-theme-primary-light font-bold text-theme-primary'
                              : 'border-theme-border/60 hover:bg-theme-background text-theme-text-main'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                              style={{ backgroundColor: t.previewColors[0] }}
                            />
                            <span>{t.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-theme-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Credentials App-Wide Section */}
                <div className="border-t border-theme-border/60 pt-3 px-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">
                      App-Wide AI Credentials
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        hasAIKey
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {hasAIKey ? 'Active' : 'Not Set'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGearMenuOpen(false);
                      onOpenAIKeyManager?.();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-theme-border/80 bg-theme-background hover:bg-amber-50/50 hover:border-amber-300 text-xs font-semibold text-theme-text-main transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Manage AI Keys & Models</span>
                    </div>
                    <span className="text-[10px] text-theme-text-muted">&rarr;</span>
                  </button>
                </div>

                {/* Backup & Portability Section */}
                <div className="border-t border-theme-border/60 pt-3 px-4 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">
                    Database Portability (IndexedDB)
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleBackupExport}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-theme-primary" />
                      <span>Export Backup</span>
                    </button>

                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-theme-secondary" />
                      <span>Restore Backup</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Backup Feedback Notice */}
        {backupNotice && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center transition-all ${
              backupNotice.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {backupNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{backupNotice.message}</span>
          </div>
        )}
      </header>
    </>
  );
};
