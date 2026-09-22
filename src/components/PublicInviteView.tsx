import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Sparkles, Calendar, MapPin, Clock, Shirt, Phone } from 'lucide-react';

interface PublicInviteViewProps {
  slug: string;
  onReturnToPlanner: () => void;
}

export const PublicInviteView: React.FC<PublicInviteViewProps> = ({
  slug,
  onReturnToPlanner,
}) => {
  const data = useLiveQuery(async () => {
    const invite = await db.eInvites.where('slug').equals(slug).first();
    if (!invite) return null;
    const wed = await db.weddings.get(invite.weddingId);
    const evts = await db.events.where('weddingId').equals(invite.weddingId).toArray();
    return { invite, wedding: wed, events: evts };
  }, [slug]);

  if (!data || !data.invite || !data.wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4 text-center">
        <div className="space-y-4 max-w-sm">
          <Sparkles className="w-10 h-10 text-[#D97706] mx-auto animate-pulse" />
          <h2 className="font-serif font-bold text-xl text-[#7B1113]">Looking for Invitation...</h2>
          <p className="text-xs text-stone-600">If this invite was created locally, please make sure the slug matches.</p>
          <button
            onClick={onReturnToPlanner}
            className="px-4 py-2 rounded-xl bg-[#7B1113] text-white text-xs font-bold"
          >
            Return to Planner
          </button>
        </div>
      </div>
    );
  }

  const { invite: eInvite, wedding, events } = data;
  const includedEvents = events.filter((ev) => eInvite.includedEventIds.includes(ev.id));

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#271E1D] flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* Subtle Return Bar */}
      <div className="w-full max-w-lg flex justify-end mb-3">
        <button
          onClick={onReturnToPlanner}
          className="text-xs font-semibold text-stone-500 hover:text-[#7B1113] transition-colors"
        >
          &larr; Return to Wedding Planner
        </button>
      </div>

      <div className="w-full max-w-lg bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7EFE4] border-4 border-[#D97706] rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Corner Ornaments */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#D97706]" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#D97706]" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#D97706]" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#D97706]" />

        {/* Decorative Arch Emblem */}
        <div className="w-12 h-12 mx-auto rounded-full bg-[#7B1113]/10 border border-[#D97706] flex items-center justify-center text-[#7B1113]">
          <Sparkles className="w-6 h-6 text-[#D97706]" />
        </div>

        {/* Greeting */}
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#D97706]">
            {eInvite.coverGreeting}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#7B1113] tracking-tight">
            {wedding.brideName} & {wedding.groomName}
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            {eInvite.hostFamilyNames}
          </p>
        </div>

        {/* Custom Inviting Message */}
        <p className="text-xs sm:text-sm text-stone-700 italic max-w-md mx-auto leading-relaxed border-y border-[#D97706]/30 py-3">
          "{eInvite.customMessage}"
        </p>

        {/* Selected Events Schedule */}
        <div className="space-y-3 pt-2">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#7B1113]">
            Celebrations Schedule
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {includedEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white/90 border border-[#E8DFD8] rounded-2xl p-3.5 text-left shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#7B1113]">{ev.name}</span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {ev.startTime} - {ev.endTime}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-[#D97706]" />
                  <span>{ev.date}</span>
                  <span>&bull;</span>
                  <span className="truncate">{ev.venue}</span>
                </div>
                {ev.dressCode && (
                  <div className="text-[10px] text-[#D97706] italic">
                    Dress Code: {ev.dressCode}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Details */}
        <div className="pt-3 border-t border-[#D97706]/30 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-800">
            <MapPin className="w-3.5 h-3.5 text-[#7B1113]" />
            <span>{wedding.venue}, {wedding.city}</span>
          </div>

          {eInvite.googleMapsUrl && (
            <a
              href={eInvite.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-4 py-2 rounded-xl bg-[#7B1113] text-white text-xs font-bold shadow hover:bg-[#630d0f] transition-all"
            >
              Open Venue Map
            </a>
          )}

          {eInvite.rsvpPhone && (
            <div className="text-[11px] text-stone-500 pt-1">
              RSVP Contact: <strong className="text-stone-800">{eInvite.rsvpPhone}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
