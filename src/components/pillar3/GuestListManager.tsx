import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, GuestParty, Guest, EventRsvp, WeddingEvent } from '../../db/schema';
import { TagBadge } from '../tags/TagBadge';
import { TagSelector } from '../tags/TagSelector';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Upload,
  CheckCircle2,
  Utensils,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  X,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

interface GuestListManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const GuestListManager: React.FC<GuestListManagerProps> = ({
  wedding,
  onOpenTagManager,
}) => {
  const parties = useLiveQuery(
    () => db.guestParties.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const guests = useLiveQuery(
    () => db.guests.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );
  const rsvps = useLiveQuery(
    () => db.eventRsvps.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const allTags = useLiveQuery(() => db.tags.toArray());

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSide, setFilterSide] = useState<string>('all');
  const [expandedPartyId, setExpandedPartyId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<GuestParty | null>(null);

  // Form States
  const [partyName, setPartyName] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [side, setSide] = useState<'ladkiwale' | 'ladkewale' | 'mutual'>('mutual');
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Individual guests list for the party in modal
  const [modalGuests, setModalGuests] = useState<
    { name: string; ageCategory: 'adult' | 'child' | 'infant' | 'elder'; dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'vegan'; specialAssistance?: string }[]
  >([]);

  // CSV file ref
  const csvFileRef = useRef<HTMLInputElement>(null);

  // Filtered parties
  const filteredParties = parties?.filter((p) => {
    const matchesSearch =
      p.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryContactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide = filterSide === 'all' || p.side === filterSide;
    return matchesSearch && matchesSide;
  });

  // Calculate Metrics
  const totalGuests = parties?.reduce((sum, p) => sum + p.adultsCount + p.childrenCount, 0) || 0;
  const totalAdults = parties?.reduce((sum, p) => sum + p.adultsCount, 0) || 0;
  const totalChildren = parties?.reduce((sum, p) => sum + p.childrenCount, 0) || 0;

  const jainCount = guests?.filter((g) => g.dietaryPreference === 'jain').length || 0;
  const pureVegCount = guests?.filter((g) => g.dietaryPreference === 'pure_veg').length || 0;
  const nonVegCount = guests?.filter((g) => g.dietaryPreference === 'non_veg').length || 0;

  const openAddParty = () => {
    setEditingParty(null);
    setPartyName('');
    setPrimaryContactName('');
    setPhone('');
    setEmail('');
    setSide('mutual');
    setAdultsCount(2);
    setChildrenCount(0);
    setSelectedTagIds([]);
    setNotes('');
    setModalGuests([
      { name: '', ageCategory: 'adult', dietaryPreference: 'pure_veg' },
      { name: '', ageCategory: 'adult', dietaryPreference: 'pure_veg' },
    ]);
    setIsModalOpen(true);
  };

  const openEditParty = async (party: GuestParty) => {
    setEditingParty(party);
    setPartyName(party.partyName);
    setPrimaryContactName(party.primaryContactName);
    setPhone(party.phone || '');
    setEmail(party.email || '');
    setSide(party.side);
    setAdultsCount(party.adultsCount);
    setChildrenCount(party.childrenCount);
    setSelectedTagIds(party.tagIds || []);
    setNotes(party.notes || '');

    const partyGuests = await db.guests.where('partyId').equals(party.id).toArray();
    if (partyGuests.length > 0) {
      setModalGuests(
        partyGuests.map((g) => ({
          name: g.name,
          ageCategory: g.ageCategory,
          dietaryPreference: g.dietaryPreference,
          specialAssistance: g.specialAssistance,
        }))
      );
    } else {
      setModalGuests([{ name: party.primaryContactName, ageCategory: 'adult', dietaryPreference: 'pure_veg' }]);
    }
    setIsModalOpen(true);
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || !primaryContactName.trim()) return;

    const partyId = editingParty ? editingParty.id : `pty-${Date.now()}`;

    const partyRecord: GuestParty = {
      id: partyId,
      weddingId: wedding.id,
      partyName: partyName.trim(),
      primaryContactName: primaryContactName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      side,
      adultsCount: Number(adultsCount),
      childrenCount: Number(childrenCount),
      tagIds: selectedTagIds,
      notes: notes.trim() || undefined,
    };

    await db.transaction('rw', [db.guestParties, db.guests, db.eventRsvps], async () => {
      await db.guestParties.put(partyRecord);

      // Clean existing guests for this party and re-add
      await db.guests.where('partyId').equals(partyId).delete();

      const guestRecords: Guest[] = modalGuests
        .filter((g) => g.name.trim().length > 0)
        .map((g, idx) => ({
          id: `gst-${partyId}-${idx}`,
          partyId,
          weddingId: wedding.id,
          name: g.name.trim(),
          ageCategory: g.ageCategory,
          dietaryPreference: g.dietaryPreference,
          specialAssistance: g.specialAssistance?.trim() || undefined,
        }));

      if (guestRecords.length > 0) {
        await db.guests.bulkPut(guestRecords);
      }

      // Auto-assign RSVP for all events if new party
      if (!editingParty && events) {
        const initialRsvps: EventRsvp[] = events.map((ev) => ({
          id: `rsvp-${partyId}-${ev.id}`,
          weddingId: wedding.id,
          partyId,
          eventId: ev.id,
          status: 'confirmed',
        }));
        await db.eventRsvps.bulkPut(initialRsvps);
      }
    });

    setIsModalOpen(false);
  };

  const handleDeleteParty = async (id: string) => {
    if (confirm('Delete this family party and all associated guests?')) {
      await db.transaction('rw', [db.guestParties, db.guests, db.eventRsvps], async () => {
        await db.guestParties.delete(id);
        await db.guests.where('partyId').equals(id).delete();
        await db.eventRsvps.where('partyId').equals(id).delete();
      });
    }
  };

  const toggleEventRsvp = async (partyId: string, eventId: string) => {
    const existing = rsvps?.find((r) => r.partyId === partyId && r.eventId === eventId);
    if (existing) {
      const nextStatus = existing.status === 'confirmed' ? 'declined' : 'confirmed';
      await db.eventRsvps.update(existing.id, { status: nextStatus });
    } else {
      await db.eventRsvps.put({
        id: `rsvp-${partyId}-${eventId}`,
        weddingId: wedding.id,
        partyId,
        eventId,
        status: 'confirmed',
      });
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!parties || parties.length === 0) {
      alert('No guests to export.');
      return;
    }

    let csv = 'Party Name,Primary Contact,Phone,Email,Side,Adults,Children,Notes\n';
    for (const p of parties) {
      csv += `"${p.partyName}","${p.primaryContactName}","${p.phone || ''}","${p.email || ''}","${p.side}",${p.adultsCount},${p.childrenCount},"${p.notes || ''}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${wedding.title.replace(/[^a-z0-9]/gi, '_')}-guest-list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const importedParties: GuestParty[] = [];
    const importedGuests: Guest[] = [];

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 2) continue;

      const pName = parts[0] || 'Guest Family';
      const contact = parts[1] || 'Primary Contact';
      const pPhone = parts[2] || undefined;
      const pEmail = parts[3] || undefined;
      const pSide = (['ladkiwale', 'ladkewale', 'mutual'].includes(parts[4]) ? parts[4] : 'mutual') as any;
      const adults = parseInt(parts[5]) || 2;
      const children = parseInt(parts[6]) || 0;
      const pNotes = parts[7] || undefined;

      const partyId = `pty-csv-${Date.now()}-${i}`;
      importedParties.push({
        id: partyId,
        weddingId: wedding.id,
        partyName: pName,
        primaryContactName: contact,
        phone: pPhone,
        email: pEmail,
        side: pSide,
        adultsCount: adults,
        childrenCount: children,
        tagIds: [],
        notes: pNotes,
      });

      importedGuests.push({
        id: `gst-${partyId}-1`,
        partyId,
        weddingId: wedding.id,
        name: contact,
        ageCategory: 'adult',
        dietaryPreference: 'pure_veg',
      });
    }

    if (importedParties.length > 0) {
      await db.transaction('rw', [db.guestParties, db.guests], async () => {
        await db.guestParties.bulkPut(importedParties);
        await db.guests.bulkPut(importedGuests);
      });
      alert(`Imported ${importedParties.length} parties from CSV!`);
    }

    if (csvFileRef.current) csvFileRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Metrics */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                Guest List & Multi-Event RSVP
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 3: Family unit groupings, dietary preferences, ceremony attendance matrix, and CSV sync.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-theme-primary" />
              <span>Export CSV</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Import CSV</span>
              <input
                ref={csvFileRef}
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                className="hidden"
              />
            </label>

            <button
              onClick={openAddParty}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Family / Party</span>
            </button>
          </div>
        </div>

        {/* Analytics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-theme-border/60 pt-4">
          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-theme-text-muted">Total Headcount</div>
            <div className="text-xl font-serif font-bold text-theme-primary mt-0.5">{totalGuests} Guests</div>
            <div className="text-[10px] text-theme-text-muted">{totalAdults} Adults &bull; {totalChildren} Kids</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
              <Utensils className="w-3 h-3" />
              <span>Pure Veg</span>
            </div>
            <div className="text-xl font-serif font-bold text-emerald-700 mt-0.5">{pureVegCount}</div>
            <div className="text-[10px] text-theme-text-muted">Traditional vegetarian</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Jain Meals</span>
            </div>
            <div className="text-xl font-serif font-bold text-amber-700 mt-0.5">{jainCount}</div>
            <div className="text-[10px] text-theme-text-muted">No root vegetables</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1">
              <Utensils className="w-3 h-3" />
              <span>Non-Veg</span>
            </div>
            <div className="text-xl font-serif font-bold text-rose-700 mt-0.5">{nonVegCount}</div>
            <div className="text-[10px] text-theme-text-muted">Continental / Non-veg</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-theme-text-muted">Parties / Families</div>
            <div className="text-xl font-serif font-bold text-theme-secondary mt-0.5">{parties?.length || 0}</div>
            <div className="text-[10px] text-theme-text-muted">Invited units</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search party or guest name..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-theme-border bg-theme-card text-xs sm:text-sm text-theme-text-main focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-theme-text-muted font-medium">Side:</span>
          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-main"
          >
            <option value="all">All Sides</option>
            <option value="ladkewale">Groom's Side (Ladkewale)</option>
            <option value="ladkiwale">Bride's Side (Ladkiwale)</option>
            <option value="mutual">Mutual Friends & Colleagues</option>
          </select>
        </div>
      </div>

      {/* Multi-Event RSVP Matrix Table */}
      <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-theme-background border-b border-theme-border text-theme-text-muted font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Party & Family Unit</th>
                <th className="py-3.5 px-3">Side</th>
                <th className="py-3.5 px-3 text-center">Headcount</th>
                {events?.map((ev) => (
                  <th key={ev.id} className="py-3.5 px-2 text-center whitespace-nowrap" title={ev.name}>
                    {ev.type.toUpperCase()}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-theme-border/60">
              {filteredParties?.map((party) => {
                const partyGuests = guests?.filter((g) => g.partyId === party.id) || [];
                const isExpanded = expandedPartyId === party.id;

                return (
                  <React.Fragment key={party.id}>
                    <tr className="hover:bg-theme-background/50 transition-colors">
                      {/* Party details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedPartyId(isExpanded ? null : party.id)}
                            className="p-1 rounded-lg text-theme-text-muted hover:text-theme-text-main"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <div className="font-bold text-sm text-theme-text-main flex items-center gap-2">
                              <span>{party.partyName}</span>
                              {party.tagIds?.map((tId) => {
                                const t = allTags?.find((tag) => tag.id === tId);
                                return t ? <TagBadge key={t.id} tag={t} size="sm" showLabel={false} /> : null;
                              })}
                            </div>
                            <div className="text-xs text-theme-text-muted flex items-center gap-3 mt-0.5">
                              <span>{party.primaryContactName}</span>
                              {party.phone && <span>&bull; {party.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Side */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            party.side === 'ladkewale'
                              ? 'bg-amber-100 text-amber-800'
                              : party.side === 'ladkiwale'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {party.side}
                        </span>
                      </td>

                      {/* Headcount */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-theme-text-main text-sm">{party.adultsCount + party.childrenCount}</span>
                        <div className="text-[10px] text-theme-text-muted">
                          {party.adultsCount}A {party.childrenCount > 0 && `+ ${party.childrenCount}C`}
                        </div>
                      </td>

                      {/* Multi-event RSVP checkboxes */}
                      {events?.map((ev) => {
                        const rsvp = rsvps?.find((r) => r.partyId === party.id && r.eventId === ev.id);
                        const isConfirmed = rsvp?.status === 'confirmed';

                        return (
                          <td key={ev.id} className="py-3 px-2 text-center">
                            <button
                              onClick={() => toggleEventRsvp(party.id, ev.id)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto transition-all ${
                                isConfirmed
                                  ? 'bg-emerald-500 text-white shadow-xs scale-105'
                                  : 'bg-theme-border/50 text-theme-text-muted hover:bg-theme-border'
                              }`}
                              title={`${ev.name}: ${isConfirmed ? 'Attending' : 'Not attending'} (Click to toggle)`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditParty(party)}
                            className="p-1.5 text-theme-text-muted hover:text-theme-primary rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteParty(party.id)}
                            className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Individual Guests Row */}
                    {isExpanded && (
                      <tr className="bg-theme-background/60">
                        <td colSpan={4 + (events?.length || 0)} className="py-3 px-8">
                          <div className="p-3 bg-theme-card border border-theme-border/70 rounded-2xl space-y-2">
                            <div className="font-bold text-[11px] uppercase tracking-wider text-theme-text-muted">
                              Individual Party Members ({partyGuests.length})
                            </div>
                            {partyGuests.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {partyGuests.map((g) => (
                                  <div key={g.id} className="p-2 rounded-xl border border-theme-border bg-theme-background flex items-center justify-between text-xs">
                                    <div>
                                      <div className="font-bold text-theme-text-main">{g.name}</div>
                                      <div className="text-[10px] text-theme-text-muted capitalize">
                                        {g.ageCategory} &bull; <span className="font-semibold text-theme-primary">{g.dietaryPreference.replace('_', ' ')}</span>
                                      </div>
                                    </div>
                                    {g.specialAssistance && (
                                      <span className="text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                                        {g.specialAssistance}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-theme-text-muted italic">No individual guest profiles added.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {(!filteredParties || filteredParties.length === 0) && (
                <tr>
                  <td colSpan={4 + (events?.length || 0)} className="py-12 text-center text-theme-text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">No parties found.</p>
                    <p className="text-xs">Click Add Family / Party or Import CSV to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Party Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingParty ? 'Edit Guest Party' : 'Add New Guest Party'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParty} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Party / Family Name *</label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Malhotra Family"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Primary Contact Person *</label>
                  <input
                    type="text"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Side</label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value="ladkewale">Ladkewale</option>
                    <option value="ladkiwale">Ladkiwale</option>
                    <option value="mutual">Mutual Friends</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Adults Count</label>
                  <input
                    type="number"
                    min="1"
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Children Count</label>
                  <input
                    type="number"
                    min="0"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Tag Selector */}
              <TagSelector
                weddingId={wedding.id}
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
                onOpenManager={onOpenTagManager}
              />

              {/* Individual Guest Profiles */}
              <div className="border-t border-theme-border/60 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-theme-text-main">
                    Individual Member Dietary Preferences
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setModalGuests((prev) => [
                        ...prev,
                        { name: '', ageCategory: 'adult', dietaryPreference: 'pure_veg' },
                      ])
                    }
                    className="text-[11px] font-semibold text-theme-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {modalGuests.map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={g.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModalGuests((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder={`Member #${idx + 1} Name`}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs"
                      />

                      <select
                        value={g.dietaryPreference}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setModalGuests((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, dietaryPreference: val } : item))
                          );
                        }}
                        className="px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs"
                      >
                        <option value="pure_veg">Pure Veg</option>
                        <option value="jain">Jain</option>
                        <option value="non_veg">Non-Veg</option>
                        <option value="vegan">Vegan</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setModalGuests((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-theme-text-muted hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Special Notes / Requests</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP close family friends, require wheelchair assistance at wedding entrance"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  {editingParty ? 'Save Changes' : 'Add Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
