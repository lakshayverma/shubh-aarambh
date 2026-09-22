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

function MainApp() {
  const { activeWedding, activeWeddingId, isLoading } = useWedding();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Hash-based routing for standalone e-invite view: #/invite/:slug
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const inviteMatch = currentHash.match(/^#\/invite\/(.+)$/);

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
