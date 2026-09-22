import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import {
  Wedding,
  TravelItem,
  Vehicle,
  VehicleSeat,
  GuestParty,
  Guest,
} from '../../db/schema';
import {
  Car,
  Plane,
  Train,
  Plus,
  Edit2,
  Trash2,
  Users,
  Clock,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  X,
  Sparkles,
  MapPin,
  Key,
  UserCheck,
  Luggage,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface TravelManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export interface VehiclePreset {
  name: string;
  category: Vehicle['category'];
  country: string;
  driveSide: 'RHD' | 'LHD';
  luggageCapacityBags: number;
}

export const COUNTRY_VEHICLE_PRESETS: {
  country: string;
  flag: string;
  vehicles: VehiclePreset[];
}[] = [
  {
    country: 'India',
    flag: '🇮🇳',
    vehicles: [
      { name: 'Toyota Innova Crysta (7 Seater)', category: 'suv_7', country: 'India', driveSide: 'RHD', luggageCapacityBags: 4 },
      { name: 'Toyota Innova Hycross (7/8 Seater)', category: 'suv_7', country: 'India', driveSide: 'RHD', luggageCapacityBags: 4 },
      { name: 'Maruti Suzuki Ertiga (7 Seater)', category: 'suv_7', country: 'India', driveSide: 'RHD', luggageCapacityBags: 3 },
      { name: 'Mahindra Scorpio-N (7 Seater)', category: 'suv_7', country: 'India', driveSide: 'RHD', luggageCapacityBags: 4 },
      { name: 'Mahindra XUV700 (7 Seater)', category: 'suv_7', country: 'India', driveSide: 'RHD', luggageCapacityBags: 3 },
      { name: 'Toyota Fortuner 4x4 (7 Seater)', category: 'suv_7', country: 'India', driveSide: 'RHD', luggageCapacityBags: 5 },
      { name: 'Force Urbania / Traveller (14 Seater)', category: 'van_14', country: 'India', driveSide: 'RHD', luggageCapacityBags: 12 },
      { name: 'Mercedes-Benz E-Class Luxury (5 Seater)', category: 'sedan_5', country: 'India', driveSide: 'RHD', luggageCapacityBags: 3 },
      { name: 'Honda City / Hyundai Verna (5 Seater)', category: 'sedan_5', country: 'India', driveSide: 'RHD', luggageCapacityBags: 2 },
    ],
  },
  {
    country: 'USA',
    flag: '🇺🇸',
    vehicles: [
      { name: 'Cadillac Escalade ESV (7 Seater)', category: 'suv_7', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 6 },
      { name: 'Chevrolet Suburban / Tahoe (7/8 Seater)', category: 'suv_7', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 6 },
      { name: 'GMC Yukon XL Denali (8 Seater)', category: 'suv_7', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 6 },
      { name: 'Chrysler Pacifica Minivan (7 Seater)', category: 'suv_7', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 5 },
      { name: 'Ford Transit Passenger Van (14 Seater)', category: 'van_14', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 10 },
      { name: 'Tesla Model X (6/7 Seater)', category: 'suv_7', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 3 },
      { name: 'Lincoln Navigator L (7 Seater)', category: 'suv_7', country: 'USA', driveSide: 'LHD', luggageCapacityBags: 6 },
    ],
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    vehicles: [
      { name: 'Toyota Sienna AWD Hybrid (7/8 Seater)', category: 'suv_7', country: 'Canada', driveSide: 'LHD', luggageCapacityBags: 5 },
      { name: 'Ford Expedition Max 4x4 (8 Seater)', category: 'suv_7', country: 'Canada', driveSide: 'LHD', luggageCapacityBags: 6 },
      { name: 'Honda Odyssey Minivan (8 Seater)', category: 'suv_7', country: 'Canada', driveSide: 'LHD', luggageCapacityBags: 5 },
      { name: 'Subaru Ascent 3-Row (7/8 Seater)', category: 'suv_7', country: 'Canada', driveSide: 'LHD', luggageCapacityBags: 4 },
      { name: 'Chevrolet Express Passenger Van (12 Seater)', category: 'van_14', country: 'Canada', driveSide: 'LHD', luggageCapacityBags: 10 },
    ],
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    vehicles: [
      { name: 'Toyota LandCruiser Prado (7 Seater)', category: 'suv_7', country: 'Australia', driveSide: 'RHD', luggageCapacityBags: 5 },
      { name: 'Kia Carnival People Mover (8 Seater)', category: 'suv_7', country: 'Australia', driveSide: 'RHD', luggageCapacityBags: 6 },
      { name: 'Toyota HiAce Commuter (12-14 Seater)', category: 'van_14', country: 'Australia', driveSide: 'RHD', luggageCapacityBags: 10 },
      { name: 'Hyundai Staria 8-Seat Luxury MPV', category: 'suv_7', country: 'Australia', driveSide: 'RHD', luggageCapacityBags: 5 },
      { name: 'Mazda CX-90 / CX-9 (7 Seater)', category: 'suv_7', country: 'Australia', driveSide: 'RHD', luggageCapacityBags: 4 },
    ],
  },
  {
    country: 'UK',
    flag: '🇬🇧',
    vehicles: [
      { name: 'Mercedes-Benz V-Class Chauffeur (7/8 Seater)', category: 'suv_7', country: 'UK', driveSide: 'RHD', luggageCapacityBags: 6 },
      { name: 'Range Rover Long Wheelbase (5/7 Seater)', category: 'suv_7', country: 'UK', driveSide: 'RHD', luggageCapacityBags: 5 },
      { name: 'Volkswagen Multivan / Caravelle (7 Seater)', category: 'suv_7', country: 'UK', driveSide: 'RHD', luggageCapacityBags: 5 },
      { name: 'Ford Tourneo Custom Executive (8/9 Seater)', category: 'suv_7', country: 'UK', driveSide: 'RHD', luggageCapacityBags: 7 },
    ],
  },
];

export const TravelManager: React.FC<TravelManagerProps> = ({
  wedding,
}) => {
  const travelItems = useLiveQuery(
    () => db.travelItems.where('weddingId').equals(wedding.id).sortBy('dateTime'),
    [wedding.id]
  );
  const vehicles = useLiveQuery(
    () => db.vehicles.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const vehicleSeats = useLiveQuery(
    () => db.vehicleSeats.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const parties = useLiveQuery(
    () => db.guestParties.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const guests = useLiveQuery(
    () => db.guests.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  const [activeTab, setActiveTab] = useState<'fleet' | 'schedule'>('fleet');

  // Modals
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isSeatAssignModalOpen, setIsSeatAssignModalOpen] = useState(false);

  // Active seat assignment target
  const [targetSeat, setTargetSeat] = useState<{
    vehicleId: string;
    seatIndex: number;
    role: 'driver' | 'co_driver' | 'passenger';
  } | null>(null);
  const [selectedGuestForSeat, setSelectedGuestForSeat] = useState<string>('');

  // Guest tray search and filter
  const [guestSearch, setGuestSearch] = useState('');
  const [guestTrayFilter, setGuestTrayFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

  // Travel Form State
  const [travelPartyId, setTravelPartyId] = useState('');
  const [travelDirection, setTravelDirection] = useState<'arrival' | 'departure'>('arrival');
  const [travelMode, setTravelMode] = useState<'flight' | 'train' | 'personal_car' | 'bus'>('flight');
  const [carrierNumber, setCarrierNumber] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationHub, setDestinationHub] = useState('');
  const [travelDateTime, setTravelDateTime] = useState(`${wedding.startDate}T10:00`);
  const [travelPnr, setTravelPnr] = useState('');
  const [travelNotes, setTravelNotes] = useState('');

  // Vehicle Form State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<Vehicle['category']>('suv_7');
  const [plateNumber, setPlateNumber] = useState('');
  const [isPersonal, setIsPersonal] = useState(false);
  const [ownerGuestId, setOwnerGuestId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driveSide, setDriveSide] = useState<'RHD' | 'LHD'>('RHD');
  const [luggageCapacityBags, setLuggageCapacityBags] = useState<number>(4);
  const [countryPreset, setCountryPreset] = useState('India');

  // Map of guest ID -> vehicle seat info for quick tray status lookup
  const guestAssignmentMap = useMemo(() => {
    const map = new Map<string, { vehicleName: string; vehicleId: string; seatIndex: number }>();
    if (!vehicleSeats || !vehicles) return map;

    const vMap = new Map(vehicles.map((v) => [v.id, v.name]));
    for (const s of vehicleSeats) {
      if (s.guestId) {
        map.set(s.guestId, {
          vehicleName: vMap.get(s.vehicleId) || 'Vehicle',
          vehicleId: s.vehicleId,
          seatIndex: s.seatIndex,
        });
      }
    }
    return map;
  }, [vehicleSeats, vehicles]);

  // Filtered guest list for left tray
  const filteredTrayGuests = useMemo(() => {
    if (!guests) return [];
    return guests.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        (g.specialAssistance && g.specialAssistance.toLowerCase().includes(guestSearch.toLowerCase()));

      const isAssigned = guestAssignmentMap.has(g.id);
      const matchesFilter =
        guestTrayFilter === 'all'
          ? true
          : guestTrayFilter === 'assigned'
          ? isAssigned
          : !isAssigned;

      return matchesSearch && matchesFilter;
    });
  }, [guests, guestSearch, guestTrayFilter, guestAssignmentMap]);

  // Open Add Travel
  const openAddTravel = () => {
    setTravelPartyId(parties?.[0]?.id || '');
    setTravelDirection('arrival');
    setTravelMode('flight');
    setCarrierNumber('6E 2341');
    setOriginCity('Mumbai');
    setDestinationHub(`${wedding.city} Airport`);
    setTravelDateTime(`${wedding.startDate}T10:00`);
    setTravelPnr('');
    setTravelNotes('');
    setIsTravelModalOpen(true);
  };

  const handleSaveTravel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelPartyId) return;

    const partyGuests = guests?.filter((g) => g.partyId === travelPartyId) || [];
    const guestIds = partyGuests.map((g) => g.id);

    const newTravel: TravelItem = {
      id: `trv-${Date.now()}`,
      weddingId: wedding.id,
      partyId: travelPartyId,
      guestIds,
      direction: travelDirection,
      mode: travelMode,
      carrierNumber: carrierNumber.trim() || undefined,
      originCity: originCity.trim() || undefined,
      destinationHub: destinationHub.trim() || undefined,
      dateTime: travelDateTime,
      pnr: travelPnr.trim() || undefined,
      notes: travelNotes.trim() || undefined,
    };

    await db.travelItems.put(newTravel);
    setIsTravelModalOpen(false);
  };

  const handleDeleteTravel = async (id: string) => {
    if (confirm('Remove this arrival record?')) {
      await db.travelItems.delete(id);
    }
  };

  // Open Add Vehicle
  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleName('Toyota Innova Crysta (Airport Shuttle)');
    setVehicleCategory('suv_7');
    setPlateNumber('');
    setIsPersonal(false);
    setOwnerGuestId('');
    setDriverName('Mukesh Kumar');
    setDriverPhone('+91 98765 43210');
    setDriveSide('RHD');
    setLuggageCapacityBags(4);
    setCountryPreset('India');
    setIsVehicleModalOpen(true);
  };

  const openEditVehicle = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setVehicleName(veh.name);
    setVehicleCategory(veh.category);
    setPlateNumber(veh.plateNumber || '');
    setIsPersonal(veh.isPersonalVehicle);
    setOwnerGuestId(veh.ownerGuestId || '');
    setDriverName(veh.driverName || '');
    setDriverPhone(veh.driverPhone || '');
    setDriveSide(veh.driveSide || 'RHD');
    setLuggageCapacityBags(veh.luggageCapacityBags || 4);
    setCountryPreset(veh.countryPreset || 'India');
    setIsVehicleModalOpen(true);
  };

  const handleApplyVehiclePreset = (preset: VehiclePreset) => {
    setVehicleName(preset.name);
    setVehicleCategory(preset.category);
    setDriveSide(preset.driveSide);
    setLuggageCapacityBags(preset.luggageCapacityBags);
    setCountryPreset(preset.country);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim()) return;

    const vehId = editingVehicle ? editingVehicle.id : `veh-${Date.now()}`;
    const vehicleRecord: Vehicle = {
      id: vehId,
      weddingId: wedding.id,
      name: vehicleName.trim(),
      category: vehicleCategory,
      plateNumber: plateNumber.trim() || undefined,
      isPersonalVehicle: isPersonal,
      ownerGuestId: isPersonal ? ownerGuestId : undefined,
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      driveSide,
      luggageCapacityBags: Number(luggageCapacityBags) || 4,
      countryPreset,
      status: 'scheduled',
    };

    await db.vehicles.put(vehicleRecord);
    setIsVehicleModalOpen(false);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Delete this vehicle and clear all its assigned seats?')) {
      await db.transaction('rw', [db.vehicles, db.vehicleSeats], async () => {
        await db.vehicles.delete(id);
        await db.vehicleSeats.where('vehicleId').equals(id).delete();
      });
    }
  };

  const handleToggleDriveSide = async (veh: Vehicle) => {
    const nextSide: 'RHD' | 'LHD' = veh.driveSide === 'LHD' ? 'RHD' : 'LHD';
    await db.vehicles.update(veh.id, { driveSide: nextSide });
  };

  // CORE SEAT ASSIGNMENT AND UNASSIGNMENT (Bugfix & Enhanced)
  const assignGuestToSeat = async (
    vehicleId: string,
    seatIndex: number,
    seatRole: 'driver' | 'co_driver' | 'passenger',
    guestId: string
  ) => {
    // 1. If guest is currently seated in another seat, clear that seat
    const allSeats = await db.vehicleSeats.where('weddingId').equals(wedding.id).toArray();
    const guestPriorSeat = allSeats.find((s) => s.guestId === guestId);
    if (guestPriorSeat) {
      await db.vehicleSeats.delete(guestPriorSeat.id);
    }

    // 2. Put record for this seat
    const existingTargetSeat = allSeats.find(
      (s) => s.vehicleId === vehicleId && s.seatIndex === seatIndex
    );
    const seatId = existingTargetSeat ? existingTargetSeat.id : `seat-${vehicleId}-${seatIndex}`;

    await db.vehicleSeats.put({
      id: seatId,
      weddingId: wedding.id,
      vehicleId,
      seatIndex,
      seatRole,
      guestId,
    });
  };

  const handleUnassignSeat = async (vehicleId: string, seatIndex: number) => {
    // Find any existing seat records for this vehicle and seat index
    const matchingSeats = await db.vehicleSeats
      .where('vehicleId')
      .equals(vehicleId)
      .toArray();

    const target = matchingSeats.find((s) => s.seatIndex === seatIndex);
    if (target) {
      await db.vehicleSeats.delete(target.id);
    }
    // Also delete by deterministic IDs to cover sample data variants
    await db.vehicleSeats.delete(`seat-${vehicleId}-${seatIndex}`);
    const shortVehNum = vehicleId.replace('veh-', '');
    await db.vehicleSeats.delete(`seat-${shortVehNum}-${seatIndex}`);
  };

  const openSeatModal = (
    vehicleId: string,
    seatIndex: number,
    role: 'driver' | 'co_driver' | 'passenger'
  ) => {
    const existing = vehicleSeats?.find(
      (s) => s.vehicleId === vehicleId && s.seatIndex === seatIndex
    );
    setTargetSeat({ vehicleId, seatIndex, role });
    setSelectedGuestForSeat(existing?.guestId || '');
    setIsSeatAssignModalOpen(true);
  };

  const handleSaveModalSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSeat) return;

    if (selectedGuestForSeat) {
      await assignGuestToSeat(
        targetSeat.vehicleId,
        targetSeat.seatIndex,
        targetSeat.role,
        selectedGuestForSeat
      );
    } else {
      await handleUnassignSeat(targetSeat.vehicleId, targetSeat.seatIndex);
    }

    setIsSeatAssignModalOpen(false);
  };

  // Fleet Metrics
  const totalVehiclesCount = vehicles?.length || 0;
  const totalSeatsAssigned = vehicleSeats?.filter((s) => !!s.guestId).length || 0;
  const totalLuggageCapacity = vehicles?.reduce((acc, v) => acc + (v.luggageCapacityBags || 4), 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Mode Switcher */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                Travel Logistics & Vehicle Seating Fleet
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 5: Drag-and-drop guest seating (15-85 split), RHD/LHD steering toggle, country models (India, USA, Aus, Canada, UK), and luggage boot capacity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-theme-background border border-theme-border p-1 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('fleet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'fleet'
                    ? 'bg-theme-card text-theme-primary shadow-xs'
                    : 'text-theme-text-muted hover:text-theme-text-main'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Vehicle Fleet ({totalVehiclesCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-theme-card text-theme-primary shadow-xs'
                    : 'text-theme-text-muted hover:text-theme-text-main'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Arrival Schedule ({travelItems?.length || 0})</span>
              </button>
            </div>

            {activeTab === 'fleet' ? (
              <button
                onClick={openAddVehicle}
                className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Vehicle</span>
              </button>
            ) : (
              <button
                onClick={openAddTravel}
                className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Arrival Log</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: FLEET & PICTORIAL VEHICLE SEATING WITH 15-85 RATIO */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 15-20% COLUMN: Guest Tray (Sticky, Draggable) */}
          <div className="lg:col-span-3 xl:col-span-2 bg-theme-card border border-theme-border rounded-3xl p-4 shadow-2xs space-y-3 lg:sticky lg:top-20 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-theme-primary" />
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-theme-text-main">
                  Guest Tray
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-theme-primary-light/60 text-theme-primary px-2 py-0.5 rounded-full">
                {filteredTrayGuests.length} Guests
              </span>
            </div>

            {/* Tray Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-text-muted" />
              <input
                type="text"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Search guests..."
                className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-theme-border bg-theme-background text-[11px] focus:outline-hidden focus:ring-1 focus:ring-theme-primary"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-theme-background p-0.5 rounded-lg text-[10px] font-semibold">
              <button
                onClick={() => setGuestTrayFilter('all')}
                className={`flex-1 py-1 rounded transition-colors ${
                  guestTrayFilter === 'all'
                    ? 'bg-theme-card text-theme-primary shadow-2xs font-bold'
                    : 'text-theme-text-muted'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGuestTrayFilter('unassigned')}
                className={`flex-1 py-1 rounded transition-colors ${
                  guestTrayFilter === 'unassigned'
                    ? 'bg-theme-card text-theme-primary shadow-2xs font-bold'
                    : 'text-theme-text-muted'
                }`}
              >
                Unseated
              </button>
              <button
                onClick={() => setGuestTrayFilter('assigned')}
                className={`flex-1 py-1 rounded transition-colors ${
                  guestTrayFilter === 'assigned'
                    ? 'bg-theme-card text-theme-primary shadow-2xs font-bold'
                    : 'text-theme-text-muted'
                }`}
              >
                Seated
              </button>
            </div>

            {/* Draggable Guest Chips List */}
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {filteredTrayGuests.map((g) => {
                const assigned = guestAssignmentMap.get(g.id);
                const party = parties?.find((p) => p.id === g.partyId);

                return (
                  <div
                    key={g.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', g.id);
                    }}
                    className={`p-2 rounded-xl border text-xs cursor-grab active:cursor-grabbing transition-all select-none hover:scale-[1.02] shadow-2xs ${
                      assigned
                        ? 'bg-emerald-500/5 border-emerald-300/80 text-emerald-950'
                        : 'bg-theme-background border-theme-border hover:border-theme-primary text-theme-text-main'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-[11px] truncate flex items-center gap-1">
                        <span>
                          {g.ageCategory === 'elder'
                            ? '👴'
                            : g.ageCategory === 'child'
                            ? '🧒'
                            : g.ageCategory === 'infant'
                            ? '👶'
                            : '👤'}
                        </span>
                        <span className="truncate">{g.name}</span>
                      </div>

                      {assigned ? (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"
                          title={`Seated in: ${assigned.vehicleName}`}
                        />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0 mt-1"
                          title="Unseated"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-theme-text-muted mt-1">
                      <span className="truncate">{party?.partyName || 'Family'}</span>
                      {assigned && (
                        <span className="text-[9px] font-semibold text-emerald-700 truncate max-w-[80px]">
                          {assigned.vehicleName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredTrayGuests.length === 0 && (
                <div className="text-center py-6 text-theme-text-muted text-xs italic">
                  No guests found.
                </div>
              )}
            </div>

            <div className="p-2 bg-theme-background/60 rounded-xl border border-theme-border/60 text-[10px] text-theme-text-muted flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-theme-secondary flex-shrink-0" />
              <span>Drag any guest onto any seat to allocate!</span>
            </div>
          </div>

          {/* RIGHT 80-85% AREA: Fleet Vehicles Grid & Pictorial Layout */}
          <div className="lg:col-span-9 xl:col-span-10 space-y-6">
            {/* Top Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-theme-card border border-theme-border p-4 rounded-3xl shadow-2xs">
              <div className="p-3 bg-theme-background rounded-2xl border border-theme-border/60">
                <div className="text-[10px] uppercase font-bold text-theme-text-muted">Total Fleet</div>
                <div className="text-xl font-serif font-bold text-theme-primary mt-0.5">
                  {totalVehiclesCount} Cabs / Cars
                </div>
              </div>
              <div className="p-3 bg-theme-background rounded-2xl border border-theme-border/60">
                <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Guests Seated</span>
                </div>
                <div className="text-xl font-serif font-bold text-emerald-700 mt-0.5">
                  {totalSeatsAssigned} Seated
                </div>
              </div>
              <div className="p-3 bg-theme-background rounded-2xl border border-theme-border/60">
                <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
                  <Luggage className="w-3 h-3" />
                  <span>Luggage Capacity</span>
                </div>
                <div className="text-xl font-serif font-bold text-amber-700 mt-0.5">
                  {totalLuggageCapacity} Suitcases
                </div>
              </div>
              <div className="p-3 bg-theme-background rounded-2xl border border-theme-border/60">
                <div className="text-[10px] uppercase font-bold text-indigo-700">Country Presets</div>
                <div className="text-xs font-semibold text-theme-text-main mt-1.5">
                  🇮🇳 India &bull; 🇺🇸 USA &bull; 🇦🇺 AUS &bull; 🇨🇦 CAN &bull; 🇬🇧 UK
                </div>
              </div>
            </div>

            {/* Vehicle Fleet Cards */}
            {vehicles && vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {vehicles.map((vehicle) => {
                  const vSeats = vehicleSeats?.filter((s) => s.vehicleId === vehicle.id) || [];
                  const getSeatGuest = (seatIndex: number) => {
                    const s = vSeats.find((x) => x.seatIndex === seatIndex);
                    return s?.guestId ? guests?.find((g) => g.id === s.guestId) : null;
                  };

                  const isRHD = vehicle.driveSide !== 'LHD'; // Default RHD (India, UK, Australia)

                  return (
                    <div
                      key={vehicle.id}
                      className="bg-theme-card border border-theme-border hover:border-theme-primary/40 rounded-3xl p-5 shadow-2xs space-y-4 transition-all"
                    >
                      {/* Vehicle Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-theme-border/60 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-theme-primary-light text-theme-primary text-[10px] font-bold uppercase tracking-wider">
                              {vehicle.category.replace('_', ' ')}
                            </span>
                            {vehicle.countryPreset && (
                              <span className="px-2 py-0.5 rounded-full bg-theme-background border border-theme-border text-[10px] font-bold text-theme-text-muted">
                                {vehicle.countryPreset}
                              </span>
                            )}
                            {vehicle.isPersonalVehicle && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Personal Car
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif font-bold text-base text-theme-text-main">
                            {vehicle.name}
                          </h4>

                          {vehicle.plateNumber && (
                            <div className="inline-block px-2 py-0.5 rounded-md border border-stone-400 bg-stone-100 text-[10px] font-mono font-bold text-stone-800">
                              {vehicle.plateNumber}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* RHD / LHD Quick Toggle */}
                          <button
                            onClick={() => handleToggleDriveSide(vehicle)}
                            className="px-2.5 py-1 rounded-xl border border-theme-border bg-theme-background text-[11px] font-bold text-theme-text-main hover:bg-theme-border/30 transition-colors shadow-2xs"
                            title="Click to toggle between Right-Hand Drive and Left-Hand Drive"
                          >
                            {isRHD ? 'RHD (🇮🇳/🇬🇧/🇦🇺)' : 'LHD (🇺🇸/🇨🇦)'}
                          </button>

                          <button
                            onClick={() => openEditVehicle(vehicle)}
                            className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-primary hover:bg-theme-background"
                            title="Edit Vehicle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="p-1.5 rounded-lg text-theme-text-muted hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Driver Details & Luggage Capacity */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-theme-background/60 p-2.5 rounded-2xl border border-theme-border/50">
                        <div className="flex items-center gap-1.5 text-theme-text-main">
                          <UserCheck className="w-3.5 h-3.5 text-theme-secondary flex-shrink-0" />
                          <span className="font-semibold">
                            Driver: {vehicle.driverName || 'Designated Driver'}
                          </span>
                          {vehicle.driverPhone && (
                            <a
                              href={`tel:${vehicle.driverPhone}`}
                              className="text-theme-primary hover:underline ml-1"
                            >
                              ({vehicle.driverPhone})
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-amber-800 font-bold bg-amber-100/70 px-2.5 py-0.5 rounded-lg text-[11px]">
                          <Luggage className="w-3.5 h-3.5 text-amber-700" />
                          <span>Boot Space: {vehicle.luggageCapacityBags || 4} Bags</span>
                        </div>
                      </div>

                      {/* PICTORIAL VEHICLE CHASSIS CONTAINER */}
                      <div className="p-4 rounded-3xl bg-theme-background/80 border border-theme-border/70 shadow-inner relative flex flex-col items-center max-w-sm mx-auto">
                        {/* Vehicle Windshield & Front Bumper */}
                        <div className="w-36 h-4 bg-stone-300 rounded-t-full border border-stone-400 mb-2 flex items-center justify-center">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-stone-600">
                            Front Windshield
                          </span>
                        </div>

                        {/* ROW 1: FRONT ROW (Driver & Co-Driver according to RHD / LHD) */}
                        <div className="grid grid-cols-2 gap-3 w-full mb-3">
                          {isRHD ? (
                            <>
                              {/* Left: Co-Driver Seat (Index 1) */}
                              <SeatDropZone
                                role="co_driver"
                                seatIndex={1}
                                guest={getSeatGuest(1)}
                                onAssignGuest={(gId) =>
                                  assignGuestToSeat(vehicle.id, 1, 'co_driver', gId)
                                }
                                onUnassign={() => handleUnassignSeat(vehicle.id, 1)}
                                onClick={() => openSeatModal(vehicle.id, 1, 'co_driver')}
                              />
                              {/* Right: Driver Seat (Index 0) */}
                              <SeatDropZone
                                role="driver"
                                seatIndex={0}
                                guest={getSeatGuest(0)}
                                onAssignGuest={(gId) =>
                                  assignGuestToSeat(vehicle.id, 0, 'driver', gId)
                                }
                                onUnassign={() => handleUnassignSeat(vehicle.id, 0)}
                                onClick={() => openSeatModal(vehicle.id, 0, 'driver')}
                              />
                            </>
                          ) : (
                            <>
                              {/* Left: Driver Seat (Index 0) */}
                              <SeatDropZone
                                role="driver"
                                seatIndex={0}
                                guest={getSeatGuest(0)}
                                onAssignGuest={(gId) =>
                                  assignGuestToSeat(vehicle.id, 0, 'driver', gId)
                                }
                                onUnassign={() => handleUnassignSeat(vehicle.id, 0)}
                                onClick={() => openSeatModal(vehicle.id, 0, 'driver')}
                              />
                              {/* Right: Co-Driver Seat (Index 1) */}
                              <SeatDropZone
                                role="co_driver"
                                seatIndex={1}
                                guest={getSeatGuest(1)}
                                onAssignGuest={(gId) =>
                                  assignGuestToSeat(vehicle.id, 1, 'co_driver', gId)
                                }
                                onUnassign={() => handleUnassignSeat(vehicle.id, 1)}
                                onClick={() => openSeatModal(vehicle.id, 1, 'co_driver')}
                              />
                            </>
                          )}
                        </div>

                        {/* ROW 2: MIDDLE ROW (Passengers) */}
                        <div className="grid grid-cols-2 gap-3 w-full mb-3">
                          <SeatDropZone
                            role="passenger"
                            seatIndex={2}
                            guest={getSeatGuest(2)}
                            onAssignGuest={(gId) =>
                              assignGuestToSeat(vehicle.id, 2, 'passenger', gId)
                            }
                            onUnassign={() => handleUnassignSeat(vehicle.id, 2)}
                            onClick={() => openSeatModal(vehicle.id, 2, 'passenger')}
                          />
                          <SeatDropZone
                            role="passenger"
                            seatIndex={3}
                            guest={getSeatGuest(3)}
                            onAssignGuest={(gId) =>
                              assignGuestToSeat(vehicle.id, 3, 'passenger', gId)
                            }
                            onUnassign={() => handleUnassignSeat(vehicle.id, 3)}
                            onClick={() => openSeatModal(vehicle.id, 3, 'passenger')}
                          />
                        </div>

                        {/* ROW 3: REAR ROW (If SUV 7-seater or Van) */}
                        {vehicle.category === 'suv_7' && (
                          <div className="grid grid-cols-3 gap-2 w-full mb-3">
                            <SeatDropZone
                              role="passenger"
                              seatIndex={4}
                              guest={getSeatGuest(4)}
                              onAssignGuest={(gId) =>
                                assignGuestToSeat(vehicle.id, 4, 'passenger', gId)
                              }
                              onUnassign={() => handleUnassignSeat(vehicle.id, 4)}
                              onClick={() => openSeatModal(vehicle.id, 4, 'passenger')}
                            />
                            <SeatDropZone
                              role="passenger"
                              seatIndex={5}
                              guest={getSeatGuest(5)}
                              onAssignGuest={(gId) =>
                                assignGuestToSeat(vehicle.id, 5, 'passenger', gId)
                              }
                              onUnassign={() => handleUnassignSeat(vehicle.id, 5)}
                              onClick={() => openSeatModal(vehicle.id, 5, 'passenger')}
                            />
                            <SeatDropZone
                              role="passenger"
                              seatIndex={6}
                              guest={getSeatGuest(6)}
                              onAssignGuest={(gId) =>
                                assignGuestToSeat(vehicle.id, 6, 'passenger', gId)
                              }
                              onUnassign={() => handleUnassignSeat(vehicle.id, 6)}
                              onClick={() => openSeatModal(vehicle.id, 6, 'passenger')}
                            />
                          </div>
                        )}

                        {/* PICTORIAL BOOT / LUGGAGE STORAGE ZONE */}
                        <div className="w-full bg-stone-200/90 border-2 border-dashed border-stone-400 rounded-2xl p-2.5 mt-1 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-stone-800">
                            <Luggage className="w-4 h-4 text-amber-700" />
                            <div>
                              <div className="font-bold text-[11px]">Rear Luggage Boot</div>
                              <div className="text-[9px] text-stone-600">
                                Space for {vehicle.luggageCapacityBags || 4} large check-in bags
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(vehicle.luggageCapacityBags || 4, 8) }).map(
                              (_, i) => (
                                <span key={i} className="text-xs" title="Luggage bag slot">
                                  🧳
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-10 text-center space-y-3">
                <Car className="w-10 h-10 text-theme-text-muted mx-auto" />
                <h3 className="font-serif font-bold text-base text-theme-text-main">
                  No Vehicles in Fleet
                </h3>
                <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
                  Add transport shuttles (Innova, Ertiga, Suburban) to allocate guests to seats.
                </p>
                <button
                  onClick={openAddVehicle}
                  className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow hover:bg-theme-primary-hover"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Vehicle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ARRIVAL SCHEDULE & TRAVEL TRACKER */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-background/70 text-[11px] font-bold text-theme-text-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Direction & Mode</th>
                    <th className="py-3 px-4">Guest Party</th>
                    <th className="py-3 px-4">Origin & Destination Hub</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Flight / Train / PNR</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border text-xs">
                  {travelItems?.map((item) => {
                    const party = parties?.find((p) => p.id === item.partyId);

                    return (
                      <tr key={item.id} className="hover:bg-theme-background/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                item.direction === 'arrival'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.mode === 'flight' && <Plane className="w-4 h-4" />}
                              {item.mode === 'train' && <Train className="w-4 h-4" />}
                              {item.mode === 'personal_car' && <Car className="w-4 h-4" />}
                            </div>
                            <div>
                              <span className="font-bold capitalize block text-theme-text-main">
                                {item.direction}
                              </span>
                              <span className="text-[10px] text-theme-text-muted capitalize">
                                {item.mode.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-theme-text-main">
                            {party?.partyName || 'Family Party'}
                          </div>
                          <div className="text-[11px] text-theme-text-muted">
                            {party?.primaryContactName}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-theme-text-main">
                            <span>{item.originCity || 'Origin'}</span>
                            <span className="text-theme-text-muted">&rarr;</span>
                            <span>{item.destinationHub || wedding.venue}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-theme-text-main">
                            <Clock className="w-3.5 h-3.5 text-theme-secondary flex-shrink-0" />
                            <span>{item.dateTime.replace('T', ' ')}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono text-theme-text-main font-semibold">
                            {item.carrierNumber || '-'}
                          </div>
                          {item.pnr && (
                            <div className="text-[10px] text-theme-text-muted font-mono">
                              PNR: {item.pnr}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteTravel(item.id)}
                            className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {(!travelItems || travelItems.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-theme-text-muted">
                        <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No travel arrival records logged.</p>
                        <p className="text-xs">
                          Click Add Arrival Log to schedule flight & train pick-ups.
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

      {/* Add / Edit Vehicle Modal with Country Presets */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle to Fleet'}
              </h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4 overflow-y-auto">
              {/* Country Presets Selector */}
              <div className="space-y-1.5 bg-theme-background/70 p-3 rounded-2xl border border-theme-border/60">
                <label className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Choose Popular Vehicle Preset (Grouped by Country)</span>
                </label>
                <select
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    if (!selectedVal) return;
                    for (const group of COUNTRY_VEHICLE_PRESETS) {
                      const found = group.vehicles.find((v) => v.name === selectedVal);
                      if (found) {
                        handleApplyVehiclePreset(found);
                        break;
                      }
                    }
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-card text-theme-text-main text-xs font-semibold cursor-pointer"
                >
                  <option value="" disabled>
                    -- Select Country Model Preset --
                  </option>
                  {COUNTRY_VEHICLE_PRESETS.map((group) => (
                    <optgroup key={group.country} label={`${group.flag} ${group.country}`}>
                      {group.vehicles.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.driveSide})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Vehicle Name / Label *</label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="e.g. Innova Crysta Shuttle 1"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Seating Category</label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value="sedan_5">Sedan (5 Seater: 1 Driver + 4 Pass)</option>
                    <option value="suv_7">SUV (7 Seater: 1 Driver + 6 Pass)</option>
                    <option value="van_14">Van / Traveller (14 Seater)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Drive Side Steering</label>
                  <select
                    value={driveSide}
                    onChange={(e) => setDriveSide(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm font-semibold"
                  >
                    <option value="RHD">Right-Hand Drive (RHD - India, UK, Aus)</option>
                    <option value="LHD">Left-Hand Drive (LHD - USA, Canada)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">License Plate Number</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="e.g. RJ 27 TA 1102"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Luggage Boot Capacity (Bags)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={luggageCapacityBags}
                    onChange={(e) => setLuggageCapacityBags(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Mukesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Driver Phone</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Assignment Modal (Click-to-Assign) */}
      {isSeatAssignModalOpen && targetSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-theme-text-main">
                {targetSeat.role === 'driver'
                  ? 'Assign Driver'
                  : targetSeat.role === 'co_driver'
                  ? 'Assign Co-Driver Seat'
                  : `Assign Passenger (Seat ${targetSeat.seatIndex + 1})`}
              </h3>
              <button
                onClick={() => setIsSeatAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalSeat} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Select Guest</label>
                <select
                  value={selectedGuestForSeat}
                  onChange={(e) => setSelectedGuestForSeat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs cursor-pointer"
                >
                  <option value="">-- Unassigned (Empty Seat) --</option>
                  {guests?.map((g) => {
                    const party = parties?.find((p) => p.id === g.partyId);
                    return (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.ageCategory}) - {party?.partyName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-2 border-t border-theme-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    await handleUnassignSeat(targetSeat.vehicleId, targetSeat.seatIndex);
                    setIsSeatAssignModalOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Clear Seat
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSeatAssignModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-theme-border text-xs font-semibold text-theme-text-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                  >
                    Save Seat
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Travel Arrival Modal */}
      {isTravelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Log Travel Arrival
              </h3>
              <button
                onClick={() => setIsTravelModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTravel} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Guest Party *</label>
                <select
                  value={travelPartyId}
                  onChange={(e) => setTravelPartyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                >
                  {parties?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partyName} ({p.primaryContactName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Mode</label>
                  <select
                    value={travelMode}
                    onChange={(e) => setTravelMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="personal_car">Personal Car</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Flight / Train No.</label>
                  <input
                    type="text"
                    value={carrierNumber}
                    onChange={(e) => setCarrierNumber(e.target.value)}
                    placeholder="e.g. 6E 2341"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Origin City</label>
                  <input
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Destination Hub</label>
                  <input
                    type="text"
                    value={destinationHub}
                    onChange={(e) => setDestinationHub(e.target.value)}
                    placeholder={`e.g. ${wedding.city} Airport`}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Arrival Date & Time</label>
                <input
                  type="datetime-local"
                  value={travelDateTime}
                  onChange={(e) => setTravelDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTravelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  Save Arrival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Seat Drop Zone Component (Interactive Droppable & Clickable)
const SeatDropZone: React.FC<{
  role: 'driver' | 'co_driver' | 'passenger';
  seatIndex: number;
  guest: Guest | null | undefined;
  onAssignGuest: (guestId: string) => void;
  onUnassign: () => void;
  onClick: () => void;
}> = ({ role, seatIndex, guest, onAssignGuest, onUnassign, onClick }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const guestId = e.dataTransfer.getData('text/plain');
        if (guestId) {
          onAssignGuest(guestId);
        }
      }}
      onClick={onClick}
      className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between min-h-[64px] ${
        isDragOver
          ? 'border-theme-primary bg-theme-primary-light/40 scale-105 shadow-md'
          : guest
          ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-950 shadow-2xs'
          : 'border-dashed border-stone-300 bg-white/70 hover:border-theme-primary/60 text-stone-600'
      }`}
    >
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold uppercase tracking-wider text-theme-text-muted flex items-center gap-1">
          {role === 'driver' && '🚗 Driver'}
          {role === 'co_driver' && '🧭 Co-Driver'}
          {role === 'passenger' && `Seat ${seatIndex + 1}`}
        </span>

        {guest && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnassign();
            }}
            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-white/80 transition-colors"
            title="Clear seat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mt-1">
        {guest ? (
          <div className="font-bold text-xs truncate text-theme-text-main flex items-center gap-1">
            <span>
              {guest.ageCategory === 'elder'
                ? '👴'
                : guest.ageCategory === 'child'
                ? '🧒'
                : guest.ageCategory === 'infant'
                ? '👶'
                : '👤'}
            </span>
            <span className="truncate">{guest.name}</span>
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 italic">Drop guest here</div>
        )}
      </div>
    </div>
  );
};
