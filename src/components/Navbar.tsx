import React, { useState, useRef } from 'react';
import { useWedding } from '../context/WeddingContext';
import { useTheme } from '../context/ThemeContext';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { ThemeSelectorModal } from './ThemeSelectorModal';
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
  HardDriveDownload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenTagManager?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal, onOpenTagManager }) => {
  const { weddings, activeWedding, activeWeddingId, setActiveWeddingId } = useWedding();
  const { currentThemeConfig } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupExport = async () => {
    setIsBackupMenuOpen(false);
    await downloadBackupFile();
    setBackupNotice({ type: 'success', message: 'IndexedDB backup exported successfully!' });
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBackupMenuOpen(false);

    try {
      const text = await file.text();
      const res = await importDatabaseFromJson(text);
      if (res.success) {
        setBackupNotice({ type: 'success', message: res.message });
      } else {
        setBackupNotice({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setBackupNotice({ type: 'error', message: 'Failed to read backup file.' });
    }
    setTimeout(() => setBackupNotice(null), 5000);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-theme-card/95 backdrop-blur-md border-b border-theme-border shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveWeddingId(null)}
              className="flex items-center gap-2.5 text-left group"
              title="Return to Weddings Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-theme-primary to-theme-accent text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-theme-secondary-light" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-theme-primary tracking-wide block leading-tight">
                  Vivah Planner
                </span>
                <span className="text-[10px] text-theme-text-muted font-medium tracking-wider uppercase block">
                  Indian Wedding Hub
                </span>
              </div>
            </button>

            {/* Wedding Switcher Dropdown */}
            {weddings && weddings.length > 0 && (
              <div className="relative ml-2 sm:ml-4">
                <button
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors max-w-[200px] sm:max-w-[280px]"
                >
                  <Heart className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
                  <span className="truncate">
                    {activeWedding ? activeWedding.title : 'All Weddings (Overview)'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-theme-text-muted flex-shrink-0 ml-auto" />
                </button>

                {isSwitcherOpen && (
                  <div
                    className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-theme-card border border-theme-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setIsSwitcherOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-text-muted border-b border-theme-border/60">
                      Switch Active Wedding
                    </div>

                    <button
                      onClick={() => setActiveWeddingId(null)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-theme-background transition-colors ${
                        activeWeddingId === null ? 'bg-theme-primary-light text-theme-primary font-bold' : 'text-theme-text-main'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4 text-theme-primary" />
                      <div>
                        <div className="font-medium">All Weddings Dashboard</div>
                        <div className="text-[10px] text-theme-text-muted">Overview of all client events</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-theme-border/60" />

                    <div className="max-h-60 overflow-y-auto">
                      {weddings.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setActiveWeddingId(w.id)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-theme-background transition-colors ${
                            activeWeddingId === w.id ? 'bg-theme-primary-light text-theme-primary font-bold' : 'text-theme-text-main'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-theme-secondary flex-shrink-0" />
                          <div className="truncate flex-1">
                            <div className="truncate font-semibold">{w.brideName} & {w.groomName}</div>
                            <div className="text-[10px] text-theme-text-muted truncate">{w.city} • {w.primaryDate}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-1 pt-1 border-t border-theme-border/60 px-2">
                      <button
                        onClick={onOpenCreateModal}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-theme-primary hover:bg-theme-primary-light flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New Wedding...</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <OfflineStatusIndicator />

            {/* Theme Selector Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
              title={`Active Theme: ${currentThemeConfig.name}`}
            >
              <span
                className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
                style={{ backgroundColor: currentThemeConfig.previewColors[0] }}
              />
              <span className="hidden md:inline">{currentThemeConfig.name}</span>
              <Palette className="w-3.5 h-3.5 text-theme-text-muted" />
            </button>

            {/* Backup & Portability Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsBackupMenuOpen(!isBackupMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
                title="Backup and Data Portability"
              >
                <HardDriveDownload className="w-3.5 h-3.5 text-theme-secondary" />
                <span className="hidden sm:inline">Backup</span>
                <ChevronDown className="w-3 h-3 text-theme-text-muted" />
              </button>

              {isBackupMenuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-theme-card border border-theme-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsBackupMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-text-muted border-b border-theme-border/60">
                    Offline Data Storage
                  </div>

                  <button
                    onClick={handleBackupExport}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-theme-background transition-colors text-theme-text-main"
                  >
                    <Download className="w-4 h-4 text-theme-primary" />
                    <div>
                      <div className="font-semibold">Export JSON Backup</div>
                      <div className="text-[10px] text-theme-text-muted">Save full database to local file</div>
                    </div>
                  </button>

                  <label className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-theme-background transition-colors text-theme-text-main cursor-pointer">
                    <Upload className="w-4 h-4 text-theme-secondary" />
                    <div>
                      <div className="font-semibold">Restore from JSON</div>
                      <div className="text-[10px] text-theme-text-muted">Import saved wedding database</div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Create Wedding Primary CTA */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Wedding</span>
              <span className="sm:hidden">New</span>
            </button>
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

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
};
