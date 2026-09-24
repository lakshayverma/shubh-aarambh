import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { Navbar } from './components/Navbar';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { WeddingDashboard } from './components/WeddingDashboard';
import { CreateWeddingModal } from './components/CreateWeddingModal';
import { WeddingCommandCenter } from './components/WeddingCommandCenter';
import { TagManagerModal } from './components/tags/TagManagerModal';
import { PublicInviteView } from './components/PublicInviteView';
import { AIKeyManagerModal } from './components/AIKeyManagerModal';
import { OPEN_AI_KEY_MANAGER_EVENT } from './services/aiService';

function MainApp() {
  const { activeWedding, activeWeddingId, isLoading } = useWedding();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isAIKeyManagerOpen, setIsAIKeyManagerOpen] = useState(false);

  // Global listener to open AI Key Manager from anywhere in the app
  useEffect(() => {
    const handleOpen = () => setIsAIKeyManagerOpen(true);
    window.addEventListener(OPEN_AI_KEY_MANAGER_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_AI_KEY_MANAGER_EVENT, handleOpen);
  }, []);

  // Hash-based routing for standalone e-invite view: #/invite/:slug
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const inviteMatch = currentHash.match(/^#\/invite\/(.+)$/);

  // Synchronize active wedding theme and custom colors to document root
  useEffect(() => {
    const root = document.documentElement;
    if (activeWedding) {
      if (activeWedding.theme) {
        root.setAttribute('data-theme', activeWedding.theme);
      }
      if (activeWedding.customColors) {
        const { primary, secondary, accent, background, card, textMain } = activeWedding.customColors;
        if (primary) {
          root.style.setProperty('--theme-primary', primary);
          root.style.setProperty('--theme-primary-hover', primary);
          root.style.setProperty('--theme-primary-light', `${primary}18`);
        }
        if (secondary) {
          root.style.setProperty('--theme-secondary', secondary);
          root.style.setProperty('--theme-secondary-light', `${secondary}20`);
        }
        if (accent) root.style.setProperty('--theme-accent', accent);
        if (background) root.style.setProperty('--theme-background', background);
        if (card) root.style.setProperty('--theme-card', card);
        if (textMain) root.style.setProperty('--theme-text-main', textMain);
      }
    }
    return () => {
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-primary-hover');
      root.style.removeProperty('--theme-primary-light');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-secondary-light');
      root.style.removeProperty('--theme-accent');
      root.style.removeProperty('--theme-background');
      root.style.removeProperty('--theme-card');
      root.style.removeProperty('--theme-text-main');
    };
  }, [activeWedding]);

  if (inviteMatch) {
    const slug = inviteMatch[1];
    return (
      <PublicInviteView
        slug={slug}
        onReturnToPlanner={() => {
          window.location.hash = '';
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-theme-text-muted">Loading Vivah Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-theme-background text-theme-text-main font-sans transition-colors duration-200">
      <InstallPwaBanner />
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTagManager={() => setIsTagManagerOpen(true)}
        onOpenAIKeyManager={() => setIsAIKeyManagerOpen(true)}
      />

      <main className="flex-1 pb-16">
        {activeWedding ? (
          <WeddingCommandCenter
            wedding={activeWedding}
            onOpenTagManager={() => setIsTagManagerOpen(true)}
          />
        ) : (
          <WeddingDashboard onOpenCreateModal={() => setIsCreateModalOpen(true)} />
        )}
      </main>

      {/* 3-Step Indian Wedding Wizard Modal */}
      <CreateWeddingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Tag & Role Badges Manager Modal */}
      {activeWeddingId && (
        <TagManagerModal
          isOpen={isTagManagerOpen}
          onClose={() => setIsTagManagerOpen(false)}
          weddingId={activeWeddingId}
        />
      )}

      {/* App-Wide AI Key & Model Manager Modal */}
      <AIKeyManagerModal
        isOpen={isAIKeyManagerOpen}
        onClose={() => setIsAIKeyManagerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WeddingProvider>
        <MainApp />
      </WeddingProvider>
    </ThemeProvider>
  );
}
