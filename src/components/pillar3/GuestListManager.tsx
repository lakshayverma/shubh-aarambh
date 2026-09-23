import React, { useState, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, GuestParty, Guest, EventRsvp } from '../../db/schema';
import { TagBadge } from '../tags/TagBadge';
import { TagSelector } from '../tags/TagSelector';
import { FamilyManager } from '../pillar2/FamilyManager';
import { NestedScreen } from '../common/NestedScreen';
import { Tooltip } from '../common/Tooltip';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldAlert,
  GitGraph,
  LayoutList,
  Crown,
  Heart,
  Save,
  Check,
  Briefcase,
  Filter,
  Sparkles,
  MessageCircle,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface GuestListManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const INDIAN_WEDDING_ROLE_PRESETS = [
  'Chief Host (Ladkewale)',
  'Chief Host (Ladkiwale)',
  'Baraat & Safa Coordinator',
  'Varmala & Stage Coordinator',
  'Pooja & Rituals Lead',
  'Bride Squad & Joota Chupai Lead',
  'Groom Squad & Varmala Shield',
  'Catering & Food Hospitality Lead',
  'Room Key & Welcome Kit Lead',
  'Transport & Airport Pickup POC',
  'Shagun & Cash Gifts In-charge',
  'Panditji & Samagri Coordinator',
  'DJ & Sangeet Performance Lead',
  'Family Elder & Blessings Lead',
];

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
  phone?: string;
  email?: string;
  address?: string;
  isCoreFamily?: boolean;
  roleTitle?: string;
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

  // Sub-navigation view state (Unified Guests & Family Hub)
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'tree' | 'core_family'>('directory');
  const [expandAllParties, setExpandAllParties] = useState(true);
  const [expandedPartyIds, setExpandedPartyIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSide, setFilterSide] = useState<string>('all');

  // Drawer Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<GuestParty | null>(null);

  // Form Fields
  const [partyName, setPartyName] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [side, setSide] = useState<'ladkiwale' | 'ladkewale' | 'mutual'>('mutual');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [tabularMembers, setTabularMembers] = useState<TabularMemberItem[]>([]);

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
  const coreFamilyCount = guests?.filter((g) => !!g.isCoreFamily).length || 0;

  // Core Family & Operational Roles Sub-Tab State
  const [coreSearchQuery, setCoreSearchQuery] = useState('');
  const [coreRoleCategoryFilter, setCoreRoleCategoryFilter] = useState<
    'all' | 'assigned_role' | 'core_family' | 'elders' | 'squad'
  >('all');
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [editingRoleGuest, setEditingRoleGuest] = useState<Guest | null>(null);
  const [roleInput, setRoleInput] = useState('');
  const [isRoleCoreToggle, setIsRoleCoreToggle] = useState(false);

  const [isAddCoreDrawerOpen, setIsAddCoreDrawerOpen] = useState(false);
  const [selectedGuestIdToAdd, setSelectedGuestIdToAdd] = useState('');
  const [newCoreRoleInput, setNewCoreRoleInput] = useState('');

  // Fast map of partyId -> GuestParty
  const partyMap = useMemo(() => {
    const map = new Map<string, GuestParty>();
    if (parties) {
      for (const p of parties) map.set(p.id, p);
    }
    return map;
  }, [parties]);

  // Core tag IDs
  const coreTagIds = useMemo(() => {
    const set = new Set<string>();
    if (allTags) {
      for (const t of allTags) {
        const lower = t.name.toLowerCase();
        if (lower.includes('core') || lower.includes('host') || lower.includes('vip')) {
          set.add(t.id);
        }
      }
    }
    return set;
  }, [allTags]);

  // Filter core and role members directly from guests collection
  const allCoreAndRoleGuests = useMemo<Guest[]>(() => {
    if (!guests) return [];
    return guests.filter((g: Guest) => {
      const isCore = !!g.isCoreFamily;
      const hasRole = !!g.roleTitle && g.roleTitle.trim() !== '';
      const hasEventRole = !!g.assignedEventRoles && g.assignedEventRoles.length > 0;
      const hasCoreTag = !!g.tagIds && g.tagIds.some((tid) => coreTagIds.has(tid));
      return isCore || hasRole || hasEventRole || hasCoreTag;
    });
  }, [guests, coreTagIds]);

  // Filter by search query and category filter
  const filteredCoreGuests = useMemo<Guest[]>(() => {
    return allCoreAndRoleGuests.filter((g: Guest) => {
      const party = partyMap.get(g.partyId);
      const matchesSearch =
        coreSearchQuery.trim() === '' ||
        g.name.toLowerCase().includes(coreSearchQuery.toLowerCase()) ||
        (g.roleTitle && g.roleTitle.toLowerCase().includes(coreSearchQuery.toLowerCase())) ||
        (g.relationToGroom && g.relationToGroom.toLowerCase().includes(coreSearchQuery.toLowerCase())) ||
        (g.relationToBride && g.relationToBride.toLowerCase().includes(coreSearchQuery.toLowerCase())) ||
        (party?.partyName && party.partyName.toLowerCase().includes(coreSearchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (coreRoleCategoryFilter === 'assigned_role') {
        return !!g.roleTitle && g.roleTitle.trim() !== '';
      }
      if (coreRoleCategoryFilter === 'core_family') {
        return !!g.isCoreFamily;
      }
      if (coreRoleCategoryFilter === 'elders') {
        return g.ageCategory === 'elder' || g.generationLevel === 1 || g.generationLevel === 2;
      }
      if (coreRoleCategoryFilter === 'squad') {
        return (
          g.ageCategory === 'adult' &&
          ((g.roleTitle && g.roleTitle.toLowerCase().includes('squad')) ||
            (g.relationToBride && g.relationToBride.toLowerCase().includes('sister')) ||
            (g.relationToGroom && g.relationToGroom.toLowerCase().includes('brother')) ||
            (g.relationToGroom && g.relationToGroom.toLowerCase().includes('friend')) ||
            (g.relationToBride && g.relationToBride.toLowerCase().includes('friend')))
        );
      }
      return true;
    });
  }, [allCoreAndRoleGuests, coreSearchQuery, coreRoleCategoryFilter, partyMap]);

  // Partition into Groom Core Family vs Bride Core Family vs Mutual
  const { groomCoreMembers, brideCoreMembers, mutualCoreMembers } = useMemo(() => {
    const groomList: Guest[] = [];
    const brideList: Guest[] = [];
    const mutualList: Guest[] = [];

    for (const g of filteredCoreGuests) {
      const party = partyMap.get(g.partyId);
      const isGroomSide =
        party?.side === 'ladkewale' ||
        (g.relationToGroom && g.relationToGroom !== 'None') ||
        (party?.partyName && party.partyName.toLowerCase().includes('verma')) ||
        (party?.partyName && party.partyName.toLowerCase().includes('groom'));

      const isBrideSide =
        party?.side === 'ladkiwale' ||
        (g.relationToBride && g.relationToBride !== 'None') ||
        (party?.partyName && party.partyName.toLowerCase().includes('sharma')) ||
        (party?.partyName && party.partyName.toLowerCase().includes('bride'));

      if (isGroomSide && !isBrideSide) {
        groomList.push(g);
      } else if (isBrideSide && !isGroomSide) {
        brideList.push(g);
      } else if (isGroomSide && isBrideSide) {
        if (party?.side === 'ladkiwale') brideList.push(g);
        else groomList.push(g);
      } else {
        if (party?.side === 'ladkewale') groomList.push(g);
        else if (party?.side === 'ladkiwale') brideList.push(g);
        else mutualList.push(g);
      }
    }
    return { groomCoreMembers: groomList, brideCoreMembers: brideList, mutualCoreMembers: mutualList };
  }, [filteredCoreGuests, partyMap]);

  const toggleCoreStatus = async (guest: Guest, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await db.guests.update(guest.id, { isCoreFamily: !guest.isCoreFamily });
  };

  const handleOpenAssignRole = (guest: Guest, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRoleGuest(guest);
    setRoleInput(guest.roleTitle || '');
    setIsRoleCoreToggle(!!guest.isCoreFamily);
    setIsRoleDrawerOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleGuest) return;
    await db.guests.update(editingRoleGuest.id, {
      roleTitle: roleInput.trim() || undefined,
      isCoreFamily: isRoleCoreToggle,
    });
    setIsRoleDrawerOpen(false);
    setEditingRoleGuest(null);
  };

  const handleAddGuestToCore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestIdToAdd) return;
    await db.guests.update(selectedGuestIdToAdd, {
      isCoreFamily: true,
      roleTitle: newCoreRoleInput.trim() || undefined,
    });
    setSelectedGuestIdToAdd('');
    setNewCoreRoleInput('');
    setIsAddCoreDrawerOpen(false);
  };

  const togglePartyExpand = (partyId: string) => {
    setExpandedPartyIds((prev) => {
      const next = new Set(prev);
      if (next.has(partyId)) {
        next.delete(partyId);
      } else {
        next.add(partyId);
      }
      return next;
    });
  };

  const isPartyExpanded = (partyId: string) => {
    return expandAllParties || expandedPartyIds.has(partyId);
  };

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
        phone: '',
        email: '',
        address: '',
        isCoreFamily: false,
      },
    ]);
    setIsDrawerOpen(true);
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
          phone: g.phone || '',
          email: g.email || '',
          address: g.address || '',
          isCoreFamily: !!g.isCoreFamily,
          roleTitle: g.roleTitle || '',
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
          phone: party.phone || '',
          email: party.email || '',
          address: '',
          isCoreFamily: false,
        },
      ]);
    }
    setIsDrawerOpen(true);
  };

  const handleSelectPrimaryContact = (index: number) => {
    setTabularMembers((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimaryContact: i === index,
      }))
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

      if (field === 'ageCategory') {
        if (value === 'elder' && updated[index].generationLevel > 1) {
          updated[index].generationLevel = 1;
        } else if ((value === 'child' || value === 'infant') && updated[index].generationLevel < 4) {
          updated[index].generationLevel = 4;
        }
      }

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
        phone: '',
        email: '',
        address: '',
        isCoreFamily: false,
      },
    ]);
  };

  const handleRemoveMemberRow = (index: number) => {
    if (tabularMembers.length <= 1) return;
    setTabularMembers((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
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
        phone: m.phone?.trim() || undefined,
        email: m.email?.trim() || undefined,
        address: m.address?.trim() || undefined,
        isCoreFamily: !!m.isCoreFamily,
        roleTitle: m.roleTitle?.trim() || undefined,
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

    setIsDrawerOpen(false);
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

  const isGuestConfirmed = (guestId: string, partyId: string, eventId: string): boolean => {
    const directRsvp = rsvps?.find((r) => r.guestId === guestId && r.eventId === eventId);
    if (directRsvp) {
      return directRsvp.status === 'confirmed';
    }
    const partyRsvp = rsvps?.find((r) => r.partyId === partyId && !r.guestId && r.eventId === eventId);
    return partyRsvp?.status === 'confirmed';
  };

  const getPartyEventStats = (party: GuestParty, eventId: string) => {
    const partyMembers = guests?.filter((g) => g.partyId === party.id) || [];
    if (partyMembers.length === 0) {
      const partyRsvp = rsvps?.find((r) => r.partyId === party.id && !r.guestId && r.eventId === eventId);
      const isConfirmed = partyRsvp?.status === 'confirmed';
      const total = (party.adultsCount || 0) + (party.childrenCount || 0) || 1;
      return {
        confirmedCount: isConfirmed ? total : 0,
        totalCount: total,
        isAllConfirmed: isConfirmed,
        isPartial: false,
      };
    }

    let confirmedCount = 0;
    for (const member of partyMembers) {
      if (isGuestConfirmed(member.id, party.id, eventId)) {
        confirmedCount++;
      }
    }

    return {
      confirmedCount,
      totalCount: partyMembers.length,
      isAllConfirmed: confirmedCount === partyMembers.length,
      isPartial: confirmedCount > 0 && confirmedCount < partyMembers.length,
    };
  };

  const toggleIndividualGuestRsvp = async (guestId: string, partyId: string, eventId: string) => {
    const currentlyConfirmed = isGuestConfirmed(guestId, partyId, eventId);
    const nextStatus = currentlyConfirmed ? 'declined' : 'confirmed';

    const existingDirect = rsvps?.find((r) => r.guestId === guestId && r.eventId === eventId);
    if (existingDirect) {
      await db.eventRsvps.update(existingDirect.id, { status: nextStatus });
    } else {
      await db.eventRsvps.put({
        id: `rsvp-${guestId}-${eventId}`,
        weddingId: wedding.id,
        partyId,
        guestId,
        eventId,
        status: nextStatus,
      });
    }
  };

  const toggleWholePartyRsvp = async (partyId: string, eventId: string) => {
    const party = parties?.find((p) => p.id === partyId);
    if (!party) return;

    const stats = getPartyEventStats(party, eventId);
    const nextStatus = stats.isAllConfirmed ? 'declined' : 'confirmed';
    const partyMembers = guests?.filter((g) => g.partyId === partyId) || [];

    await db.transaction('rw', [db.eventRsvps], async () => {
      const existingPartyRsvp = rsvps?.find(
        (r) => r.partyId === partyId && !r.guestId && r.eventId === eventId
      );
      if (existingPartyRsvp) {
        await db.eventRsvps.update(existingPartyRsvp.id, { status: nextStatus });
      } else {
        await db.eventRsvps.put({
          id: `rsvp-${partyId}-${eventId}`,
          weddingId: wedding.id,
          partyId,
          eventId,
          status: nextStatus,
        });
      }

      for (const m of partyMembers) {
        const existingMemberRsvp = rsvps?.find(
          (r) => r.guestId === m.id && r.eventId === eventId
        );
        if (existingMemberRsvp) {
          await db.eventRsvps.update(existingMemberRsvp.id, { status: nextStatus });
        } else {
          await db.eventRsvps.put({
            id: `rsvp-${m.id}-${eventId}`,
            weddingId: wedding.id,
            partyId,
            guestId: m.id,
            eventId,
            status: nextStatus,
          });
        }
      }
    });
  };

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

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const importedParties: GuestParty[] = [];
    const importedGuests: Guest[] = [];

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

  const getAgeBadge = (age?: Guest['ageCategory']) => {
    switch (age) {
      case 'elder':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span>👴 Elder</span>
          </span>
        );
      case 'adult':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <span>👤 Adult</span>
          </span>
        );
      case 'child':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span>🧒 Child</span>
          </span>
        );
      case 'infant':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-900 border border-pink-300">
            <span>👶 Infant</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Unified Guests & Family Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-card border border-theme-border p-3 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-theme-primary-light text-theme-primary flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-theme-text-main leading-tight">
              Guests & Family Hub
            </h2>
            <p className="text-[11px] text-theme-text-muted">
              Unified directory, multi-event RSVP matrix, and genealogical tree
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-theme-background border border-theme-border rounded-xl p-1 text-xs self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'directory'
                ? 'bg-theme-card text-theme-primary shadow-xs'
                : 'text-theme-text-muted hover:text-theme-text-main'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Directory & RSVP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'tree'
                ? 'bg-theme-card text-theme-primary shadow-xs'
                : 'text-theme-text-muted hover:text-theme-text-main'
            }`}
          >
            <GitGraph className="w-3.5 h-3.5" />
            <span>Family Tree Graph</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('core_family')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'core_family'
                ? 'bg-theme-card text-theme-primary shadow-xs'
                : 'text-theme-text-muted hover:text-theme-text-main'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Core Family & Roles</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Family Tree Graph View */}
      {activeSubTab === 'tree' && (
        <FamilyManager
          wedding={wedding}
          onOpenTagManager={onOpenTagManager}
          defaultView="graph"
          hideHeader={true}
        />
      )}

      {/* SUB-VIEW 2: Unified Core Family & Roles Hub (Filtered from Guests) */}
      {activeSubTab === 'core_family' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-theme-card border border-theme-border p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Total Core & Roles
              </span>
              <div className="text-2xl font-bold font-serif text-theme-primary">
                {allCoreAndRoleGuests.length}
              </div>
            </div>
            <div className="bg-theme-card border border-amber-200/80 p-3.5 rounded-2xl shadow-2xs bg-amber-50/20">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                {groomTerm}
              </span>
              <div className="text-2xl font-bold font-serif text-amber-700">
                {groomCoreMembers.length}
              </div>
            </div>
            <div className="bg-theme-card border border-rose-200/80 p-3.5 rounded-2xl shadow-2xs bg-rose-50/20">
              <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
                {brideTerm}
              </span>
              <div className="text-2xl font-bold font-serif text-rose-700">
                {brideCoreMembers.length}
              </div>
            </div>
            <div className="bg-theme-card border border-indigo-200/80 p-3.5 rounded-2xl shadow-2xs bg-indigo-50/20">
              <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">
                Assigned Roles
              </span>
              <div className="text-2xl font-bold font-serif text-indigo-700">
                {allCoreAndRoleGuests.filter((g) => !!g.roleTitle).length}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-theme-card p-4 rounded-2xl border border-theme-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={coreSearchQuery}
                onChange={(e) => setCoreSearchQuery(e.target.value)}
                placeholder="Search core members, roles, relation..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm text-theme-text-main"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-semibold">
              {[
                { id: 'all', label: 'All Core & Roles' },
                { id: 'assigned_role', label: 'Has Assigned Role' },
                { id: 'core_family', label: 'Core Flagged' },
                { id: 'elders', label: 'Parents & Elders' },
                { id: 'squad', label: 'Youth & Squad' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCoreRoleCategoryFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                    coreRoleCategoryFilter === f.id
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                      : 'border-theme-border bg-theme-background text-theme-text-muted hover:text-theme-text-main'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* + Add to Core Family / Assign Role Button */}
            <button
              type="button"
              onClick={() => setIsAddCoreDrawerOpen(true)}
              className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover flex items-center justify-center gap-2 shadow transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Role to Guest</span>
            </button>
          </div>

          {/* 2-Column Side-by-Side Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Groom's Core Family & Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-300/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    👔
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-amber-950 dark:text-amber-200">
                      {groomTerm}
                    </h3>
                    <p className="text-[10px] text-amber-800 dark:text-amber-300">
                      {wedding.groomName}'s Core Family & Coordination Roles
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900">
                  {groomCoreMembers.length} members
                </span>
              </div>

              <div className="space-y-3">
                {groomCoreMembers.map((g) => {
                  const party = partyMap.get(g.partyId);
                  const relation = g.relationToGroom && g.relationToGroom !== 'None' 
                    ? g.relationToGroom 
                    : g.relationToBride && g.relationToBride !== 'None' 
                    ? g.relationToBride 
                    : 'Groom Family';

                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all hover:shadow-md bg-theme-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xs shrink-0 bg-amber-100 text-amber-900 border border-amber-300">
                            {g.ageCategory === 'elder'
                              ? '👴'
                              : g.ageCategory === 'child'
                              ? '🧒'
                              : g.ageCategory === 'infant'
                              ? '👶'
                              : '👤'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-sm text-theme-text-main truncate">
                                {g.name}
                              </span>
                              {g.isPrimaryContact && (
                                <span title="Primary Contact">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-theme-text-muted mt-0.5 flex-wrap">
                              <span className="font-medium text-amber-800 dark:text-amber-300">{relation}</span>
                              <span>&bull;</span>
                              <span className="truncate">{party?.partyName || 'Family'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 1-Click Core Family Star/Crown Toggle */}
                        <button
                          type="button"
                          onClick={(e) => toggleCoreStatus(g, e)}
                          className={`p-2 rounded-xl transition-all ${
                            g.isCoreFamily
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                              : 'bg-theme-background text-theme-text-muted hover:text-amber-500 border border-theme-border'
                          }`}
                          title={g.isCoreFamily ? 'Core Family Member (Click to unflag)' : 'Click to flag as Core Family'}
                        >
                          <Crown className={`w-4 h-4 ${g.isCoreFamily ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Operational Role Section */}
                      <div className="mt-3 pt-3 border-t border-theme-border/60">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-amber-600" />
                            <span>Operational Role</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleOpenAssignRole(g, e)}
                            className="text-[11px] font-bold text-theme-primary hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>{g.roleTitle ? 'Change' : 'Assign'}</span>
                          </button>
                        </div>

                        {g.roleTitle ? (
                          <div
                            onClick={(e) => handleOpenAssignRole(g, e)}
                            className="mt-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-300/80 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            <span className="truncate">{g.roleTitle}</span>
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 ml-2 shrink-0">Click to edit</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAssignRole(g, e)}
                            className="mt-1.5 w-full py-1.5 px-3 rounded-xl border border-dashed border-theme-border hover:border-amber-500 text-[11px] font-semibold text-theme-text-muted hover:text-amber-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign Role (e.g. Baraat Lead, Safa POC)</span>
                          </button>
                        )}
                      </div>

                      {/* Contact Details & Special Assistance */}
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-3 text-theme-text-muted">
                          {g.phone ? (
                            <a
                              href={`tel:${g.phone}`}
                              className="flex items-center gap-1 hover:text-theme-primary transition-colors"
                              title="Call member"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{g.phone}</span>
                            </a>
                          ) : (
                            party?.phone && (
                              <a
                                href={`tel:${party.phone}`}
                                className="flex items-center gap-1 hover:text-theme-primary transition-colors text-[11px]"
                                title="Party Phone"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{party.phone}</span>
                              </a>
                            )
                          )}

                          {g.email && (
                            <a
                              href={`mailto:${g.email}`}
                              className="flex items-center gap-1 hover:text-theme-primary transition-colors"
                              title="Email member"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{g.email}</span>
                            </a>
                          )}
                        </div>

                        {g.specialAssistance && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            {g.specialAssistance}
                          </span>
                        )}
                      </div>

                      {/* Ceremony RSVP Badges */}
                      <div className="mt-3 pt-2.5 border-t border-theme-border/40 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-theme-text-muted mr-1">Ceremonies:</span>
                        {events?.map((ev) => {
                          const rsvp = rsvps?.find(
                            (r) =>
                              (r.guestId === g.id && r.eventId === ev.id) ||
                              (r.partyId === g.partyId && !r.guestId && r.eventId === ev.id)
                          );
                          const isAttending = rsvp?.status === 'confirmed';
                          return (
                            <span
                              key={ev.id}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                isAttending
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-100 text-stone-500 dark:bg-stone-800'
                              }`}
                              title={`${ev.name}: ${rsvp ? rsvp.status : 'No RSVP'}`}
                            >
                              {ev.name.split(' ')[0]} {isAttending ? '✓' : '—'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {groomCoreMembers.length === 0 && (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-theme-border text-xs text-theme-text-muted">
                    No Groom core members or roles match current filter.
                  </div>
                )}
              </div>
            </div>

            {/* Bride's Core Family & Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-300/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    👗
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-rose-950 dark:text-rose-200">
                      {brideTerm}
                    </h3>
                    <p className="text-[10px] text-rose-800 dark:text-rose-300">
                      {wedding.brideName}'s Core Family & Coordination Roles
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-200/80 text-rose-900">
                  {brideCoreMembers.length} members
                </span>
              </div>

              <div className="space-y-3">
                {brideCoreMembers.map((g) => {
                  const party = partyMap.get(g.partyId);
                  const relation = g.relationToBride && g.relationToBride !== 'None' 
                    ? g.relationToBride 
                    : g.relationToGroom && g.relationToGroom !== 'None' 
                    ? g.relationToGroom 
                    : 'Bride Family';

                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-2xl border border-rose-200/80 hover:border-rose-400 transition-all hover:shadow-md bg-theme-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xs shrink-0 bg-rose-100 text-rose-900 border border-rose-300">
                            {g.ageCategory === 'elder'
                              ? '👴'
                              : g.ageCategory === 'child'
                              ? '🧒'
                              : g.ageCategory === 'infant'
                              ? '👶'
                              : '👤'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-sm text-theme-text-main truncate">
                                {g.name}
                              </span>
                              {g.isPrimaryContact && (
                                <span title="Primary Contact">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-theme-text-muted mt-0.5 flex-wrap">
                              <span className="font-medium text-rose-800 dark:text-rose-300">{relation}</span>
                              <span>&bull;</span>
                              <span className="truncate">{party?.partyName || 'Family'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 1-Click Core Family Star/Crown Toggle */}
                        <button
                          type="button"
                          onClick={(e) => toggleCoreStatus(g, e)}
                          className={`p-2 rounded-xl transition-all ${
                            g.isCoreFamily
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                              : 'bg-theme-background text-theme-text-muted hover:text-amber-500 border border-theme-border'
                          }`}
                          title={g.isCoreFamily ? 'Core Family Member (Click to unflag)' : 'Click to flag as Core Family'}
                        >
                          <Crown className={`w-4 h-4 ${g.isCoreFamily ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Operational Role Section */}
                      <div className="mt-3 pt-3 border-t border-theme-border/60">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-rose-600" />
                            <span>Operational Role</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleOpenAssignRole(g, e)}
                            className="text-[11px] font-bold text-theme-primary hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>{g.roleTitle ? 'Change' : 'Assign'}</span>
                          </button>
                        </div>

                        {g.roleTitle ? (
                          <div
                            onClick={(e) => handleOpenAssignRole(g, e)}
                            className="mt-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/10 to-rose-600/5 border border-rose-300/80 text-rose-950 dark:text-rose-200 text-xs font-bold flex items-center justify-between cursor-pointer hover:border-rose-400 transition-colors"
                          >
                            <span className="truncate">{g.roleTitle}</span>
                            <span className="text-[10px] text-rose-700 dark:text-rose-400 ml-2 shrink-0">Click to edit</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAssignRole(g, e)}
                            className="mt-1.5 w-full py-1.5 px-3 rounded-xl border border-dashed border-theme-border hover:border-rose-500 text-[11px] font-semibold text-theme-text-muted hover:text-rose-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign Role (e.g. Joota Chupai Lead, Hospitality)</span>
                          </button>
                        )}
                      </div>

                      {/* Contact Details & Special Assistance */}
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-3 text-theme-text-muted">
                          {g.phone ? (
                            <a
                              href={`tel:${g.phone}`}
                              className="flex items-center gap-1 hover:text-theme-primary transition-colors"
                              title="Call member"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{g.phone}</span>
                            </a>
                          ) : (
                            party?.phone && (
                              <a
                                href={`tel:${party.phone}`}
                                className="flex items-center gap-1 hover:text-theme-primary transition-colors text-[11px]"
                                title="Party Phone"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{party.phone}</span>
                              </a>
                            )
                          )}

                          {g.email && (
                            <a
                              href={`mailto:${g.email}`}
                              className="flex items-center gap-1 hover:text-theme-primary transition-colors"
                              title="Email member"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{g.email}</span>
                            </a>
                          )}
                        </div>

                        {g.specialAssistance && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            {g.specialAssistance}
                          </span>
                        )}
                      </div>

                      {/* Ceremony RSVP Badges */}
                      <div className="mt-3 pt-2.5 border-t border-theme-border/40 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-theme-text-muted mr-1">Ceremonies:</span>
                        {events?.map((ev) => {
                          const rsvp = rsvps?.find(
                            (r) =>
                              (r.guestId === g.id && r.eventId === ev.id) ||
                              (r.partyId === g.partyId && !r.guestId && r.eventId === ev.id)
                          );
                          const isAttending = rsvp?.status === 'confirmed';
                          return (
                            <span
                              key={ev.id}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                isAttending
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-100 text-stone-500 dark:bg-stone-800'
                              }`}
                              title={`${ev.name}: ${rsvp ? rsvp.status : 'No RSVP'}`}
                            >
                              {ev.name.split(' ')[0]} {isAttending ? '✓' : '—'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {brideCoreMembers.length === 0 && (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-theme-border text-xs text-theme-text-muted">
                    No Bride core members or roles match current filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mutual / Extended Roles if any */}
          {mutualCoreMembers.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-theme-border">
              <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-purple-500/10 border border-purple-300/70">
                <span className="font-serif font-bold text-sm text-purple-950 dark:text-purple-200">
                  Extended Coordination Team & Mutual Family
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-200/80 text-purple-900">
                  {mutualCoreMembers.length} members
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mutualCoreMembers.map((g) => {
                  const party = partyMap.get(g.partyId);
                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-2xl border border-theme-border hover:border-theme-primary transition-all hover:shadow-md bg-theme-card"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm text-theme-text-main truncate">
                          {g.name}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleCoreStatus(g, e)}
                          className={`p-1.5 rounded-lg ${
                            g.isCoreFamily
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'text-stone-300 hover:text-amber-500'
                          }`}
                        >
                          <Crown className={`w-3.5 h-3.5 ${g.isCoreFamily ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <div className="text-xs text-theme-text-muted mt-1 truncate">
                        {party?.partyName || 'Family'}
                      </div>
                      {g.roleTitle && (
                        <div className="mt-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                          {g.roleTitle}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: Guest Directory & Multi-Event RSVP Matrix */}
      {activeSubTab === 'directory' && (
        <div className="space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Total Guests
              </span>
              <div className="text-xl font-bold font-serif text-theme-primary">{totalGuests}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Core Family
              </span>
              <div className="text-xl font-bold font-serif text-amber-600">{coreFamilyCount}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Adults (18+)
              </span>
              <div className="text-xl font-bold font-serif text-theme-text-main">{adultsCount}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Elders / Seniors
              </span>
              <div className="text-xl font-bold font-serif text-amber-700">{eldersCount}</div>
            </div>
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Children & Infants
              </span>
              <div className="text-xl font-bold font-serif text-emerald-600">
                {childrenCount + infantsCount}
              </div>
            </div>
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">
                Parties / Families
              </span>
              <div className="text-xl font-bold font-serif text-theme-secondary">
                {parties?.length || 0}
              </div>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-theme-card border border-theme-border p-3 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search family parties or individual guests..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-theme-border bg-theme-background text-theme-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Side Filter Tabs */}
              <div className="flex items-center bg-theme-background border border-theme-border rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setFilterSide('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterSide === 'all'
                      ? 'bg-theme-card text-theme-primary font-bold shadow-xs'
                      : 'text-theme-text-muted hover:text-theme-text-main'
                  }`}
                >
                  All Sides
                </button>
                <button
                  onClick={() => setFilterSide('ladkewale')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterSide === 'ladkewale'
                      ? 'bg-theme-card text-amber-700 font-bold shadow-xs'
                      : 'text-theme-text-muted hover:text-theme-text-main'
                  }`}
                >
                  {groomTerm}
                </button>
                <button
                  onClick={() => setFilterSide('ladkiwale')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterSide === 'ladkiwale'
                      ? 'bg-theme-card text-rose-700 font-bold shadow-xs'
                      : 'text-theme-text-muted hover:text-theme-text-main'
                  }`}
                >
                  {brideTerm}
                </button>
              </div>

              {/* Expand/Collapse All Rows Toggle */}
              <button
                type="button"
                onClick={() => setExpandAllParties(!expandAllParties)}
                className="px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-background text-xs font-semibold text-theme-text-muted hover:text-theme-text-main"
              >
                {expandAllParties ? 'Collapse All' : 'Expand All'}
              </button>

              <button
                onClick={handleExportCsv}
                className="p-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-theme-text-muted hover:text-theme-text-main transition-colors"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>

              <label className="p-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-theme-text-muted hover:text-theme-text-main transition-colors cursor-pointer" title="Import CSV">
                <Upload className="w-4 h-4" />
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
                className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Party</span>
              </button>
            </div>
          </div>

          {/* Granular Individual Table Rows for Multi-Event RSVP */}
          <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-background/70 text-[11px] font-bold text-theme-text-muted uppercase tracking-wider">
                    <th className="py-3 px-3 w-8"></th>
                    <th className="py-3 px-3">Party & Individual Attendee</th>
                    <th className="py-3 px-3">Side</th>
                    <th className="py-3 px-3">Contact & Address</th>
                    <th className="py-3 px-3">Relation Guide</th>

                    {/* Ceremony Headers equipped with Tooltip (Requirement 16) */}
                    {events?.map((ev) => (
                      <th key={ev.id} className="py-3 px-2 text-center min-w-[85px] max-w-[120px]">
                        <Tooltip
                          content={
                            <div className="space-y-1 text-left p-1">
                              <div className="font-bold text-amber-300 text-xs">
                                {ev.name} ({ev.type})
                              </div>
                              <div className="text-[11px] text-stone-200">
                                📅 {ev.date} &bull; ⏰ {ev.startTime} - {ev.endTime}
                              </div>
                              <div className="text-[11px] text-stone-300">📍 {ev.venue}</div>
                              {ev.dressCode && (
                                <div className="text-[10px] text-amber-200">
                                  👗 Dress: {ev.dressCode}
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div className="cursor-help mx-auto">
                            <div className="truncate text-theme-text-main font-bold max-w-[85px]">
                              {ev.name}
                            </div>
                            <div className="text-[9px] font-normal text-theme-text-muted capitalize">
                              {ev.type}
                            </div>
                          </div>
                        </Tooltip>
                      </th>
                    ))}

                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border text-xs">
                  {filteredParties?.map((party) => {
                    const partyExpanded = isPartyExpanded(party.id);
                    const partyGuests = guests?.filter((g) => g.partyId === party.id) || [];
                    const partyTags = allTags?.filter((t) => party.tagIds?.includes(t.id)) || [];

                    return (
                      <React.Fragment key={party.id}>
                        {/* Level 1: Party Header Row */}
                        <tr className="bg-stone-50/60 dark:bg-stone-900/60 font-semibold border-t-2 border-theme-border/80">
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => togglePartyExpand(party.id)}
                              className="p-1 rounded hover:bg-theme-border/40 text-theme-text-muted"
                              title="Toggle party members"
                            >
                              {partyExpanded ? (
                                <ChevronDown className="w-4 h-4 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-theme-text-main">
                                {party.partyName}
                              </span>
                              <span className="text-[10px] text-theme-text-muted bg-stone-200/50 dark:bg-stone-800 px-1.5 py-0.5 rounded-full">
                                {partyGuests.length} members
                              </span>
                            </div>
                            {partyTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {partyTags.map((t) => (
                                  <TagBadge key={t.id} tag={t} size="sm" />
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                party.side === 'ladkiwale'
                                  ? 'bg-rose-100 text-rose-800'
                                  : party.side === 'ladkewale'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {party.side === 'ladkiwale'
                                ? brideTerm
                                : party.side === 'ladkewale'
                                ? groomTerm
                                : 'Mutual'}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-[11px] text-theme-text-muted">
                            <div className="flex items-center gap-1.5 font-medium text-theme-text-main">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              <span>{party.primaryContactName}</span>
                            </div>
                            {party.phone && <div className="text-[10px]">{party.phone}</div>}
                          </td>

                          <td className="py-2.5 px-3 text-theme-text-muted text-[11px]">
                            Party Group
                          </td>

                          {/* Party Summary RSVP Checkboxes */}
                          {events?.map((ev) => {
                            const stats = getPartyEventStats(party, ev.id);
                            return (
                              <td key={ev.id} className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleWholePartyRsvp(party.id, ev.id)}
                                  className={`px-2 py-0.5 rounded-lg flex items-center justify-center gap-1 mx-auto transition-all text-[11px] font-bold ${
                                    stats.isAllConfirmed
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : stats.isPartial
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-stone-200 dark:bg-stone-800 text-theme-text-muted hover:bg-stone-300'
                                  }`}
                                  title={`${party.partyName} - ${ev.name}: ${stats.confirmedCount}/${stats.totalCount} confirmed. Click to toggle party.`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>
                                    {stats.confirmedCount}/{stats.totalCount}
                                  </span>
                                </button>
                              </td>
                            );
                          })}

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditParty(party)}
                                className="p-1 text-theme-text-muted hover:text-theme-primary rounded"
                                title="Edit party & members"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParty(party.id)}
                                className="p-1 text-theme-text-muted hover:text-rose-600 rounded"
                                title="Delete party"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Level 2: Individual Member Direct Rows (Requirements 15 & 17) */}
                        {partyExpanded &&
                          partyGuests.map((guest) => {
                            return (
                              <tr
                                key={guest.id}
                                className="hover:bg-theme-background/50 transition-colors bg-white/40 dark:bg-stone-900/30"
                              >
                                <td className="py-2 px-3 text-center">
                                  <span className="text-stone-300 dark:text-stone-700">&bull;</span>
                                </td>

                                {/* Member Name + Age + Core Family + Role */}
                                <td className="py-2 px-3 pl-6">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => toggleCoreStatus(guest, e)}
                                      className={`p-1 rounded transition-all ${
                                        guest.isCoreFamily
                                          ? 'text-amber-600 bg-amber-50 border border-amber-300'
                                          : 'text-stone-300 hover:text-amber-500 hover:bg-stone-100'
                                      }`}
                                      title={guest.isCoreFamily ? 'Core Family Member (Click to unflag)' : 'Click to flag as Core Family'}
                                    >
                                      <Crown className={`w-3 h-3 ${guest.isCoreFamily ? 'fill-current' : ''}`} />
                                    </button>
                                    <span className="font-medium text-theme-text-main text-xs">
                                      {guest.name}
                                    </span>
                                    {guest.isPrimaryContact && (
                                      <span title="Primary Contact">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                      </span>
                                    )}
                                    {guest.roleTitle && (
                                      <span
                                        onClick={(e) => handleOpenAssignRole(guest, e)}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 cursor-pointer hover:bg-indigo-100"
                                        title="Assigned Operational Role (Click to edit)"
                                      >
                                        <Briefcase className="w-2.5 h-2.5" />
                                        <span>{guest.roleTitle}</span>
                                      </span>
                                    )}
                                    {getAgeBadge(guest.ageCategory)}
                                  </div>
                                </td>

                                <td className="py-2 px-3 text-[11px] text-theme-text-muted">
                                  {party.side === 'ladkiwale'
                                    ? brideTerm
                                    : party.side === 'ladkewale'
                                    ? groomTerm
                                    : 'Mutual'}
                                </td>

                                {/* Contact info & Address */}
                                <td className="py-2 px-3 text-[11px] text-theme-text-muted">
                                  <div className="space-y-0.5">
                                    {guest.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-emerald-600" />
                                        <span>{guest.phone}</span>
                                      </div>
                                    )}
                                    {guest.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-blue-500" />
                                        <span className="truncate max-w-[130px]">{guest.email}</span>
                                      </div>
                                    )}
                                    {guest.address && (
                                      <div className="flex items-center gap-1 text-[10px]">
                                        <MapPin className="w-2.5 h-2.5 text-stone-400" />
                                        <span className="truncate max-w-[140px]">{guest.address}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Relation Guides */}
                                <td className="py-2 px-3 text-[11px]">
                                  {guest.relationToBride && (
                                    <span className="text-rose-700 font-semibold mr-1.5">
                                      Bride: {guest.relationToBride}
                                    </span>
                                  )}
                                  {guest.relationToGroom && (
                                    <span className="text-amber-700 font-semibold">
                                      Groom: {guest.relationToGroom}
                                    </span>
                                  )}
                                  {!guest.relationToBride && !guest.relationToGroom && (
                                    <span className="text-stone-400">Guest</span>
                                  )}
                                  {guest.specialAssistance && (
                                    <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                                      <ShieldAlert className="w-3 h-3" />
                                      <span>{guest.specialAssistance}</span>
                                    </div>
                                  )}
                                </td>

                                {/* Individual Multi-Ceremony RSVP Checkboxes */}
                                {events?.map((ev) => {
                                  const isConfirmed = isGuestConfirmed(guest.id, party.id, ev.id);
                                  return (
                                    <td key={ev.id} className="py-2 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleIndividualGuestRsvp(guest.id, party.id, ev.id)
                                        }
                                        className={`w-6 h-6 mx-auto rounded-lg flex items-center justify-center transition-all ${
                                          isConfirmed
                                            ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                            : 'border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-transparent hover:border-emerald-500'
                                        }`}
                                        title={`${guest.name} - ${ev.name}: ${
                                          isConfirmed ? 'Confirmed' : 'Not Attending'
                                        }. Click to toggle.`}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  );
                                })}

                                <td className="py-2 px-3 text-right text-stone-400 text-[10px]">
                                  Individual
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}

                  {(!filteredParties || filteredParties.length === 0) && (
                    <tr>
                      <td
                        colSpan={6 + (events?.length || 0)}
                        className="py-12 text-center text-theme-text-muted"
                      >
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No guest parties found.</p>
                        <p className="text-xs">
                          Click "+ Add Party" or "Import CSV" to add attendees.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Party Drawer (NestedScreen with Drawer Mode) */}
      <NestedScreen
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingParty ? 'Edit Guest Party & Members' : 'Add Guest Party & Members'}
        subtitle="Manage family party details, individual contact information, addresses, and relations"
        mode="drawer"
        width="4xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted hover:bg-theme-border/30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveParty}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingParty ? 'Save Changes' : 'Save Party & Guests'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveParty} className="space-y-6">
          {/* Party Primary Info */}
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
                placeholder="Synced with primary member"
                className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-text-main">Party Phone (WhatsApp)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-text-main">Party Email</label>
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
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            weddingId={wedding.id}
            onOpenManager={onOpenTagManager}
          />

          {/* TABULAR INDIVIDUAL MEMBERS LIST (Requirement 6: Each member with phone, email, address, isCoreFamily) */}
          <div className="border border-theme-border rounded-2xl overflow-hidden bg-theme-card">
            <div className="p-3 bg-theme-background/80 border-b border-theme-border flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-theme-text-main flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-theme-primary" />
                  <span>Tabular Individual Party Members ({tabularMembers.length})</span>
                </div>
                <p className="text-[11px] text-theme-text-muted">
                  Each member can have distinct contact details, address, age tier, and core family status.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMemberRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member Row</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-background/60 text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                    <th className="py-2.5 px-3 text-center w-12" title="Primary Contact">
                      Primary
                    </th>
                    <th className="py-2.5 px-3 min-w-[140px]">Member Name *</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Age Tier</th>
                    <th className="py-2.5 px-3 text-center min-w-[80px]" title="Mark as Core Family Member">
                      Core Fam?
                    </th>
                    <th className="py-2.5 px-3 min-w-[130px]">Personal Phone</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Personal Email</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Address</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Relation to Bride</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Relation to Groom</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Dietary</th>
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

                      {/* Name */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder={`Member #${index + 1}`}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-theme-primary"
                          required
                        />
                      </td>

                      {/* Age Tier */}
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

                      {/* Core Family Checkbox */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!member.isCoreFamily}
                          onChange={(e) =>
                            handleMemberChange(index, 'isCoreFamily', e.target.checked)
                          }
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                          title="Check if this member is core family"
                        />
                      </td>

                      {/* Personal Phone */}
                      <td className="py-2 px-3">
                        <input
                          type="tel"
                          value={member.phone || ''}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                          placeholder="+91..."
                          className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs"
                        />
                      </td>

                      {/* Personal Email */}
                      <td className="py-2 px-3">
                        <input
                          type="email"
                          value={member.email || ''}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          placeholder="email@..."
                          className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs"
                        />
                      </td>

                      {/* Address */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={member.address || ''}
                          onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                          placeholder="City / Street"
                          className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs"
                        />
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

                      {/* Dietary */}
                      <td className="py-2 px-3">
                        <select
                          value={member.dietaryPreference}
                          onChange={(e) =>
                            handleMemberChange(index, 'dietaryPreference', e.target.value as any)
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-theme-border bg-theme-background text-xs cursor-pointer"
                        >
                          <option value="pure_veg">Pure Veg</option>
                          <option value="jain">Jain</option>
                          <option value="non_veg">Non-Veg</option>
                          <option value="vegan">Vegan</option>
                        </select>
                      </td>

                      {/* Delete Member Row */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberRow(index)}
                          disabled={tabularMembers.length <= 1}
                          className="text-theme-text-muted hover:text-rose-600 disabled:opacity-30 p-1"
                          title="Delete row"
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
                Total: <strong>{tabularMembers.length} attendees</strong> (
                {tabularMembers.filter((m) => m.isCoreFamily).length} Core Family)
              </span>
              <button
                type="button"
                onClick={handleAddMemberRow}
                className="text-theme-primary font-bold hover:underline"
              >
                + Add Member Row
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-theme-text-main">
              Party Notes & Accommodations Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests, arrival notes, dietary allergies..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm resize-none"
            />
          </div>
        </form>
      </NestedScreen>

      {/* Drawer 1: Operational Role Editor & Core Family Switch */}
      <NestedScreen
        isOpen={isRoleDrawerOpen}
        onClose={() => {
          setIsRoleDrawerOpen(false);
          setEditingRoleGuest(null);
        }}
        title={`Assign Role — ${editingRoleGuest?.name || 'Guest'}`}
        subtitle="Specify event responsibilities, coordination duties, or chief host status"
        mode="drawer"
        width="md"
        level={2}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRoleDrawerOpen(false);
                setEditingRoleGuest(null);
              }}
              className="px-4 py-2 rounded-xl border border-theme-border text-xs font-semibold text-theme-text-muted hover:bg-theme-border/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRole}
              className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold transition-all shadow-xs"
            >
              Save Role
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveRole} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-main flex items-center justify-between">
              <span>Operational Role Title</span>
              <span className="text-[10px] text-theme-text-muted">Preset or Custom</span>
            </label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="e.g. Baraat Lead, Safawala POC, Room Key Lead..."
              className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm text-theme-text-main"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-theme-text-muted uppercase tracking-wider block">
              Suggested Indian Wedding Roles
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {INDIAN_WEDDING_ROLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRoleInput(preset)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    roleInput === preset
                      ? 'bg-theme-primary text-white border-theme-primary'
                      : 'border-theme-border/70 hover:border-theme-primary bg-theme-background text-theme-text-main'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Core Family Status Toggle */}
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Mark as Core Family Member
                </div>
                <div className="text-[10px] text-amber-800 dark:text-amber-400">
                  Featured in Core Family Hub & VIP seating/travel
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRoleCoreToggle(!isRoleCoreToggle)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isRoleCoreToggle ? 'bg-amber-500 justify-end' : 'bg-stone-300 dark:bg-stone-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
            </button>
          </div>
        </form>
      </NestedScreen>

      {/* Drawer 2: Add Guest to Core Family / Assign Role */}
      <NestedScreen
        isOpen={isAddCoreDrawerOpen}
        onClose={() => {
          setIsAddCoreDrawerOpen(false);
          setSelectedGuestIdToAdd('');
          setNewCoreRoleInput('');
        }}
        title="Assign Role to Any Guest"
        subtitle="Pick any guest from your guest list and assign them a key responsibility"
        mode="drawer"
        width="md"
        level={2}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddCoreDrawerOpen(false);
                setSelectedGuestIdToAdd('');
              }}
              className="px-4 py-2 rounded-xl border border-theme-border text-xs font-semibold text-theme-text-muted hover:bg-theme-border/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedGuestIdToAdd}
              onClick={handleAddGuestToCore}
              className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs"
            >
              Confirm Role Assignment
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddGuestToCore} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-main">
              Select Guest from Guest List
            </label>
            <select
              value={selectedGuestIdToAdd}
              onChange={(e) => setSelectedGuestIdToAdd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm text-theme-text-main"
            >
              <option value="">-- Choose a guest --</option>
              {guests?.map((g) => {
                const party = partyMap.get(g.partyId);
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} ({party?.partyName || 'Family'} &bull;{' '}
                    {party?.side === 'ladkewale' ? groomTerm : party?.side === 'ladkiwale' ? brideTerm : 'Mutual'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-main">
              Operational Role Title
            </label>
            <input
              type="text"
              value={newCoreRoleInput}
              onChange={(e) => setNewCoreRoleInput(e.target.value)}
              placeholder="e.g. Chief Host, Baraat POC, Pooja Samagri Coordinator..."
              className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm text-theme-text-main"
            />
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-theme-text-muted uppercase tracking-wider block">
              Suggested Roles
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {INDIAN_WEDDING_ROLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewCoreRoleInput(preset)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    newCoreRoleInput === preset
                      ? 'bg-theme-primary text-white border-theme-primary'
                      : 'border-theme-border/70 hover:border-theme-primary bg-theme-background text-theme-text-main'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </form>
      </NestedScreen>
    </div>
  );
};
