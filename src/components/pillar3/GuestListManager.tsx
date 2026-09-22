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
  Star,
  Baby,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface GuestListManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const RELATION_GUIDE_OPTIONS = [
  'None',
  'Bride',
  'Groom',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Bhabi (Sister-in-law)',
  'Jiju (Brother-in-law)',
  'Dada (Paternal Grandfather)',
  'Dadi (Paternal Grandmother)',
  'Nana (Maternal Grandfather)',
  'Nani (Maternal Grandmother)',
  'Chacha (Paternal Uncle)',
  'Chachi',
  'Taya (Elder Paternal Uncle)',
  'Tayi',
  'Mama (Maternal Uncle)',
  'Mami',
  'Bua (Paternal Aunt)',
  'Fufa',
  'Maasi (Maternal Aunt)',
  'Mausa',
  'Cousin',
  'Nephew',
  'Niece',
  'Close Family Friend',
  'Colleague / Peer',
  'Other Relative',
];

interface TabularMemberItem {
  id?: string;
  name: string;
  isPrimaryContact: boolean;
  ageCategory: 'adult' | 'child' | 'infant' | 'elder';
  generationLevel: number;
  relationToBride: string;
  relationToGroom: string;
  dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'vegan';
  specialAssistance?: string;
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

  const brideTerm = wedding.brideSideTerm || "Bride's Side (Ladkiwale)";
  const groomTerm = wedding.groomSideTerm || "Groom's Side (Ladkewale)";

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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Tabular Members state for Party Modal
  const [tabularMembers, setTabularMembers] = useState<TabularMemberItem[]>([]);

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

  // Calculate Metrics across guests
  const totalGuests = guests?.length || parties?.reduce((sum, p) => sum + p.adultsCount + p.childrenCount, 0) || 0;
  const adultsCount = guests?.filter((g) => g.ageCategory === 'adult').length || 0;
  const eldersCount = guests?.filter((g) => g.ageCategory === 'elder').length || 0;
  const childrenCount = guests?.filter((g) => g.ageCategory === 'child').length || 0;
  const infantsCount = guests?.filter((g) => g.ageCategory === 'infant').length || 0;

  const jainCount = guests?.filter((g) => g.dietaryPreference === 'jain').length || 0;
  const pureVegCount = guests?.filter((g) => g.dietaryPreference === 'pure_veg').length || 0;
  const nonVegCount = guests?.filter((g) => g.dietaryPreference === 'non_veg').length || 0;
  const assistanceCount = guests?.filter((g) => !!g.specialAssistance && g.specialAssistance.trim().length > 0).length || 0;

