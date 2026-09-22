import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { Wedding, WeddingEvent } from '../db/schema';
import { db } from '../db';
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
} from 'lucide-react';

interface CreateWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DefaultFunctionPreset {
  type: WeddingEvent['type'];
  name: string;
  defaultDayOffset: number; // 0: day 1, 1: day 2, 2: day 3
  defaultTime: string;
  defaultEndTime: string;
  dressCode: string;
  selected: boolean;
}

const DEFAULT_INDIAN_FUNCTIONS: DefaultFunctionPreset[] = [
  {
    type: 'mehendi',
    name: 'Mehendi Ki Raat',
    defaultDayOffset: 0,
    defaultTime: '12:00',
    defaultEndTime: '16:00',
    dressCode: 'Vibrant Floral / Shades of Green',
    selected: true,
  },
  {
    type: 'sangeet',
    name: 'Sangeet & Cocktail Night',
    defaultDayOffset: 0,
    defaultTime: '19:30',
    defaultEndTime: '01:00',
    dressCode: 'Glamorous Indo-Western / Sequins',
    selected: true,
  },
  {
    type: 'haldi',
    name: 'Haldi & Phoolon Ki Holi',
    defaultDayOffset: 1,
    defaultTime: '10:00',
    defaultEndTime: '13:00',
    dressCode: 'Sunshine Yellow / Lehariya',
    selected: true,
  },
  {
    type: 'wedding',
    name: 'Shubh Vivah & Royal Pheras',
    defaultDayOffset: 1,
    defaultTime: '18:30',
    defaultEndTime: '23:00',
    dressCode: 'Royal Traditional / Sherwani & Zari',
    selected: true,
  },
  {
    type: 'reception',
    name: 'Grand Royal Reception',
    defaultDayOffset: 2,
    defaultTime: '20:00',
    defaultEndTime: '23:30',
    dressCode: 'Formal Elegance / Tuxedos & Silk Sarees',
    selected: true,
  },
];

