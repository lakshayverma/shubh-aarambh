import React, { useState } from 'react';
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
  Tag,
  Shirt,
  CalendarCheck,
  Download,
  X,
  Check,
} from 'lucide-react';

interface EventsTimelineProps {
  wedding: Wedding;
}

export const EventsTimeline: React.FC<EventsTimelineProps> = ({ wedding }) => {
  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );

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

  const openAddModal = () => {
    setEditingEvent(null);
    setName('');
    setType('mehendi');
    setDate(wedding.startDate);
    setStartTime('12:00');
    setEndTime('16:00');
    setVenue(wedding.venue);
    setDressCode('');
    setNotes('');
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

  const getEventBadgeColor = (eventType: WeddingEvent['type']) => {
    switch (eventType) {
      case 'haldi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'mehendi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'sangeet':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'wedding':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'reception':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-theme-primary" />
            <h2 className="text-xl font-bold font-serif text-theme-text-main">
              Ceremonies & Itinerary Timeline
            </h2>
          </div>
          <p className="text-xs text-theme-text-muted mt-1">
            Pillar 1: Coordinate date schedules, timings, venues, and dress codes for each festive ritual.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
            title="Download .ics calendar file"
          >
            <Download className="w-3.5 h-3.5 text-theme-secondary" />
            <span>Export Calendar (.ics)</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Ceremony</span>
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {events && events.length > 0 ? (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-theme-border">
          {events.map((event, index) => {
            const badgeColor = getEventBadgeColor(event.type);

            return (
              <div key={event.id} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[27px] sm:-left-[31px] top-4 w-5 h-5 rounded-full bg-theme-card border-4 border-theme-primary shadow-xs group-hover:scale-125 transition-transform" />

                <div className="bg-theme-card border border-theme-border hover:border-theme-primary/60 rounded-3xl p-5 shadow-2xs hover:shadow-lg transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                        {event.type}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-theme-text-main">
                        {event.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-theme-text-muted">
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

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-theme-border/60 pt-3">
                    <div className="flex items-center gap-2 text-theme-text-main">
                      <Calendar className="w-4 h-4 text-theme-primary flex-shrink-0" />
                      <span className="font-semibold">{event.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-theme-text-main">
                      <Clock className="w-4 h-4 text-theme-secondary flex-shrink-0" />
                      <span>{event.startTime} - {event.endTime}</span>
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
                          <span className="font-semibold text-theme-primary">{event.dressCode}</span>
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
          <h3 className="font-serif font-bold text-base text-theme-text-main">No Ceremonies Added</h3>
          <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
            Schedule functions like Mehendi, Haldi, Sangeet, and the Wedding Ceremony to build your itinerary.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow hover:bg-theme-primary-hover transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Ceremony</span>
          </button>
        </div>
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
                  <label className="text-xs font-bold text-theme-text-main">Ritual / Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WeddingEvent['type'])}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value="mehendi">Mehendi</option>
                    <option value="haldi">Haldi</option>
                    <option value="sangeet">Sangeet</option>
                    <option value="wedding">Wedding / Pheras</option>
                    <option value="reception">Reception</option>
                    <option value="roka">Roka</option>
                    <option value="cocktail">Cocktail</option>
                    <option value="other">Other Event</option>
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
