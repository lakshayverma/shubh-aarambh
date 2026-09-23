import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, WeddingEvent } from '../../db/schema';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Shirt,
  CalendarCheck,
  Download,
  X,
  Users,
  Sun,
  Palette,
  Music,
  Crown,
  Wine,
  GlassWater,
  CalendarDays,
  List,
  Filter,
} from 'lucide-react';

interface EventsTimelineProps {
  wedding: Wedding;
}

export const EVENT_TYPE_DEFAULTS: Record<
  WeddingEvent['type'],
  {
    name: string;
    startTime: string;
    endTime: string;
    venueArea: string;
    dressCode: string;
    notes: string;
  }
> = {
  haldi: {
    name: 'Phoolon Ki Haldi & Chuda Ceremony',
    startTime: '10:30',
    endTime: '13:30',
    venueArea: 'Poolside Lawn & Sunken Garden',
    dressCode: 'Bright Sunshine Yellow / Traditional Lehariya',
    notes: 'Dry organic haldi, fresh marigold petals shower, dholak team arrival at 10:00 AM, sweet lassi & thandai counters active',
  },
  mehendi: {
    name: 'Mehendi Ki Raat & Sitar Melodies',
    startTime: '15:00',
    endTime: '19:00',
    venueArea: 'Courtyard Lawn & Haveli Corridor',
    dressCode: 'Pastel Florals, Mint Green & Mustard Silks',
    notes: 'Stationed mehendi artists, traditional choodi & floral jewellery stall, live Rajasthani folk singer',
  },
  sangeet: {
    name: 'Sangeet Extravaganza & DJ Night',
    startTime: '19:30',
    endTime: '00:30',
    venueArea: 'Grand Royal Ballroom & Stage',
    dressCode: 'Indo-Western Glitz, Shimmering Sequins & Tuxedos',
    notes: 'Choreographed family dance entries, couple performance, professional DJ setup, LED dance floor, signature cocktail bar',
  },
  wedding: {
    name: 'Shubh Vivah & Sacred Royal Pheras',
    startTime: '18:00',
    endTime: '22:30',
    venueArea: 'Sunset Courtyard & Lakeside Mandap Pavilion',
    dressCode: 'Royal Traditional Sherwani & Regal Bridal Crimson/Pastel',
    notes: 'Baraat procession assembly at 5:00 PM, Milni ritual at 6:00 PM, Jaimala / Varmala at 7:00 PM, Vedic Pheras at 8:15 PM (Shubh Muhurat)',
  },
  reception: {
    name: 'Grand Royal Reception Gala Feast',
    startTime: '20:00',
    endTime: '23:30',
    venueArea: 'Palace Amphitheater & Banquet Lawns',
    dressCode: 'Formal Black Tie, Royal Velvets & Fine Silk Sarees',
    notes: 'Couple stage greetings photo-op, 56-Bhog multi-cuisine banquet feast, live sufi/acoustic orchestra',
  },
  roka: {
    name: 'Auspicious Roka & Ring Exchange Ceremony',
    startTime: '11:00',
    endTime: '14:30',
    venueArea: 'Heritage Darbar Hall',
    dressCode: 'Elegant Ethnic & Traditional Kurtas',
    notes: 'Shagun gift exchange, blessings by elders, dry fruit & mithai hampers distribution',
  },
  cocktail: {
    name: 'Sundowner Cocktail & Welcome Soirée',
    startTime: '18:30',
    endTime: '23:30',
    venueArea: 'Rooftop Terrace Lounge / Lake Deck',
    dressCode: 'Contemporary Cocktail Attire & Evening Gowns',
    notes: 'Live acoustic band, molecular mixology bar, woodfired gourmet appetizers, casual icebreaker games',
  },
  other: {
    name: 'Welcome High Tea & Guest Registration',
    startTime: '16:00',
    endTime: '18:00',
    venueArea: 'Hotel Lobby & Verandah',
    dressCode: 'Casual Smart',
    notes: 'Welcome hampers handover, room key coordination, logistics helpdesk active',
  },
};