export const CreateWeddingModal: React.FC<CreateWeddingModalProps> = ({ isOpen, onClose }) => {
  const { createWedding } = useWedding();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Couple & Sides
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideSideName, setBrideSideName] = useState('');
  const [groomSideName, setGroomSideName] = useState('');

  // Step 2: Dates & Location
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [primaryDate, setPrimaryDate] = useState(todayStr);
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [weddingTitle, setWeddingTitle] = useState('');

  // Step 3: Functions
  const [functions, setFunctions] = useState<DefaultFunctionPreset[]>(DEFAULT_INDIAN_FUNCTIONS);

  if (!isOpen) return null;

  // Auto-generate title if empty
  const getComputedTitle = () => {
    if (weddingTitle.trim()) return weddingTitle.trim();
    if (brideName && groomName) return `${brideName} & ${groomName}'s Vivah`;
    return 'Our Grand Indian Wedding';
  };

  const handleNextStep1 = () => {
    if (!brideName.trim() || !groomName.trim()) {
      alert('Please enter both Bride and Groom names.');
      return;
    }
    if (!brideSideName.trim()) setBrideSideName(`Ladkiwale (${brideName.split(' ')[0]}'s Family)`);
    if (!groomSideName.trim()) setGroomSideName(`Ladkewale (${groomName.split(' ')[0]}'s Family)`);
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!city.trim() || !venue.trim()) {
      alert('Please specify the destination city and primary venue.');
      return;
    }
    setStep(3);
  };

  const toggleFunctionSelection = (index: number) => {
    setFunctions((prev) =>
      prev.map((f, i) => (i === index ? { ...f, selected: !f.selected } : f))
    );
  };

  const handleComplete = async () => {
    const weddingId = `wedding-${Date.now()}`;
    const computedTitle = getComputedTitle();

    const newWedding: Wedding = {
      id: weddingId,
      title: computedTitle,
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      brideSideName: brideSideName.trim(),
      groomSideName: groomSideName.trim(),
      startDate,
      endDate,
      primaryDate,
      city: city.trim(),
      venue: venue.trim(),
      theme: 'royal-festive',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Calculate dates for selected functions
    const startDateTime = new Date(startDate);
    const selectedFunctions = functions.filter((f) => f.selected);

    const weddingEvents: WeddingEvent[] = selectedFunctions.map((f, idx) => {
      const eventDate = new Date(startDateTime);
      eventDate.setDate(startDateTime.getDate() + f.defaultDayOffset);
      const dateStr = eventDate.toISOString().split('T')[0];

      return {
        id: `evt-${weddingId}-${idx}`,
        weddingId,
        name: f.name,
        type: f.type,
        date: dateStr,
        startTime: f.defaultTime,
        endTime: f.defaultEndTime,
        venue: venue.trim(),
        dressCode: f.dressCode,
        orderIndex: idx + 1,
      };
    });

    // Save wedding and events to IndexedDB
    await createWedding(newWedding);
    if (weddingEvents.length > 0) {
      await db.events.bulkPut(weddingEvents);
    }

    // Celebratory Confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-theme-card border border-theme-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-theme-border bg-gradient-to-r from-theme-primary to-theme-accent text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-theme-secondary-light" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl">Create New Indian Wedding</h3>
              <p className="text-xs text-white/80">Step {step} of 3 • {step === 1 ? 'The Couple & Families' : step === 2 ? 'Dates & Destination' : 'Ceremonies & Functions'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-3 bg-theme-background border-b border-theme-border">
          <div className={`h-1.5 transition-colors ${step >= 1 ? 'bg-theme-primary' : 'bg-transparent'}`} />
          <div className={`h-1.5 transition-colors ${step >= 2 ? 'bg-theme-primary' : 'bg-transparent'}`} />
          <div className={`h-1.5 transition-colors ${step >= 3 ? 'bg-theme-primary' : 'bg-transparent'}`} />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: The Couple & Families */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="border-b border-theme-border/60 pb-3">
                <h4 className="font-serif font-bold text-lg text-theme-text-main">The Blessed Couple</h4>
                <p className="text-xs text-theme-text-muted">Enter the Bride and Groom names to initiate the wedding workspace.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Bride's Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-theme-primary" />
                    <span>Groom's Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="e.g. Aarav Verma"
                    className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-theme-border/60 pt-4">
                <h4 className="font-serif font-bold text-sm text-theme-text-main mb-1">Family Sides (Pariwaar)</h4>
                <p className="text-xs text-theme-text-muted mb-3">Custom names for the Bride's and Groom's respective sides.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-theme-text-muted">
                      Bride's Side (Ladkiwale) Title
                    </label>
                    <input
                      type="text"
                      value={brideSideName}
                      onChange={(e) => setBrideSideName(e.target.value)}
                      placeholder="e.g. Ladkiwale (Sharma Pariwaar)"
                      className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-theme-text-muted">
                      Groom's Side (Ladkewale) Title
                    </label>
                    <input
                      type="text"
                      value={groomSideName}
                      onChange={(e) => setGroomSideName(e.target.value)}
                      placeholder="e.g. Ladkewale (Verma Pariwaar)"
                      className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Dates & Destination */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="border-b border-theme-border/60 pb-3">
                <h4 className="font-serif font-bold text-lg text-theme-text-main">Dates & Destination</h4>
                <p className="text-xs text-theme-text-muted">Configure the wedding celebration date span and venue.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-theme-primary" />
                    <span>Celebrations Start *</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) setEndDate(e.target.value);
                      if (e.target.value > primaryDate) setPrimaryDate(e.target.value);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-theme-secondary" />
                    <span>Muhurat / Main Day *</span>
                  </label>
                  <input
                    type="date"
                    value={primaryDate}
                    onChange={(e) => setPrimaryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-theme-accent" />
                    <span>Celebrations End *</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-theme-secondary" />
                    <span>City / Destination *</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Udaipur, Jaipur, Goa, Delhi NCR"
                    className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                    <span>Primary Venue / Resort *</span>
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. The Leela Palace, Taj Lake Palace"
                    className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-theme-text-muted">
                  Custom Wedding Project Title (Optional)
                </label>
                <input
                  type="text"
                  value={weddingTitle}
                  onChange={(e) => setWeddingTitle(e.target.value)}
                  placeholder={getComputedTitle()}
                  className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Ceremonies & Functions */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="border-b border-theme-border/60 pb-3">
                <h4 className="font-serif font-bold text-lg text-theme-text-main">Indian Wedding Ceremonies</h4>
                <p className="text-xs text-theme-text-muted">Select the functions to auto-schedule into your Pillar 1 timeline (fully customizable later).</p>
              </div>

              <div className="space-y-3">
                {functions.map((fn, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleFunctionSelection(idx)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      fn.selected
                        ? 'border-theme-primary bg-theme-primary-light/30 shadow-2xs'
                        : 'border-theme-border hover:bg-theme-background opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          fn.selected
                            ? 'bg-theme-primary text-white'
                            : 'border-2 border-theme-border text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-theme-text-main">{fn.name}</div>
                        <div className="text-xs text-theme-text-muted flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{fn.type}</span>
                          <span>•</span>
                          <span>{fn.defaultTime} - {fn.defaultEndTime}</span>
                          <span>•</span>
                          <span className="italic">{fn.dressCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-theme-background/60 border-t border-theme-border flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-theme-text-main text-xs font-semibold hover:bg-theme-border/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={step === 1 ? handleNextStep1 : handleNextStep2}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-theme-primary to-theme-accent text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-theme-secondary-light" />
              <span>Launch Wedding Hub</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
