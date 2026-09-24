import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Wedding, WeddingEvent, FamilyMember, GuestParty, Guest } from '../../db/schema';
import { db } from '../../db';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Trash2,
  Users,
  Shield,
  Sun,
  Shirt,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

interface QuickWeddingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FamilyMemberInput {
  name: string;
  relation: string;
  generationLevel: number;
  phone?: string;
  roleTitle?: string;
}

interface CeremonyInput {
  type: WeddingEvent['type'];
  name: string;
  defaultDayOffset: number;
  startTime: string;
  endTime: string;
  venueArea: string;
  dressCode: string;
  selected: boolean;
}

const DEFAULT_CEREMONIES: CeremonyInput[] = [
  {
    type: 'haldi',
    name: 'Phoolon Ki Haldi & Chuda',
    defaultDayOffset: 0,
    startTime: '10:30',
    endTime: '13:30',
    venueArea: 'Sunken Poolside Lawn',
    dressCode: 'Sunshine Yellow / Floral Leheriya',
    selected: true,
  },
  {
    type: 'mehendi',
    name: 'Mehendi Ki Raat & Sangeet Bazaar',
    defaultDayOffset: 0,
    startTime: '16:00',
    endTime: '20:00',
    venueArea: 'Courtyard & Mughal Gardens',
    dressCode: 'Emerald Green & Pastel Mint',
    selected: true,
  },
  {
    type: 'sangeet',
    name: 'Sangeet & Cocktail Extravaganza',
    defaultDayOffset: 1,
    startTime: '19:30',
    endTime: '01:00',
    venueArea: 'Grand Crystal Ballroom',
    dressCode: 'Glamorous Indo-Western & Sequins',
    selected: true,
  },
  {
    type: 'wedding',
    name: 'Shubh Vivah & Royal Pheras',
    defaultDayOffset: 2,
    startTime: '18:00',
    endTime: '22:30',
    venueArea: 'Lakeside Mandap Lawns',
    dressCode: 'Royal Traditional / Sherwani & Zari',
    selected: true,
  },
  {
    type: 'reception',
    name: 'Grand Royal Reception & Gala',
    defaultDayOffset: 2,
    startTime: '20:30',
    endTime: '23:45',
    venueArea: 'Palace Banquet Hall',
    dressCode: 'Formal Elegance / Tuxedos & Silk Sarees',
    selected: true,
  },
];

