import React, { useState, useEffect } from 'react';
import { Wedding } from '../db/schema';
import { useWedding } from '../context/WeddingContext';
import { EventsTimeline } from './pillar1/EventsTimeline';
import { FamilyManager } from './pillar2/FamilyManager';
import { GuestListManager } from './pillar3/GuestListManager';
import { AccommodationsManager } from './pillar4/AccommodationsManager';
import { TravelManager } from './pillar5/TravelManager';
import { SeatingChartsManager } from './pillar6/SeatingChartsManager';
import { EInvitesManager } from './pillar7/EInvitesManager';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Users,
  Building,
  Car,
  Armchair,
  Mail,
  Sparkles,
  ChevronLeft,
  Tag,
} from 'lucide-react';

interface WeddingCommandCenterProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export type PillarId = 'dates' | 'family' | 'guests' | 'rooms' | 'travel' | 'seating' | 'invites';

export const WeddingCommandCenter: React.FC<WeddingCommandCenterProps> = ({
  wedding,
  onOpenTagManager,
}) => {
  const { setActiveWeddingId } = useWedding();
  const [activeTab, setActiveTab] = useState<PillarId>('dates');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${wedding.primaryDate}T18:00:00`).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [wedding.primaryDate]);

  const pillarsConfig = [
    { id: 'dates', label: '1. Dates & Events', icon: Calendar },
    { id: 'family', label: '2. Family Hierarchy', icon: Heart },
    { id: 'guests', label: '3. Guest List & RSVP', icon: Users },
    { id: 'rooms', label: '4. Accommodations', icon: Building },
    { id: 'travel', label: '5. Travel & Cabs', icon: Car },
    { id: 'seating', label: '6. Seating Charts', icon: Armchair },
    { id: 'invites', label: '7. E-Invites', icon: Mail },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top back navigation & tag manager */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveWeddingId(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-text-muted hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Weddings Dashboard</span>
        </button>

        {onOpenTagManager && (
          <button
            onClick={onOpenTagManager}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-main hover:bg-theme-border/30 transition-colors shadow-2xs"
          >
            <Tag className="w-3.5 h-3.5 text-theme-primary" />
            <span>Manage Tags</span>
          </button>
        )}
      </div>

      {/* Hero Command Center Header */}
      <div className="bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wider uppercase text-theme-secondary-light">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wedding Command Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              {wedding.brideName} & {wedding.groomName}
            </h1>

            <p className="text-xs sm:text-sm text-white/90 font-medium">
              {wedding.brideSideName} &bull; {wedding.groomSideName}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-theme-secondary-light" />
                <span>{wedding.venue}, {wedding.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-theme-secondary-light" />
                <span>{wedding.startDate} to {wedding.endDate}</span>
              </div>
            </div>
          </div>

          {/* Muhurat Live Countdown Display */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex-shrink-0 text-center">
            <div className="text-[11px] uppercase tracking-wider text-theme-secondary-light font-bold flex items-center justify-center gap-1 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Muhurat Countdown</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              <div className="bg-white/10 rounded-xl px-2.5 py-1.5 min-w-[50px]">
                <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  {timeLeft.days}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/70">Days</div>
              </div>

              <div className="bg-white/10 rounded-xl px-2.5 py-1.5 min-w-[50px]">
                <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  {timeLeft.hours}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/70">Hours</div>
              </div>

              <div className="bg-white/10 rounded-xl px-2.5 py-1.5 min-w-[50px]">
                <div className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  {timeLeft.minutes}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/70">Mins</div>
              </div>

              <div className="bg-white/10 rounded-xl px-2.5 py-1.5 min-w-[50px]">
                <div className="text-xl sm:text-2xl font-serif font-bold text-theme-secondary-light leading-tight">
                  {timeLeft.seconds}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/70">Secs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Pillars Tab Navigation */}
      <div className="border-b border-theme-border flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {pillarsConfig.map((p) => {
          const Icon = p.icon;
          const isSelected = activeTab === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id as PillarId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Pillar Content Views - All 7 Pillars Fully Connected */}
      <div className="pt-2">
        {activeTab === 'dates' && <EventsTimeline wedding={wedding} />}
        {activeTab === 'family' && <FamilyManager wedding={wedding} onOpenTagManager={onOpenTagManager} />}
        {activeTab === 'guests' && <GuestListManager wedding={wedding} onOpenTagManager={onOpenTagManager} />}
        {activeTab === 'rooms' && <AccommodationsManager wedding={wedding} onOpenTagManager={onOpenTagManager} />}
        {activeTab === 'travel' && <TravelManager wedding={wedding} onOpenTagManager={onOpenTagManager} />}
        {activeTab === 'seating' && <SeatingChartsManager wedding={wedding} onOpenTagManager={onOpenTagManager} />}
        {activeTab === 'invites' && <EInvitesManager wedding={wedding} onOpenTagManager={onOpenTagManager} />}
      </div>
    </div>
  );
};