export const EventsTimeline: React.FC<EventsTimelineProps> = ({ wedding }) => {
  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );

  const parties = useLiveQuery(
    () => db.guestParties.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  const rsvps = useLiveQuery(
    () => db.eventRsvps.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  const guests = useLiveQuery(
    () => db.guests.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  // View state: 'week' (default) vs 'list'
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  // Side filter: 'all' | 'ladkiwale' | 'ladkewale'
  const [sideFilter, setSideFilter] = useState<'all' | 'ladkiwale' | 'ladkewale'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<WeddingEvent['type']>('mehendi');
  const [date, setDate] = useState(wedding.startDate);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('16:00');
  const [venue, setVenue] = useState(wedding.venue);
  const [dressCode, setDressCode] = useState('');
  const [notes, setNotes] = useState('');
  const [sideScope, setSideScope] = useState<'common' | 'bride_only' | 'groom_only'>('common');

  const brideTerm = wedding.brideSideTerm || "Bride's Side (Ladkiwale)";
  const groomTerm = wedding.groomSideTerm || "Groom's Side (Ladkewale)";

  // Precompute live RSVP expected headcounts per ceremony
  const eventHeadcounts = useMemo(() => {
    const map: Record<
      string,
      { total: number; brideCount: number; groomCount: number; mutualCount: number }
    > = {};

    if (!events) return map;

    for (const evt of events) {
      map[evt.id] = { total: 0, brideCount: 0, groomCount: 0, mutualCount: 0 };
    }

    if (!rsvps || !parties) return map;

    // For each ceremony event, compute expected headcount based on party & individual RSVPs
    for (const evt of events) {
      for (const party of parties) {
        const partyMembers = guests?.filter((g) => g.partyId === party.id) || [];

        let confirmedCountForParty = 0;

        if (partyMembers.length > 0) {
          // Check each member's individual RSVP, falling back to party RSVP
          for (const m of partyMembers) {
            const memberRsvp = rsvps.find((r) => r.guestId === m.id && r.eventId === evt.id);
            if (memberRsvp) {
              if (memberRsvp.status === 'confirmed') confirmedCountForParty++;
            } else {
              const partyRsvp = rsvps.find(
                (r) => r.partyId === party.id && !r.guestId && r.eventId === evt.id
              );
              if (partyRsvp?.status === 'confirmed') confirmedCountForParty++;
            }
          }
        } else {
          // Party has no individual guest records, check party-level RSVP
          const partyRsvp = rsvps.find(
            (r) => r.partyId === party.id && !r.guestId && r.eventId === evt.id
          );
          if (partyRsvp?.status === 'confirmed') {
            confirmedCountForParty = (party.adultsCount || 0) + (party.childrenCount || 0) || 1;
          }
        }

        if (confirmedCountForParty > 0) {
          map[evt.id].total += confirmedCountForParty;
          if (party.side === 'ladkiwale') {
            map[evt.id].brideCount += confirmedCountForParty;
          } else if (party.side === 'ladkewale') {
            map[evt.id].groomCount += confirmedCountForParty;
          } else {
            map[evt.id].mutualCount += confirmedCountForParty;
          }
        }
      }
    }

    return map;
  }, [events, rsvps, parties, guests]);

  // Compute distinct wedding dates to render in the Week View
  const calendarDays = useMemo(() => {
    const datesSet = new Set<string>();

    if (wedding.startDate && wedding.endDate) {
      const start = new Date(wedding.startDate);
      const end = new Date(wedding.endDate);

      // Add all dates between start and end
      const current = new Date(start);
      while (current <= end) {
        datesSet.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    if (wedding.primaryDate) {
      datesSet.add(wedding.primaryDate);
    }

    if (events) {
      for (const ev of events) {
        if (ev.date) datesSet.add(ev.date);
      }
    }

    const sortedDates = Array.from(datesSet).sort();
    return sortedDates;
  }, [wedding.startDate, wedding.endDate, wedding.primaryDate, events]);

  const applyTypeDefaults = (targetType: WeddingEvent['type']) => {
    const def = EVENT_TYPE_DEFAULTS[targetType];
    if (!def) return;
    setName(def.name);
    setStartTime(def.startTime);
    setEndTime(def.endTime);
    setVenue(`${wedding.venue} (${def.venueArea})`);
    setDressCode(def.dressCode);
    setNotes(def.notes);
  };

  const openAddModal = (initialDate?: string) => {
    setEditingEvent(null);
    setType('mehendi');
    setDate(initialDate || wedding.startDate);
    setSideScope('common');
    applyTypeDefaults('mehendi');
    setIsModalOpen(true);
  };

  const openEditModal = (event: WeddingEvent) => {
    setEditingEvent(event);
    setName(event.name);
    setType(event.type);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setVenue(event.venue);
    setDressCode(event.dressCode);
    setNotes(event.notes || '');
    setSideScope(event.sideScope || 'common');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingEvent) {
      await db.events.update(editingEvent.id, {
        name: name.trim(),
        type,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        dressCode: dressCode.trim(),
        notes: notes.trim(),
        sideScope,
      });
    } else {
      const newEvent: WeddingEvent = {
        id: `evt-${wedding.id}-${Date.now()}`,
        weddingId: wedding.id,
        name: name.trim(),
        type,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        dressCode: dressCode.trim(),
        notes: notes.trim(),
        orderIndex: (events?.length || 0) + 1,
        sideScope,
      };
      await db.events.put(newEvent);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this ceremony from the timeline?')) {
      await db.events.delete(id);
    }
  };

  // Export .ics calendar file for guests/planners
  const handleExportIcs = () => {
    if (!events || events.length === 0) return;

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Vivah Planner//Indian Wedding Calendar//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:${wedding.title}\n`;

    for (const ev of events) {
      const dtStart = ev.date.replace(/-/g, '') + 'T' + ev.startTime.replace(/:/g, '') + '00';
      const dtEnd = ev.date.replace(/-/g, '') + 'T' + ev.endTime.replace(/:/g, '') + '00';

      icsContent += `BEGIN:VEVENT\nUID:${ev.id}@vivahplanner.app\nSUMMARY:${ev.name} - ${wedding.brideName} & ${wedding.groomName}\nDESCRIPTION:${ev.notes || ''} Dress Code: ${ev.dressCode}\nLOCATION:${ev.venue}, ${wedding.city}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nEND:VEVENT\n`;
    }

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${wedding.title.replace(/[^a-z0-9]/gi, '_')}-schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRitualInfo = (eventType: WeddingEvent['type']) => {
    switch (eventType) {
      case 'haldi':
        return {
          icon: Sun,
          emoji: '☀️',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          accent: 'text-amber-600',
        };
      case 'mehendi':
        return {
          icon: Palette,
          emoji: '🎨',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          accent: 'text-emerald-600',
        };
      case 'sangeet':
        return {
          icon: Music,
          emoji: '🎵',
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          accent: 'text-purple-600',
        };
      case 'wedding':
        return {
          icon: Crown,
          emoji: '👑',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          accent: 'text-rose-600',
        };
      case 'reception':
        return {
          icon: Wine,
          emoji: '🥂',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          accent: 'text-blue-600',
        };
      case 'roka':
        return {
          icon: Sparkles,
          emoji: '💍',
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          accent: 'text-orange-600',
        };
      case 'cocktail':
        return {
          icon: GlassWater,
          emoji: '🍸',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          accent: 'text-indigo-600',
        };
      default:
        return {
          icon: Calendar,
          emoji: '🗓️',
          color: 'bg-stone-100 text-stone-800 border-stone-300',
          accent: 'text-stone-600',
        };
    }
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      const d = new Date(dateString + 'T12:00:00');
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-theme-primary" />
            <h2 className="text-xl font-bold font-serif text-theme-text-main">
              Ceremonies & Itinerary Calendar
            </h2>
          </div>
          <p className="text-xs text-theme-text-muted mt-1">
            Pillar 1: Coordinate date schedules, timings, ritual icons, side filters, and live RSVP expected headcounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher (Week View default vs List View) */}
          <div className="flex items-center bg-theme-background border border-theme-border rounded-xl p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'week'
                  ? 'bg-theme-card text-theme-primary shadow-2xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-theme-card text-theme-primary shadow-2xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {/* Side Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-theme-background border border-theme-border rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-theme-text-muted flex-shrink-0" />
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-theme-text-main border-none focus:outline-hidden cursor-pointer"
            >
              <option value="all">Both Sides (All Guests)</option>
              <option value="ladkiwale">{brideTerm}</option>
              <option value="ladkewale">{groomTerm}</option>
            </select>
          </div>

          <button
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
            title="Download .ics calendar file"
          >
            <Download className="w-3.5 h-3.5 text-theme-secondary" />
            <span>Export (.ics)</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Ceremony</span>
          </button>
        </div>
      </div>

      {/* Week View (Default) */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {calendarDays.map((dayDate, index) => {
              const dayEvents = (events || [])
                .filter((ev) => ev.date === dayDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              const isMuhuratDay = dayDate === wedding.primaryDate;

              return (
                <div
                  key={dayDate}
                  className={`flex flex-col rounded-3xl border transition-all overflow-hidden bg-theme-card ${
                    isMuhuratDay
                      ? 'border-theme-primary/60 shadow-md ring-1 ring-theme-primary/20'
                      : 'border-theme-border shadow-2xs hover:border-theme-border/80'
                  }`}
                >
                  {/* Day Column Header */}
                  <div
                    className={`p-4 border-b border-theme-border flex items-center justify-between ${
                      isMuhuratDay
                        ? 'bg-gradient-to-r from-theme-primary/10 via-theme-secondary/10 to-transparent'
                        : 'bg-theme-background/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                          Day {index + 1}
                        </span>
                        {isMuhuratDay && (
                          <span className="px-2 py-0.5 rounded-full bg-theme-primary text-white text-[10px] font-bold uppercase tracking-widest">
                            Muhurat
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-theme-text-main mt-0.5">
                        {formatDateDisplay(dayDate)}
                      </h4>
                    </div>

                    <button
                      onClick={() => openAddModal(dayDate)}
                      className="p-1 rounded-lg text-theme-text-muted hover:text-theme-primary hover:bg-theme-card transition-colors"
                      title="Add ceremony on this day"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day Events Column Cards */}
                  <div className="p-3 space-y-3 flex-1 flex flex-col justify-start">
                    {dayEvents.length > 0 ? (
                      dayEvents.map((event) => {
                        const ritual = getRitualInfo(event.type);
                        const counts = eventHeadcounts[event.id] || {
                          total: 0,
                          brideCount: 0,
                          groomCount: 0,
                          mutualCount: 0,
                        };

                        const displayedHeadcount =
                          sideFilter === 'ladkiwale'
                            ? counts.brideCount
                            : sideFilter === 'ladkewale'
                            ? counts.groomCount
                            : counts.total;

                        return (
                          <div
                            key={event.id}
                            className="bg-theme-background/70 border border-theme-border hover:border-theme-primary/50 rounded-2xl p-3.5 space-y-2.5 shadow-2xs hover:shadow-xs transition-all group"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ritual.color}`}
                                >
                                  <span>{ritual.emoji}</span>
                                  <span>{event.type}</span>
                                </span>
                                {event.sideScope === 'bride_only' ? (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                                    🌸 Bride Only
                                  </span>
                                ) : event.sideScope === 'groom_only' ? (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                                    👑 Groom Only
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                                    🌐 Both Sides
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-theme-text-muted opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEditModal(event)}
                                  className="p-1 rounded-md hover:text-theme-primary hover:bg-theme-card"
                                  title="Edit ceremony"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  className="p-1 rounded-md hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete ceremony"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h5 className="font-serif font-bold text-sm text-theme-text-main leading-snug">
                              {event.name}
                            </h5>

                            <div className="space-y-1 text-xs text-theme-text-muted">
                              <div className="flex items-center gap-1.5 text-theme-text-main">
                                <Clock className="w-3 h-3 text-theme-secondary flex-shrink-0" />
                                <span className="font-medium text-[11px]">
                                  {event.startTime} - {event.endTime}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-theme-accent flex-shrink-0" />
                                <span className="truncate text-[11px]">{event.venue}</span>
                              </div>
                            </div>

                            {event.dressCode && (
                              <div className="flex items-center gap-1.5 text-[11px] bg-theme-card/80 border border-theme-border/60 rounded-xl px-2 py-1 text-theme-text-main">
                                <Shirt className="w-3 h-3 text-theme-secondary flex-shrink-0" />
                                <span className="truncate">{event.dressCode}</span>
                              </div>
                            )}

                            {/* Live RSVP Expected Headcount Badge */}
                            <div className="pt-1.5 border-t border-theme-border/50 flex items-center justify-between text-[11px]">
                              <div
                                className="inline-flex items-center gap-1.5 text-theme-primary font-bold bg-theme-primary-light/40 px-2 py-0.5 rounded-lg"
                                title={`Total Attending: ${counts.total} (${counts.brideCount} Bride • ${counts.groomCount} Groom)`}
                              >
                                <Users className="w-3 h-3" />
                                <span>{displayedHeadcount} Attending</span>
                              </div>

                              {sideFilter === 'all' && (
                                <span className="text-[10px] text-theme-text-muted font-medium">
                                  {counts.brideCount}B / {counts.groomCount}G
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-theme-text-muted flex-1 flex flex-col items-center justify-center space-y-1.5">
                        <Calendar className="w-5 h-5 opacity-40" />
                        <span className="text-xs">No events scheduled</span>
                        <button
                          onClick={() => openAddModal(dayDate)}
                          className="text-[11px] font-semibold text-theme-primary hover:underline"
                        >
                          + Add ceremony
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {events && events.length > 0 ? (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-theme-border">
              {events.map((event) => {
                const ritual = getRitualInfo(event.type);
                const counts = eventHeadcounts[event.id] || {
                  total: 0,
                  brideCount: 0,
                  groomCount: 0,
                  mutualCount: 0,
                };

                const displayedHeadcount =
                  sideFilter === 'ladkiwale'
                    ? counts.brideCount
                    : sideFilter === 'ladkewale'
                    ? counts.groomCount
                    : counts.total;

                return (
                  <div key={event.id} className="relative group">
                    {/* Timeline node dot */}
                    <div className="absolute -left-[27px] sm:-left-[31px] top-4 w-5 h-5 rounded-full bg-theme-card border-4 border-theme-primary shadow-xs group-hover:scale-125 transition-transform" />

                    <div className="bg-theme-card border border-theme-border hover:border-theme-primary/60 rounded-3xl p-5 shadow-2xs hover:shadow-lg transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${ritual.color}`}
                          >
                            <span>{ritual.emoji}</span>
                            <span>{event.type}</span>
                          </span>
                          <h3 className="font-serif font-bold text-lg text-theme-text-main">
                            {event.name}
                          </h3>
                          {event.sideScope === 'bride_only' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                              🌸 Bride's Side Only
                            </span>
                          ) : event.sideScope === 'groom_only' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                              👑 Groom's Side Only
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                              🌐 Both Sides Attend
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Live RSVP Expected Headcount Badge */}
                          <div
                            className="inline-flex items-center gap-1.5 text-theme-primary font-bold bg-theme-primary-light/50 px-2.5 py-1 rounded-xl text-xs border border-theme-primary/20"
                            title={`Attending breakdown: ${counts.brideCount} ${brideTerm} • ${counts.groomCount} ${groomTerm}`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{displayedHeadcount} Attending Guests</span>
                          </div>

                          <div className="flex items-center gap-1 text-theme-text-muted ml-2">
                            <button
                              onClick={() => openEditModal(event)}
                              className="p-1.5 rounded-lg hover:text-theme-primary hover:bg-theme-background transition-colors"
                              title="Edit ceremony"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete ceremony"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-theme-border/60 pt-3">
                        <div className="flex items-center gap-2 text-theme-text-main">
                          <Calendar className="w-4 h-4 text-theme-primary flex-shrink-0" />
                          <span className="font-semibold">{event.date}</span>
                        </div>

                        <div className="flex items-center gap-2 text-theme-text-main">
                          <Clock className="w-4 h-4 text-theme-secondary flex-shrink-0" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-theme-text-main">
                          <MapPin className="w-4 h-4 text-theme-accent flex-shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      {/* Dress Code & Notes */}
                      {(event.dressCode || event.notes) && (
                        <div className="bg-theme-background/70 border border-theme-border/50 rounded-2xl p-3 text-xs space-y-1">
                          {event.dressCode && (
                            <div className="flex items-center gap-2 text-theme-text-main">
                              <Shirt className="w-3.5 h-3.5 text-theme-secondary flex-shrink-0" />
                              <span className="font-medium text-theme-text-muted">Dress Code:</span>
                              <span className="font-semibold text-theme-primary">
                                {event.dressCode}
                              </span>
                            </div>
                          )}
                          {event.notes && (
                            <div className="text-theme-text-muted italic pt-0.5">
                              "{event.notes}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-10 text-center space-y-3">
              <Calendar className="w-10 h-10 text-theme-text-muted mx-auto" />
              <h3 className="font-serif font-bold text-base text-theme-text-main">
                No Ceremonies Added
              </h3>
              <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
                Schedule functions like Mehendi, Haldi, Sangeet, and the Wedding Ceremony to build your itinerary.
              </p>
              <button
                onClick={() => openAddModal()}
                className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow hover:bg-theme-primary-hover transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Ceremony</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingEvent ? 'Edit Ceremony' : 'Add New Ceremony'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Ceremony Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Phoolon Ki Mehendi"
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-theme-text-main">Ritual / Type</label>
                    <button
                      type="button"
                      onClick={() => applyTypeDefaults(type)}
                      className="text-[11px] font-semibold text-theme-primary hover:underline flex items-center gap-1"
                      title="Pre-fill recommended details for this ceremony"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Pre-fill</span>
                    </button>
                  </div>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as WeddingEvent['type'];
                      setType(newType);
                      // If adding new ceremony, auto-prefill details
                      if (!editingEvent) {
                        applyTypeDefaults(newType);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <option value="mehendi">🎨 Mehendi</option>
                    <option value="haldi">☀️ Haldi</option>
                    <option value="sangeet">🎵 Sangeet</option>
                    <option value="wedding">👑 Wedding / Pheras</option>
                    <option value="reception">🥂 Reception</option>
                    <option value="roka">💍 Roka</option>
                    <option value="cocktail">🍸 Cocktail</option>
                    <option value="other">🗓️ Other Event</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Ceremony Attendance Scope (Requirement 7) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-text-main flex items-center justify-between">
                  <span>Ceremony Attendance Scope *</span>
                  <span className="text-[10px] text-theme-text-muted font-normal">Who attends this event?</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSideScope('common')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1 ${
                      sideScope === 'common'
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 border-purple-400 shadow-xs ring-1 ring-purple-400'
                        : 'bg-theme-background text-theme-text-muted border-theme-border hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>🌐 Joint Event</span>
                    <span className="text-[9px] font-normal opacity-80">Both Families</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSideScope('bride_only')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1 ${
                      sideScope === 'bride_only'
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 border-rose-400 shadow-xs ring-1 ring-rose-400'
                        : 'bg-theme-background text-theme-text-muted border-theme-border hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>🌸 Bride Only</span>
                    <span className="text-[9px] font-normal opacity-80">Ladkiwale Side</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSideScope('groom_only')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1 ${
                      sideScope === 'groom_only'
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-400 shadow-xs ring-1 ring-amber-400'
                        : 'bg-theme-background text-theme-text-muted border-theme-border hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>👑 Groom Only</span>
                    <span className="text-[9px] font-normal opacity-80">Ladkewale Side</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Venue / Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Mewar Lawn & Poolside"
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Dress Code Theme</label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  placeholder="e.g. Sunshine Yellow / Lehariya"
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Notes & Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, vendor POC, dhol arrival timing, etc."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted hover:bg-theme-border/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover transition-all"
                >
                  {editingEvent ? 'Save Changes' : 'Create Ceremony'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