export const QuickWeddingWizard: React.FC<QuickWeddingWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const { createWedding } = useWedding();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Dates & Destination
  const todayStr = new Date().toISOString().split('T')[0];
  const [primaryDate, setPrimaryDate] = useState(todayStr);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [weddingTitle, setWeddingTitle] = useState('');

  // Step 2: Couple & Terminology
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideCallingName, setBrideCallingName] = useState('');
  const [groomCallingName, setGroomCallingName] = useState('');
  const [brideSideTerm, setBrideSideTerm] = useState('');
  const [groomSideTerm, setGroomSideTerm] = useState('');

  // Step 3: Immediate Family Hierarchy
  // Bride's side
  const [brideFather, setBrideFather] = useState('');
  const [brideMother, setBrideMother] = useState('');
  const [brideFatherPhone, setBrideFatherPhone] = useState('');
  const [brideMotherPhone, setBrideMotherPhone] = useState('');
  const [brideSiblings, setBrideSiblings] = useState<FamilyMemberInput[]>([]);

  // Groom's side
  const [groomFather, setGroomFather] = useState('');
  const [groomMother, setGroomMother] = useState('');
  const [groomFatherPhone, setGroomFatherPhone] = useState('');
  const [groomMotherPhone, setGroomMotherPhone] = useState('');
  const [groomSiblings, setGroomSiblings] = useState<FamilyMemberInput[]>([]);

  // Step 4: Ceremonies & Specific Venues
  const [ceremonies, setCeremonies] = useState<CeremonyInput[]>(DEFAULT_CEREMONIES);

  if (!isOpen) return null;

  // Auto-calculated title
  const getComputedTitle = () => {
    if (weddingTitle.trim()) return weddingTitle.trim();
    if (brideName && groomName) {
      const b = brideCallingName || brideName.split(' ')[0];
      const g = groomCallingName || groomName.split(' ')[0];
      return `${b} & ${g}'s Grand Vivah`;
    }
    return 'Our Grand Indian Wedding';
  };

  const getComputedBrideSide = () => {
    if (brideSideTerm.trim()) return brideSideTerm.trim();
    const b = brideCallingName || (brideName ? brideName.split(' ')[0] : 'Bride');
    return `Team ${b} (Ladkiwale)`;
  };

  const getComputedGroomSide = () => {
    if (groomSideTerm.trim()) return groomSideTerm.trim();
    const g = groomCallingName || (groomName ? groomName.split(' ')[0] : 'Groom');
    return `Team ${g} (Ladkewale)`;
  };

  // Step 1 Validation & Next
  const handleNextStep1 = () => {
    if (!city.trim() || !venue.trim()) {
      alert('Please specify the destination city and primary hotel or venue name.');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation & Next
  const handleNextStep2 = () => {
    if (!brideName.trim() || !groomName.trim()) {
      alert('Please enter both Bride and Groom full names.');
      return;
    }
    setStep(3);
  };

  // Add Sibling helper
  const handleAddSibling = (side: 'bride' | 'groom') => {
    const newSibling: FamilyMemberInput = {
      name: '',
      relation: side === 'bride' ? 'Sister' : 'Brother',
      generationLevel: 3,
      roleTitle: side === 'bride' ? 'Bride Squad Lead' : 'Groom Squad & Safa Lead',
    };
    if (side === 'bride') {
      setBrideSiblings((prev) => [...prev, newSibling]);
    } else {
      setGroomSiblings((prev) => [...prev, newSibling]);
    }
  };

  const handleUpdateSibling = (
    side: 'bride' | 'groom',
    index: number,
    field: keyof FamilyMemberInput,
    val: any
  ) => {
    if (side === 'bride') {
      setBrideSiblings((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
      );
    } else {
      setGroomSiblings((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
      );
    }
  };

  const handleRemoveSibling = (side: 'bride' | 'groom', index: number) => {
    if (side === 'bride') {
      setBrideSiblings((prev) => prev.filter((_, i) => i !== index));
    } else {
      setGroomSiblings((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Toggle ceremony
  const toggleCeremony = (index: number) => {
    setCeremonies((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const updateCeremonyField = (
    index: number,
    field: keyof CeremonyInput,
    val: any
  ) => {
    setCeremonies((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
  };

  // Complete & Kick off wedding!
  const handleCompleteLaunch = async () => {
    const weddingId = `wedding-${Date.now()}`;
    const computedTitle = getComputedTitle();
    const finalBrideSide = getComputedBrideSide();
    const finalGroomSide = getComputedGroomSide();

    const newWedding: Wedding = {
      id: weddingId,
      title: computedTitle,
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      brideSideName: finalBrideSide,
      groomSideName: finalGroomSide,
      brideSideTerm: finalBrideSide,
      groomSideTerm: finalGroomSide,
      startDate,
      endDate,
      primaryDate,
      city: city.trim(),
      venue: venue.trim(),
      theme: 'royal-festive',
      customColors: {
        primary: '#7B1113',
        secondary: '#D97706',
        accent: '#B45309',
        background: '#FCFBF7',
        card: '#FFFFFF',
        textMain: '#271E1D',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Calculate dates for selected ceremonies
    const startDateTime = new Date(startDate);
    const selectedCeremonies = ceremonies.filter((c) => c.selected);

    const weddingEvents: WeddingEvent[] = selectedCeremonies.map((c, idx) => {
      const eventDate = new Date(startDateTime);
      eventDate.setDate(startDateTime.getDate() + c.defaultDayOffset);
      const dateStr = eventDate.toISOString().split('T')[0];

      return {
        id: `evt-${weddingId}-${idx}`,
        weddingId,
        name: c.name,
        type: c.type,
        date: dateStr,
        startTime: c.startTime,
        endTime: c.endTime,
        venue: c.venueArea.trim() ? `${venue.trim()} (${c.venueArea.trim()})` : venue.trim(),
        dressCode: c.dressCode,
        orderIndex: idx + 1,
      };
    });

    // Build Family Hierarchy & Core Family Guests
    const familyMembers: FamilyMember[] = [];
    const guests: Guest[] = [];
    const guestParties: GuestParty[] = [];

    // Party 1: Bride's Immediate Family
    const bridePartyId = `party-${weddingId}-bride-immediate`;
    const brideParty: GuestParty = {
      id: bridePartyId,
      weddingId,
      partyName: `${brideName.split(' ')[0]}'s Immediate Family`,
      side: 'ladkiwale',
      primaryContactName: brideFather || brideMother || brideName,
      phone: brideFatherPhone || brideMotherPhone || '',
      adultsCount: 2 + brideSiblings.length,
      childrenCount: 0,
      notes: 'Immediate family seeded via Quick Wedding Wizard',
      tagIds: ['core_family'],
    };
    guestParties.push(brideParty);

    // Party 2: Groom's Immediate Family
    const groomPartyId = `party-${weddingId}-groom-immediate`;
    const groomParty: GuestParty = {
      id: groomPartyId,
      weddingId,
      partyName: `${groomName.split(' ')[0]}'s Immediate Family`,
      side: 'ladkewale',
      primaryContactName: groomFather || groomMother || groomName,
      phone: groomFatherPhone || groomMotherPhone || '',
      adultsCount: 2 + groomSiblings.length,
      childrenCount: 0,
      notes: 'Immediate family seeded via Quick Wedding Wizard',
      tagIds: ['core_family'],
    };
    guestParties.push(groomParty);

    // Seed Bride's Parents
    if (brideFather.trim()) {
      const id = `fam-${weddingId}-b-father`;
      familyMembers.push({
        id,
        weddingId,
        name: brideFather.trim(),
        side: 'ladkiwale',
        relation: 'Father',
        generationLevel: 2,
        phone: brideFatherPhone.trim(),
        roleTitle: 'Chief Host (Ladkiwale)',
        tagIds: ['core_family'],
      });
      guests.push({
        id: `gst-${weddingId}-b-father`,
        weddingId,
        partyId: bridePartyId,
        name: brideFather.trim(),
        ageCategory: 'adult',
        relationToBride: 'Father',
        isCoreFamily: true,
        phone: brideFatherPhone.trim(),
        roleTitle: 'Chief Host (Ladkiwale)',
        dietaryPreference: 'pure_veg',
        tagIds: ['core_family'],
      });
    }

    if (brideMother.trim()) {
      const id = `fam-${weddingId}-b-mother`;
      familyMembers.push({
        id,
        weddingId,
        name: brideMother.trim(),
        side: 'ladkiwale',
        relation: 'Mother',
        generationLevel: 2,
        phone: brideMotherPhone.trim(),
        roleTitle: 'Chief Hostess (Ladkiwale)',
        tagIds: ['core_family'],
      });
      guests.push({
        id: `gst-${weddingId}-b-mother`,
        weddingId,
        partyId: bridePartyId,
        name: brideMother.trim(),
        ageCategory: 'adult',
        relationToBride: 'Mother',
        isCoreFamily: true,
        phone: brideMotherPhone.trim(),
        roleTitle: 'Chief Hostess (Ladkiwale)',
        dietaryPreference: 'pure_veg',
        tagIds: ['core_family'],
      });
    }

    // Seed Bride's Siblings
    brideSiblings.forEach((s, i) => {
      if (s.name.trim()) {
        const id = `fam-${weddingId}-b-sib-${i}`;
        familyMembers.push({
          id,
          weddingId,
          name: s.name.trim(),
          side: 'ladkiwale',
          relation: s.relation,
          generationLevel: 3,
          phone: s.phone?.trim(),
          roleTitle: s.roleTitle || 'Bride Squad',
          tagIds: ['core_family'],
        });
        guests.push({
          id: `gst-${weddingId}-b-sib-${i}`,
          weddingId,
          partyId: bridePartyId,
          name: s.name.trim(),
          ageCategory: 'adult',
          relationToBride: s.relation,
          isCoreFamily: true,
          phone: s.phone?.trim(),
          roleTitle: s.roleTitle || 'Bride Squad',
          dietaryPreference: 'pure_veg',
          tagIds: ['core_family'],
        });
      }
    });

    // Seed Groom's Parents
    if (groomFather.trim()) {
      const id = `fam-${weddingId}-g-father`;
      familyMembers.push({
        id,
        weddingId,
        name: groomFather.trim(),
        side: 'ladkewale',
        relation: 'Father',
        generationLevel: 2,
        phone: groomFatherPhone.trim(),
        roleTitle: 'Chief Host (Ladkewale)',
        tagIds: ['core_family'],
      });
      guests.push({
        id: `gst-${weddingId}-g-father`,
        weddingId,
        partyId: groomPartyId,
        name: groomFather.trim(),
        ageCategory: 'adult',
        relationToGroom: 'Father',
        isCoreFamily: true,
        phone: groomFatherPhone.trim(),
        roleTitle: 'Chief Host (Ladkewale)',
        dietaryPreference: 'pure_veg',
        tagIds: ['core_family'],
      });
    }

    if (groomMother.trim()) {
      const id = `fam-${weddingId}-g-mother`;
      familyMembers.push({
        id,
        weddingId,
        name: groomMother.trim(),
        side: 'ladkewale',
        relation: 'Mother',
        generationLevel: 2,
        phone: groomMotherPhone.trim(),
        roleTitle: 'Chief Hostess (Ladkewale)',
        tagIds: ['core_family'],
      });
      guests.push({
        id: `gst-${weddingId}-g-mother`,
        weddingId,
        partyId: groomPartyId,
        name: groomMother.trim(),
        ageCategory: 'adult',
        relationToGroom: 'Mother',
        isCoreFamily: true,
        phone: groomMotherPhone.trim(),
        roleTitle: 'Chief Hostess (Ladkewale)',
        dietaryPreference: 'pure_veg',
        tagIds: ['core_family'],
      });
    }

    // Seed Groom's Siblings
    groomSiblings.forEach((s, i) => {
      if (s.name.trim()) {
        const id = `fam-${weddingId}-g-sib-${i}`;
        familyMembers.push({
          id,
          weddingId,
          name: s.name.trim(),
          side: 'ladkewale',
          relation: s.relation,
          generationLevel: 3,
          phone: s.phone?.trim(),
          roleTitle: s.roleTitle || 'Groom Squad & Safa Lead',
          tagIds: ['core_family'],
        });
        guests.push({
          id: `gst-${weddingId}-g-sib-${i}`,
          weddingId,
          partyId: groomPartyId,
          name: s.name.trim(),
          ageCategory: 'adult',
          relationToGroom: s.relation,
          isCoreFamily: true,
          phone: s.phone?.trim(),
          roleTitle: s.roleTitle || 'Groom Squad & Safa Lead',
          dietaryPreference: 'pure_veg',
          tagIds: ['core_family'],
        });
      }
    });

    // Atomic transaction save
    await db.transaction(
      'rw',
      [
        db.weddings,
        db.events,
        db.familyMembers,
        db.guestParties,
        db.guests,
      ],
      async () => {
        await db.weddings.put(newWedding);
        if (weddingEvents.length > 0) await db.events.bulkPut(weddingEvents);
        if (familyMembers.length > 0) await db.familyMembers.bulkPut(familyMembers);
        if (guestParties.length > 0) await db.guestParties.bulkPut(guestParties);
        if (guests.length > 0) await db.guests.bulkPut(guests);
      }
    );

    await createWedding(newWedding);

    // Celebratory Confetti!
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-stone-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wizard Header */}
        <div className="px-6 py-4.5 border-b border-amber-800/20 bg-gradient-to-r from-[#7B1113] via-[#991B1E] to-[#B45309] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl">Quick Wedding Setup Wizard</h3>
              <p className="text-xs text-white/80">
                Step {step} of 5 &bull;{' '}
                {step === 1 && 'Wedding Date & Destination'}
                {step === 2 && 'Bride & Groom Details'}
                {step === 3 && 'Immediate Family Hierarchy'}
                {step === 4 && 'Ceremonies & Venues'}
                {step === 5 && 'Review & Kick-off Launch'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="grid grid-cols-5 bg-stone-100 border-b border-stone-200 shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 transition-colors duration-300 ${
                step >= s ? 'bg-amber-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Wizard Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {/* STEP 1: Dates & Destination */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-150">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                  Step 1 of 5
                </span>
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Auspicious Dates & Destination
                </h4>
                <p className="text-xs text-stone-600">
                  Set the auspicious Muhurat date and palace resort venue to anchor the wedding calendar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Primary Wedding Date *</span>
                  </label>
                  <input
                    type="date"
                    value={primaryDate}
                    onChange={(e) => {
                      setPrimaryDate(e.target.value);
                      if (startDate > e.target.value) setStartDate(e.target.value);
                      if (endDate < e.target.value) setEndDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
                    required
                  />
                  <p className="text-[10px] text-stone-500">Sacred Pheras & Muhurat day</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Celebration Start Date *</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                    required
                  />
                  <p className="text-[10px] text-stone-500">Arrivals & initial pooja</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Celebration End Date *</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                    required
                  />
                  <p className="text-[10px] text-stone-500">Reception & departures</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Destination City *</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Udaipur, Rajasthan"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Primary Resort / Palace Venue *</span>
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. The Oberoi Udaivilas"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-800 block">
                  Wedding Title (Optional)
                </label>
                <input
                  type="text"
                  value={weddingTitle}
                  onChange={(e) => setWeddingTitle(e.target.value)}
                  placeholder={getComputedTitle()}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
                />
                <p className="text-[11px] text-stone-500">
                  Leave blank to auto-generate once couple names are entered.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Bride & Groom Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-150">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
                  Step 2 of 5
                </span>
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  The Blessed Couple & Bilateral Sides
                </h4>
                <p className="text-xs text-stone-600">
                  Configure Bride and Groom identities along with authentic bilateral side labels.
                </p>
              </div>

              {/* Bride Card */}
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>The Bride (Dulhan)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Bride's Full Name *</label>
                    <input
                      type="text"
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Calling Name / Nickname</label>
                    <input
                      type="text"
                      value={brideCallingName}
                      onChange={(e) => setBrideCallingName(e.target.value)}
                      placeholder="e.g. Anu"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800">
                    Bride's Side Terminology / Family Label
                  </label>
                  <input
                    type="text"
                    value={brideSideTerm}
                    onChange={(e) => setBrideSideTerm(e.target.value)}
                    placeholder={getComputedBrideSide()}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-stone-500">
                    Used across Guest List, Seating, and Accommodations (e.g. "Team Ananya", "Ladkiwale").
                  </p>
                </div>
              </div>

              {/* Groom Card */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>The Groom (Dulha)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Groom's Full Name *</label>
                    <input
                      type="text"
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="e.g. Aarav Verma"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Calling Name / Nickname</label>
                    <input
                      type="text"
                      value={groomCallingName}
                      onChange={(e) => setGroomCallingName(e.target.value)}
                      placeholder="e.g. Avi"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800">
                    Groom's Side Terminology / Family Label
                  </label>
                  <input
                    type="text"
                    value={groomSideTerm}
                    onChange={(e) => setGroomSideTerm(e.target.value)}
                    placeholder={getComputedGroomSide()}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-stone-500">
                    Used across Guest List, Seating, and Accommodations (e.g. "Team Aarav", "Ladkewale").
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Immediate Family Hierarchy */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-150">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">
                  Step 3 of 5
                </span>
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Immediate Family Hierarchy (Bilateral)
                </h4>
                <p className="text-xs text-stone-600">
                  Seed the Core Family directory (Pillar 2 & 3) with parents and siblings who play central wedding roles.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Bride's Immediate Family */}
                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-rose-800">
                      {brideName ? `${brideName.split(' ')[0]}'s` : "Bride's"} Family
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                      Ladkiwale
                    </span>
                  </div>

                  {/* Father */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Father's Full Name</label>
                    <input
                      type="text"
                      value={brideFather}
                      onChange={(e) => setBrideFather(e.target.value)}
                      placeholder="e.g. Suresh Sharma"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                    />
                    <input
                      type="tel"
                      value={brideFatherPhone}
                      onChange={(e) => setBrideFatherPhone(e.target.value)}
                      placeholder="Phone (Optional)"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs mt-1"
                    />
                  </div>

                  {/* Mother */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Mother's Full Name</label>
                    <input
                      type="text"
                      value={brideMother}
                      onChange={(e) => setBrideMother(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                    />
                    <input
                      type="tel"
                      value={brideMotherPhone}
                      onChange={(e) => setBrideMotherPhone(e.target.value)}
                      placeholder="Phone (Optional)"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs mt-1"
                    />
                  </div>

                  {/* Siblings */}
                  <div className="space-y-2 pt-1 border-t border-rose-200/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800">Brothers & Sisters</label>
                      <button
                        type="button"
                        onClick={() => handleAddSibling('bride')}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Sibling</span>
                      </button>
                    </div>

                    {brideSiblings.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs"
                      >
                        <select
                          value={s.relation}
                          onChange={(e) =>
                            handleUpdateSibling('bride', idx, 'relation', e.target.value)
                          }
                          className="px-2 py-1 rounded-lg border border-stone-300 bg-stone-50 text-[11px] font-semibold"
                        >
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                        </select>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) =>
                            handleUpdateSibling('bride', idx, 'name', e.target.value)
                          }
                          placeholder="Sibling Name"
                          className="flex-1 px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSibling('bride', idx)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Groom's Immediate Family */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                      {groomName ? `${groomName.split(' ')[0]}'s` : "Groom's"} Family
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                      Ladkewale
                    </span>
                  </div>

                  {/* Father */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Father's Full Name</label>
                    <input
                      type="text"
                      value={groomFather}
                      onChange={(e) => setGroomFather(e.target.value)}
                      placeholder="e.g. Rajesh Verma"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                    />
                    <input
                      type="tel"
                      value={groomFatherPhone}
                      onChange={(e) => setGroomFatherPhone(e.target.value)}
                      placeholder="Phone (Optional)"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs mt-1"
                    />
                  </div>

                  {/* Mother */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">Mother's Full Name</label>
                    <input
                      type="text"
                      value={groomMother}
                      onChange={(e) => setGroomMother(e.target.value)}
                      placeholder="e.g. Rekha Verma"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                    />
                    <input
                      type="tel"
                      value={groomMotherPhone}
                      onChange={(e) => setGroomMotherPhone(e.target.value)}
                      placeholder="Phone (Optional)"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs mt-1"
                    />
                  </div>

                  {/* Siblings */}
                  <div className="space-y-2 pt-1 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800">Brothers & Sisters</label>
                      <button
                        type="button"
                        onClick={() => handleAddSibling('groom')}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Sibling</span>
                      </button>
                    </div>

                    {groomSiblings.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs"
                      >
                        <select
                          value={s.relation}
                          onChange={(e) =>
                            handleUpdateSibling('groom', idx, 'relation', e.target.value)
                          }
                          className="px-2 py-1 rounded-lg border border-stone-300 bg-stone-50 text-[11px] font-semibold"
                        >
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                        </select>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) =>
                            handleUpdateSibling('groom', idx, 'name', e.target.value)
                          }
                          placeholder="Sibling Name"
                          className="flex-1 px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSibling('groom', idx)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ceremonies & Sub-Venues */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-150">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                  Step 4 of 5
                </span>
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Ceremonies & Specific Venue Locations
                </h4>
                <p className="text-xs text-stone-600">
                  Select and configure the rituals you plan to host at {venue || 'the resort'}.
                </p>
              </div>

              <div className="space-y-3">
                {ceremonies.map((c, idx) => (
                  <div
                    key={c.type}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      c.selected
                        ? 'border-amber-400 bg-amber-50/30 shadow-xs'
                        : 'border-stone-200 bg-stone-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={c.selected}
                          onChange={() => toggleCeremony(idx)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCeremonyField(idx, 'name', e.target.value)}
                            className="font-bold text-xs sm:text-sm text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <input
                            type="time"
                            value={c.startTime}
                            onChange={(e) => updateCeremonyField(idx, 'startTime', e.target.value)}
                            className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-xs"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={c.endTime}
                            onChange={(e) => updateCeremonyField(idx, 'endTime', e.target.value)}
                            className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {c.selected && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-stone-200/80">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            <span>Specific Lawn / Hall within {venue || 'Venue'}</span>
                          </label>
                          <input
                            type="text"
                            value={c.venueArea}
                            onChange={(e) => updateCeremonyField(idx, 'venueArea', e.target.value)}
                            placeholder="e.g. Sheesh Mahal Lawn"
                            className="w-full px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600 flex items-center gap-1">
                            <Shirt className="w-3 h-3 text-purple-600" />
                            <span>Dress Code Recommendation</span>
                          </label>
                          <input
                            type="text"
                            value={c.dressCode}
                            onChange={(e) => updateCeremonyField(idx, 'dressCode', e.target.value)}
                            placeholder="e.g. Vibrant Yellow"
                            className="w-full px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Kick-off Launch */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-150">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Step 5 of 5
                </span>
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Ready to Kick off Wedding Planning!
                </h4>
                <p className="text-xs text-stone-600">
                  Review your initial setup details before generating your complete multi-pillar workspace.
                </p>
              </div>

              {/* Review Card */}
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/60 to-white p-5 space-y-4 shadow-sm">
                <div className="text-center space-y-1 border-b border-amber-200 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">
                    Grand Indian Wedding
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#7B1113]">
                    {getComputedTitle()}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {brideName} & {groomName} &bull; {city} ({venue})
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">Muhurat Date</span>
                    <strong className="text-stone-800 text-xs">{primaryDate}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">Celebration Days</span>
                    <strong className="text-stone-800 text-xs">
                      {startDate} to {endDate}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">Ceremonies</span>
                    <strong className="text-stone-800 text-xs">
                      {ceremonies.filter((c) => c.selected).length} Events
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">Immediate Family</span>
                    <strong className="text-stone-800 text-xs">
                      {2 +
                        brideSiblings.filter((s) => s.name.trim()).length +
                        2 +
                        groomSiblings.filter((s) => s.name.trim()).length}{' '}
                      Members
                    </strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-amber-200">
                  <span className="text-xs font-bold text-stone-800 block">
                    What happens next when you launch?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-stone-600">
                    <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Timeline (Pillar 1) created with selected rituals and hall allocations.</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Family Hierarchy & Tree (Pillar 2) seeded with parents & siblings.</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Core Family Guest List (Pillar 3) initialized with VIP tags.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1) handleNextStep1();
                  else if (step === 2) handleNextStep2();
                  else setStep((prev) => (prev + 1) as any);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7B1113] hover:bg-[#640e0f] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteLaunch}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7B1113] to-[#D97706] hover:opacity-95 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Wedding Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