  const openAddParty = () => {
    setEditingParty(null);
    setPartyName('');
    setPrimaryContactName('');
    setPhone('');
    setEmail('');
    setSide('mutual');
    setSelectedTagIds([]);
    setNotes('');
    setTabularMembers([
      {
        name: '',
        isPrimaryContact: true,
        ageCategory: 'adult',
        generationLevel: 3,
        relationToBride: 'None',
        relationToGroom: 'None',
        dietaryPreference: 'pure_veg',
        specialAssistance: '',
      },
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
    setSelectedTagIds(party.tagIds || []);
    setNotes(party.notes || '');

    const partyGuests = await db.guests.where('partyId').equals(party.id).toArray();
    if (partyGuests.length > 0) {
      setTabularMembers(
        partyGuests.map((g) => ({
          id: g.id,
          name: g.name,
          isPrimaryContact: !!g.isPrimaryContact,
          ageCategory: g.ageCategory || 'adult',
          generationLevel: g.generationLevel || (g.ageCategory === 'elder' ? 1 : g.ageCategory === 'child' ? 4 : 3),
          relationToBride: g.relationToBride || 'None',
          relationToGroom: g.relationToGroom || 'None',
          dietaryPreference: g.dietaryPreference || 'pure_veg',
          specialAssistance: g.specialAssistance || '',
        }))
      );
    } else {
      setTabularMembers([
        {
          name: party.primaryContactName,
          isPrimaryContact: true,
          ageCategory: 'adult',
          generationLevel: 3,
          relationToBride: 'None',
          relationToGroom: 'None',
          dietaryPreference: 'pure_veg',
          specialAssistance: '',
        },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleSelectPrimaryContact = (index: number) => {
    setTabularMembers((prev) =>
      prev.map((item, i) => {
        const isSelected = i === index;
        return {
          ...item,
          isPrimaryContact: isSelected,
        };
      })
    );
    const selectedMember = tabularMembers[index];
    if (selectedMember && selectedMember.name.trim()) {
      setPrimaryContactName(selectedMember.name.trim());
    }
  };

  const handleMemberChange = <K extends keyof TabularMemberItem>(
    index: number,
    field: K,
    value: TabularMemberItem[K]
  ) => {
    setTabularMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-set generation level defaults when age category changes
      if (field === 'ageCategory') {
        if (value === 'elder' && updated[index].generationLevel > 1) {
          updated[index].generationLevel = 1;
        } else if ((value === 'child' || value === 'infant') && updated[index].generationLevel < 4) {
          updated[index].generationLevel = 4;
        }
      }

      // If updating the primary contact's name, sync primaryContactName
      if (field === 'name' && updated[index].isPrimaryContact) {
        setPrimaryContactName(String(value).trim());
      }

      return updated;
    });
  };

  const handleAddMemberRow = () => {
    setTabularMembers((prev) => [
      ...prev,
      {
        name: '',
        isPrimaryContact: prev.length === 0,
        ageCategory: 'adult',
        generationLevel: 3,
        relationToBride: 'None',
        relationToGroom: 'None',
        dietaryPreference: 'pure_veg',
        specialAssistance: '',
      },
    ]);
  };

  const handleRemoveMemberRow = (index: number) => {
    if (tabularMembers.length <= 1) return;
    setTabularMembers((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // If the removed item was primary, default the first item to primary
      if (prev[index]?.isPrimaryContact && filtered.length > 0) {
        filtered[0].isPrimaryContact = true;
        setPrimaryContactName(filtered[0].name.trim());
      }
      return filtered;
    });
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;

    const validMembers = tabularMembers.filter((m) => m.name.trim().length > 0);
    const effectivePrimary =
      validMembers.find((m) => m.isPrimaryContact)?.name.trim() ||
      primaryContactName.trim() ||
      validMembers[0]?.name.trim() ||
      partyName.trim();

    // Auto-calculate adult vs child counts from valid members
    const calcAdults = validMembers.filter((m) => m.ageCategory === 'adult' || m.ageCategory === 'elder').length || 1;
    const calcChildren = validMembers.filter((m) => m.ageCategory === 'child' || m.ageCategory === 'infant').length || 0;

    const partyId = editingParty ? editingParty.id : `pty-${Date.now()}`;

    const partyRecord: GuestParty = {
      id: partyId,
      weddingId: wedding.id,
      partyName: partyName.trim(),
      primaryContactName: effectivePrimary,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      side,
      adultsCount: calcAdults,
      childrenCount: calcChildren,
      tagIds: selectedTagIds,
      notes: notes.trim() || undefined,
    };

    await db.transaction('rw', [db.guestParties, db.guests, db.eventRsvps], async () => {
      await db.guestParties.put(partyRecord);

      // Clean existing guests for this party and re-add
      await db.guests.where('partyId').equals(partyId).delete();

      const guestRecords: Guest[] = (validMembers.length > 0
        ? validMembers
        : [
            {
              name: effectivePrimary,
              isPrimaryContact: true,
              ageCategory: 'adult' as const,
              generationLevel: 3,
              relationToBride: 'None',
              relationToGroom: 'None',
              dietaryPreference: 'pure_veg' as const,
            },
          ]
      ).map((m, idx) => ({
        id: m.id || `gst-${partyId}-${idx}-${Date.now()}`,
        partyId,
        weddingId: wedding.id,
        name: m.name.trim(),
        isPrimaryContact: !!m.isPrimaryContact,
        ageCategory: m.ageCategory,
        generationLevel: Number(m.generationLevel) || 3,
        relationToBride: m.relationToBride !== 'None' ? m.relationToBride : undefined,
        relationToGroom: m.relationToGroom !== 'None' ? m.relationToGroom : undefined,
        dietaryPreference: m.dietaryPreference,
        specialAssistance: m.specialAssistance?.trim() || undefined,
        tagIds: selectedTagIds,
      }));

      await db.guests.bulkPut(guestRecords);

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
        isPrimaryContact: true,
        ageCategory: 'adult',
        generationLevel: 3,
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

  const getAgeBadge = (age: Guest['ageCategory']) => {
    switch (age) {
      case 'elder':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span>👴</span>
            <span>Elder</span>
          </span>
        );
      case 'adult':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <span>👤</span>
            <span>Adult</span>
          </span>
        );
      case 'child':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span>🧒</span>
            <span>Child</span>
          </span>
        );
      case 'infant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 text-pink-900 border border-pink-300">
            <span>👶</span>
            <span>Infant</span>
          </span>
        );
      default:
        return null;
    }
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
              Pillar 3: Family parties, tabular members, age tiers (Adult/Elder/Child/Infant), relation guides to couple, and RSVP matrix.
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
              <span>Add Family Party</span>
            </button>
          </div>
        </div>

        {/* Analytics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-theme-border/60 pt-4">
          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-theme-text-muted">Total Headcount</div>
            <div className="text-xl font-serif font-bold text-theme-primary mt-0.5">{totalGuests} Guests</div>
            <div className="text-[10px] text-theme-text-muted">
              {adultsCount} Adults &bull; {eldersCount} Elders &bull; {childrenCount} Kids &bull; {infantsCount} Infants
            </div>
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
            <div className="text-[10px] text-theme-text-muted">Non-vegetarian guests</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-indigo-700 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Special Care</span>
            </div>
            <div className="text-xl font-serif font-bold text-indigo-700 mt-0.5">{assistanceCount}</div>
            <div className="text-[10px] text-theme-text-muted">Wheelchair / Elderly assistance</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-card border border-theme-border p-3 rounded-2xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search family name or contact..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterSide('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterSide === 'all'
                ? 'bg-theme-primary text-white shadow-2xs'
                : 'text-theme-text-muted hover:bg-theme-border/30'
            }`}
          >
            All ({parties?.length || 0})
          </button>
          <button
            onClick={() => setFilterSide('ladkewale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterSide === 'ladkewale'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-theme-text-muted hover:bg-theme-border/30'
            }`}
          >
            {groomTerm}
          </button>
          <button
            onClick={() => setFilterSide('ladkiwale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterSide === 'ladkiwale'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-theme-text-muted hover:bg-theme-border/30'
            }`}
          >
            {brideTerm}
          </button>
          <button
            onClick={() => setFilterSide('mutual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterSide === 'mutual'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-theme-text-muted hover:bg-theme-border/30'
            }`}
          >
            Mutual
          </button>
        </div>
      </div>

      {/* Guest Parties Table with Multi-Event RSVP */}
      <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-theme-border bg-theme-background/70 text-[11px] font-bold text-theme-text-muted uppercase tracking-wider">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Family Party</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                {events?.map((ev) => (
                  <th key={ev.id} className="py-3 px-2 text-center max-w-[90px]">
                    <div className="truncate text-theme-text-main font-bold" title={ev.name}>
                      {ev.name}
                    </div>
                    <div className="text-[9px] font-normal text-theme-text-muted capitalize">
                      {ev.type}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border text-xs">
              {filteredParties?.map((party) => {
                const isExpanded = expandedPartyId === party.id;
                const partyGuests = guests?.filter((g) => g.partyId === party.id) || [];
                const partyTags = allTags?.filter((t) => party.tagIds?.includes(t.id)) || [];

                return (
                  <React.Fragment key={party.id}>
                    <tr className="hover:bg-theme-background/40 transition-colors">
                      {/* Expand / Collapse */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setExpandedPartyId(isExpanded ? null : party.id)}
                          className="p-1 rounded-md hover:bg-theme-border/40 text-theme-text-muted"
                          title="View party members"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-theme-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Party Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-theme-text-main text-sm">
                          {party.partyName}
                        </div>
                        <div className="text-[11px] text-theme-text-muted flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-theme-text-main">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {party.primaryContactName}
                          </span>
                          {party.phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              {party.phone}
                            </span>
                          )}
                        </div>
                        {partyTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {partyTags.map((t) => (
                              <TagBadge key={t.id} tag={t} size="sm" />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Side Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            party.side === 'ladkiwale'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : party.side === 'ladkewale'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {party.side === 'ladkiwale'
                            ? brideTerm
                            : party.side === 'ladkewale'
                            ? groomTerm
                            : 'Mutual'}
                        </span>
                      </td>

                      {/* Headcount */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-theme-text-main text-sm">
                          {partyGuests.length > 0
                            ? partyGuests.length
                            : party.adultsCount + party.childrenCount}
                        </span>
                        <div className="text-[10px] text-theme-text-muted">
                          {partyGuests.length > 0 ? (
                            <span>
                              {partyGuests.filter((g) => g.ageCategory === 'adult').length}A &bull;{' '}
                              {partyGuests.filter((g) => g.ageCategory === 'elder').length}E &bull;{' '}
                              {partyGuests.filter((g) => g.ageCategory === 'child').length}C
                            </span>
                          ) : (
                            <span>{party.adultsCount}A + {party.childrenCount}C</span>
                          )}
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
                            title="Edit party & members"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteParty(party.id)}
                            className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete party"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Individual Guests Row */}
                    {isExpanded && (
                      <tr className="bg-theme-background/60">
                        <td colSpan={5 + (events?.length || 0)} className="py-3 px-6 sm:px-10">
                          <div className="p-4 bg-theme-card border border-theme-border/70 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-xs uppercase tracking-wider text-theme-text-muted flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-theme-primary" />
                                <span>Individual Party Members ({partyGuests.length})</span>
                              </div>
                              <button
                                onClick={() => openEditParty(party)}
                                className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit Members</span>
                              </button>
                            </div>

                            {partyGuests.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {partyGuests.map((g) => (
                                  <div
                                    key={g.id}
                                    className="p-3 rounded-xl border border-theme-border bg-theme-background flex flex-col justify-between text-xs space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div>
                                        <div className="font-bold text-theme-text-main flex items-center gap-1.5">
                                          <span>{g.name}</span>
                                          {g.isPrimaryContact && (
                                            <span
                                              className="p-0.5 rounded-full bg-amber-100 text-amber-600"
                                              title="Primary Contact"
                                            >
                                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            </span>
                                          )}
                                        </div>

                                        {/* Age Category & Generation */}
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                          {getAgeBadge(g.ageCategory)}
                                          <span className="text-[10px] text-theme-text-muted font-medium">
                                            Gen {g.generationLevel || (g.ageCategory === 'elder' ? 1 : 3)}
                                          </span>
                                        </div>
                                      </div>

                                      <span className="text-[10px] font-semibold text-theme-primary bg-theme-primary-light/50 px-2 py-0.5 rounded-md capitalize">
                                        {g.dietaryPreference.replace('_', ' ')}
                                      </span>
                                    </div>

                                    {/* Relation Guides */}
                                    <div className="border-t border-theme-border/60 pt-1.5 text-[11px] space-y-0.5">
                                      {g.relationToBride && (
                                        <div className="text-rose-800 font-medium">
                                          To Bride: <span className="font-bold">{g.relationToBride}</span>
                                        </div>
                                      )}
                                      {g.relationToGroom && (
                                        <div className="text-amber-800 font-medium">
                                          To Groom: <span className="font-bold">{g.relationToGroom}</span>
                                        </div>
                                      )}
                                      {g.specialAssistance && (
                                        <div className="text-rose-600 font-semibold flex items-center gap-1 pt-0.5">
                                          <ShieldAlert className="w-3 h-3" />
                                          <span>{g.specialAssistance}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-theme-text-muted italic">
                                No individual guest profiles added.
                              </p>
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
                  <td
                    colSpan={5 + (events?.length || 0)}
                    className="py-12 text-center text-theme-text-muted"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">No parties found.</p>
                    <p className="text-xs">Click Add Family Party or Import CSV to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Party Modal with Tabular Member Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-theme-primary text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-theme-text-main">
                    {editingParty ? 'Edit Guest Party & Members' : 'Add New Guest Party & Members'}
                  </h3>
                  <p className="text-xs text-theme-text-muted">
                    Configure family party details, primary contact, and tabular individual members with age tiers and relationship guides.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveParty} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Party Level Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Party / Family Name *</label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Malhotra Family"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">
                    Wedding Side Alignment *
                  </label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm font-semibold"
                  >
                    <option value="ladkewale">{groomTerm}</option>
                    <option value="ladkiwale">{brideTerm}</option>
                    <option value="mutual">Mutual Friends & Colleagues</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    placeholder="Auto-synced with primary member"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="text-xs font-bold text-theme-text-main">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@family.com"
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

              {/* TABULAR INDIVIDUAL MEMBER LIST */}
              <div className="border border-theme-border rounded-2xl overflow-hidden bg-theme-card">
                <div className="p-3 bg-theme-background/80 border-b border-theme-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-theme-text-main flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-theme-primary" />
                      <span>Tabular Individual Party Members ({tabularMembers.length})</span>
                    </div>
                    <p className="text-[11px] text-theme-text-muted">
                      Mark the primary contact radio, set age tier (Adult, Elder, Child, Infant), and relation guides to Bride & Groom.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMemberRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="border-b border-theme-border bg-theme-background/60 text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                        <th className="py-2.5 px-3 text-center w-12" title="Primary Contact">
                          Primary
                        </th>
                        <th className="py-2.5 px-3 min-w-[150px]">Member Name *</th>
                        <th className="py-2.5 px-3 min-w-[120px]">Age Tier</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Generation</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Relation to Bride</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Relation to Groom</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Dietary</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Special Needs</th>
                        <th className="py-2.5 px-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border/60 text-xs">
                      {tabularMembers.map((member, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-theme-background/40 transition-colors ${
                            member.isPrimaryContact ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Primary Radio */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="radio"
                              name="primaryContactSelection"
                              checked={member.isPrimaryContact}
                              onChange={() => handleSelectPrimaryContact(index)}
                              className="w-4 h-4 text-theme-primary focus:ring-theme-primary cursor-pointer"
                              title="Mark as primary contact"
                            />
                          </td>

                          {/* Member Name */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                              placeholder={`Member #${index + 1} Name`}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-theme-primary"
                              required
                            />
                          </td>

                          {/* Age Category */}
                          <td className="py-2 px-3">
                            <select
                              value={member.ageCategory}
                              onChange={(e) =>
                                handleMemberChange(index, 'ageCategory', e.target.value as any)
                              }
                              className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs font-medium cursor-pointer"
                            >
                              <option value="adult">👤 Adult (18+)</option>
                              <option value="elder">👴 Elder / Senior</option>
                              <option value="child">🧒 Child (2-12)</option>
                              <option value="infant">👶 Infant (&lt;2)</option>
                            </select>
                          </td>

                          {/* Generation Level */}
                          <td className="py-2 px-3">
                            <select
                              value={member.generationLevel}
                              onChange={(e) =>
                                handleMemberChange(index, 'generationLevel', parseInt(e.target.value) || 3)
                              }
                              className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs cursor-pointer"
                            >
                              <option value={1}>Gen 1: Elders / Grandparents</option>
                              <option value={2}>Gen 2: Parents / Uncles</option>
                              <option value={3}>Gen 3: Couple / Siblings / Cousins</option>
                              <option value={4}>Gen 4: Kids / Grandchildren</option>
                            </select>
                          </td>

                          {/* Relation to Bride */}
                          <td className="py-2 px-3">
                            <select
                              value={member.relationToBride}
                              onChange={(e) =>
                                handleMemberChange(index, 'relationToBride', e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs cursor-pointer text-rose-900"
                            >
                              {RELATION_GUIDE_OPTIONS.map((rel) => (
                                <option key={rel} value={rel}>
                                  {rel}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Relation to Groom */}
                          <td className="py-2 px-3">
                            <select
                              value={member.relationToGroom}
                              onChange={(e) =>
                                handleMemberChange(index, 'relationToGroom', e.target.value)
                              }
                              className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs cursor-pointer text-amber-900"
                            >
                              {RELATION_GUIDE_OPTIONS.map((rel) => (
                                <option key={rel} value={rel}>
                                  {rel}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Dietary Preference */}
                          <td className="py-2 px-3">
                            <select
                              value={member.dietaryPreference}
                              onChange={(e) =>
                                handleMemberChange(
                                  index,
                                  'dietaryPreference',
                                  e.target.value as any
                                )
                              }
                              className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs cursor-pointer"
                            >
                              <option value="pure_veg">Pure Veg</option>
                              <option value="jain">Jain</option>
                              <option value="non_veg">Non-Veg</option>
                              <option value="vegan">Vegan</option>
                            </select>
                          </td>

                          {/* Special Needs */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={member.specialAssistance || ''}
                              onChange={(e) =>
                                handleMemberChange(index, 'specialAssistance', e.target.value)
                              }
                              placeholder="e.g. Wheelchair"
                              className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs"
                            />
                          </td>

                          {/* Delete Row Button */}
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberRow(index)}
                              disabled={tabularMembers.length <= 1}
                              className="text-theme-text-muted hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed p-1 transition-colors"
                              title="Delete member row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 bg-theme-background/60 border-t border-theme-border flex items-center justify-between text-xs text-theme-text-muted">
                  <span>
                    Summary:{' '}
                    <strong className="text-theme-text-main">
                      {tabularMembers.filter((m) => m.ageCategory === 'adult').length} Adults,{' '}
                      {tabularMembers.filter((m) => m.ageCategory === 'elder').length} Elders,{' '}
                      {tabularMembers.filter((m) => m.ageCategory === 'child').length} Children,{' '}
                      {tabularMembers.filter((m) => m.ageCategory === 'infant').length} Infants
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMemberRow}
                    className="text-theme-primary font-bold hover:underline"
                  >
                    + Add Row
                  </button>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">
                  Party Notes & Accommodations Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Close family friends, arriving via late flight from London, prefer lake view room"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-theme-border flex items-center justify-between">
                <span className="text-[11px] text-theme-text-muted">
                  All guest members automatically sync with accommodations & vehicle seating pillars.
                </span>

                <div className="flex items-center gap-2">
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
                    {editingParty ? 'Save Changes' : 'Save Party & Guests'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
