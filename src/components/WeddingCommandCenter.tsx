import React, { useState, useEffect } from 'react';
import { Wedding } from '../db/schema';
import { useWedding } from '../context/WeddingContext';
import { EventsTimeline } from './pillar1/EventsTimeline';
import { GuestListManager } from './pillar3/GuestListManager';
import { AccommodationsManager } from './pillar4/AccommodationsManager';
import { TravelManager } from './pillar5/TravelManager';
import { SeatingChartsManager } from './pillar6/SeatingChartsManager';
import { EInvitesManager } from './pillar7/EInvitesManager';
import {
  Calendar,
  Users,
  Building,
  Car,
  Armchair,
  Mail,
  ChevronLeft,
  Tag,
  Palette,
} from 'lucide-react';
import { WeddingSettingsModal } from './WeddingSettingsModal';

interface WeddingCommandCenterProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export type UnifiedPillarId = 'dates' | 'guests_family' | 'rooms' | 'travel' | 'seating' | 'invites';

export const WeddingCommandCenter: React.FC<WeddingCommandCenterProps> = ({
  wedding,
  onOpenTagManager,
}) => {
  const { setActiveWeddingId } = useWedding();
  const [activeTab, setActiveTab] = useState<UnifiedPillarId>('dates');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Inject custom wedding colors into CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (wedding.customColors) {
      if (wedding.customColors.primary) {
        root.style.setProperty('--theme-primary', wedding.customColors.primary);
        root.style.setProperty('--theme-primary-hover', wedding.customColors.primary);
        root.style.setProperty('--theme-primary-light', `${wedding.customColors.primary}20`);
      }
      if (wedding.customColors.secondary) {
        root.style.setProperty('--theme-secondary', wedding.customColors.secondary);
        root.style.setProperty('--theme-secondary-light', `${wedding.customColors.secondary}25`);
      }
      if (wedding.customColors.accent) {
        root.style.setProperty('--theme-accent', wedding.customColors.accent);
      }
      if (wedding.customColors.background) {
        root.style.setProperty('--theme-background', wedding.customColors.background);
      }
      if (wedding.customColors.card) {
        root.style.setProperty('--theme-card', wedding.customColors.card);
      }
      if (wedding.customColors.textMain) {
        root.style.setProperty('--theme-text-main', wedding.customColors.textMain);
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
  }, [wedding.customColors]);

  const pillarsConfig = [
    { id: 'dates', label: '1. Dates & Events', icon: Calendar },
    { id: 'guests_family', label: '2. Guests & Family', icon: Users },
    { id: 'rooms', label: '3. Accommodations', icon: Building },
    { id: 'travel', label: '4. Travel & Logistics', icon: Car },
    { id: 'seating', label: '5. Seating Charts', icon: Armchair },
    { id: 'invites', label: '6. E-Invites', icon: Mail },
  ];

  return (
    <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 space-y-6">
      
      {/* Subheader: Merged with Back Button, Center Navigation Tabs, and Theme/Tags Quick Actions */}
      <div className="sticky top-16 z-30 bg-theme-background/95 backdrop-blur-md py-3 border-b border-theme-border flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Back to All Weddings */}
        <div className="flex items-center shrink-0 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => setActiveWeddingId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted hover:text-theme-primary hover:border-theme-primary/40 hover:bg-theme-border/20 transition-all shadow-2xs"
            title="Return to Weddings Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Weddings</span>
          </button>

          {/* Mobile view quick actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-1.5 rounded-xl border border-theme-border bg-theme-card text-theme-text-main hover:bg-theme-border/30"
              title="Wedding Theme"
            >
              <Palette className="w-4 h-4 text-theme-primary" />
            </button>
            {onOpenTagManager && (
              <button
                onClick={onOpenTagManager}
                className="p-1.5 rounded-xl border border-theme-border bg-theme-card text-theme-text-main hover:bg-theme-border/30"
                title="Manage Tags"
              >
                <Tag className="w-4 h-4 text-theme-primary" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Pillar Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {pillarsConfig.map((p) => {
            const Icon = p.icon;
            const isSelected = activeTab === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id as UnifiedPillarId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-theme-primary text-white shadow-md'
                    : 'bg-theme-card border border-theme-border text-theme-text-muted hover:text-theme-text-main hover:bg-theme-border/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Theme & Tags Action Buttons */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-main hover:text-theme-primary hover:border-theme-primary/40 hover:bg-theme-border/30 transition-all shadow-2xs"
            title="Configure wedding custom theme & pair terminology"
          >
            <Palette className="w-3.5 h-3.5 text-theme-primary" />
            <span>Wedding Theme</span>
          </button>

          {onOpenTagManager && (
            <button
              onClick={onOpenTagManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-main hover:text-theme-primary hover:border-theme-primary/40 hover:bg-theme-border/30 transition-all shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-theme-primary" />
              <span>Tags</span>
            </button>
          )}
        </div>
      </div>

      {/* Pillar Content Views */}
      <div className="pt-1">
        {activeTab === 'dates' && <EventsTimeline wedding={wedding} />}
        {activeTab === 'guests_family' && (
          <GuestListManager wedding={wedding} onOpenTagManager={onOpenTagManager} />
        )}
        {activeTab === 'rooms' && (
          <AccommodationsManager wedding={wedding} onOpenTagManager={onOpenTagManager} />
        )}
        {activeTab === 'travel' && (
          <TravelManager wedding={wedding} onOpenTagManager={onOpenTagManager} />
        )}
        {activeTab === 'seating' && (
          <SeatingChartsManager wedding={wedding} onOpenTagManager={onOpenTagManager} />
        )}
        {activeTab === 'invites' && (
          <EInvitesManager wedding={wedding} onOpenTagManager={onOpenTagManager} />
        )}
      </div>

      {/* Wedding Settings & Custom Theme Drawer */}
      <WeddingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        wedding={wedding}
      />
    </div>
  );
};
