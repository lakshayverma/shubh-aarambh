import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import {
  Calendar,
  MapPin,
  Heart,
  Plus,
  Sparkles,
  ArrowRight,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  FolderHeart,
} from 'lucide-react';

interface WeddingDashboardProps {
  onOpenCreateModal: () => void;
}

export const WeddingDashboard: React.FC<WeddingDashboardProps> = ({ onOpenCreateModal }) => {
  const { weddings, setActiveWeddingId, deleteWedding, loadSample } = useWedding();
  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLoadSample = async () => {
    setIsSeeding(true);
    try {
      await loadSample();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this wedding and all its records? This cannot be undone.')) {
      setDeletingId(id);
      try {
        await deleteWedding(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const calculateDaysLeft = (dateStr: string) => {
    const weddingDate = new Date(dateStr);
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Subtle decorative Indian arches pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider mb-4 text-theme-secondary-light">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Wedding Coordinator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Indian Wedding Management Hub
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed font-light">
            Manage your client weddings across all 7 essential pillars: dates & ceremonies, family hierarchy, guest lists, hotel accommodations, travel fleet, seating layouts, and digital e-invites.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 bg-white text-theme-primary px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg hover:bg-white/95 hover:shadow-xl active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Wedding</span>
            </button>

            {(!weddings || weddings.length === 0) && (
              <button
                onClick={handleLoadSample}
                disabled={isSeeding}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSeeding ? 'Loading Sample...' : 'Load Sample Wedding'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {weddings && weddings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-theme-card border border-theme-border p-4 rounded-2xl shadow-2xs">
            <div className="text-xs text-theme-text-muted font-medium">Weddings Managed</div>
            <div className="text-2xl font-serif font-bold text-theme-primary mt-1">{weddings.length}</div>
          </div>
          <div className="bg-theme-card border border-theme-border p-4 rounded-2xl shadow-2xs">
            <div className="text-xs text-theme-text-muted font-medium">Active Destination</div>
            <div className="text-2xl font-serif font-bold text-theme-secondary mt-1">
              {new Set(weddings.map((w) => w.city)).size} Cities
            </div>
          </div>
          <div className="bg-theme-card border border-theme-border p-4 rounded-2xl shadow-2xs">
            <div className="text-xs text-theme-text-muted font-medium">Storage Mode</div>
            <div className="text-2xl font-serif font-bold text-emerald-600 mt-1">100% Offline</div>
          </div>
          <div className="bg-theme-card border border-theme-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs text-theme-text-muted font-medium">Quick Demo</div>
              <div className="text-xs font-semibold text-theme-text-main mt-1">Jaipur Royal Vivah</div>
            </div>
            <button
              onClick={handleLoadSample}
              disabled={isSeeding}
              className="text-xs bg-theme-primary-light text-theme-primary hover:bg-theme-primary hover:text-white px-2.5 py-1.5 rounded-xl font-bold transition-all"
            >
              {isSeeding ? '...' : 'Re-seed'}
            </button>
          </div>
        </div>
      )}

      {/* Wedding Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-theme-primary" />
            <h2 className="text-xl font-bold font-serif text-theme-text-main">Client Weddings</h2>
          </div>
          <span className="text-xs text-theme-text-muted">
            {weddings?.length || 0} wedding{weddings?.length === 1 ? '' : 's'} registered
          </span>
        </div>

        {weddings && weddings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((wedding) => {
              const daysLeft = calculateDaysLeft(wedding.primaryDate);

              return (
                <div
                  key={wedding.id}
                  onClick={() => setActiveWeddingId(wedding.id)}
                  className="group bg-theme-card border border-theme-border hover:border-theme-primary/60 rounded-3xl p-6 shadow-2xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Decorative top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-theme-primary to-theme-secondary opacity-80 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-4">
                    {/* Header with Countdown Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-theme-primary-light text-theme-primary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} Days to Muhurat`
                            : daysLeft === 0
                            ? 'Today is Wedding Day!'
                            : `${Math.abs(daysLeft)} Days Ago`}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDelete(wedding.id, e)}
                        disabled={deletingId === wedding.id}
                        className="text-theme-text-muted hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Wedding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Couple Names */}
                    <div>
                      <h3 className="font-serif font-bold text-xl text-theme-text-main group-hover:text-theme-primary transition-colors leading-snug">
                        {wedding.brideName} & {wedding.groomName}
                      </h3>
                      <p className="text-xs text-theme-text-muted font-medium mt-1">
                        {wedding.brideSideName} • {wedding.groomSideName}
                      </p>
                    </div>

                    {/* Destination & Venue */}
                    <div className="space-y-1.5 text-xs text-theme-text-muted border-t border-theme-border/60 pt-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-theme-secondary flex-shrink-0" />
                        <span className="truncate font-medium text-theme-text-main">{wedding.venue}, {wedding.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
                        <span>
                          {wedding.startDate} to {wedding.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-6 pt-4 border-t border-theme-border flex items-center justify-between text-xs font-bold text-theme-primary">
                    <span className="group-hover:underline">Open Command Center</span>
                    <div className="w-8 h-8 rounded-full bg-theme-primary-light flex items-center justify-center text-theme-primary group-hover:bg-theme-primary group-hover:text-white transition-colors shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-theme-primary-light text-theme-primary mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-serif font-bold text-xl text-theme-text-main">No Weddings Created Yet</h3>
              <p className="text-xs text-theme-text-muted mt-1 leading-relaxed">
                Begin by creating your first Indian wedding project or load our pre-configured royal destination wedding to explore all features instantly.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-2 bg-theme-primary text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Wedding</span>
              </button>
              <button
                onClick={handleLoadSample}
                disabled={isSeeding}
                className="inline-flex items-center gap-2 bg-theme-background border border-theme-border text-theme-text-main hover:bg-theme-border/30 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-theme-secondary" />
                <span>{isSeeding ? 'Loading...' : 'Load Sample Wedding'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
