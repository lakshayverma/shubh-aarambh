import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, TravelItem, Vehicle, VehicleSeat, GuestParty, Guest } from '../../db/schema';
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
  ChevronRight,
  MapPin,
  Key,
  UserCheck,
} from 'lucide-react';

interface TravelManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const TravelManager: React.FC<TravelManagerProps> = ({
  wedding,
  onOpenTagManager,
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

  const [activeTab, setActiveTab] = useState<'schedule' | 'fleet'>('fleet');

  // Modals
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isSeatAssignModalOpen, setIsSeatAssignModalOpen] = useState(false);

  // Active seat assignment target
  const [targetSeat, setTargetSeat] = useState<{ vehicleId: string; seatIndex: number; role: 'driver' | 'co_driver' | 'passenger' } | null>(null);
  const [selectedGuestForSeat, setSelectedGuestForSeat] = useState<string>('');

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
    if (confirm('Delete this travel schedule entry?')) {
      await db.travelItems.delete(id);
    }
  };

  // Open Add Vehicle
  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleName('Innova Crysta Shuttle');
    setVehicleCategory('suv_7');
    setPlateNumber('');
    setIsPersonal(false);
    setOwnerGuestId('');
    setDriverName('Commercial Chauffeur');
    setDriverPhone('');
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim()) return;

    const vehicleId = editingVehicle ? editingVehicle.id : `veh-${Date.now()}`;

    const vehicleRecord: Vehicle = {
      id: vehicleId,
      weddingId: wedding.id,
      name: vehicleName.trim(),
      category: vehicleCategory,
      plateNumber: plateNumber.trim() || undefined,
      isPersonalVehicle: isPersonal,
      ownerGuestId: isPersonal ? ownerGuestId : undefined,
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      status: 'scheduled',
    };

    await db.vehicles.put(vehicleRecord);
    setIsVehicleModalOpen(false);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Delete this vehicle and clear all seat allocations?')) {
      await db.transaction('rw', [db.vehicles, db.vehicleSeats], async () => {
        await db.vehicles.delete(id);
        await db.vehicleSeats.where('vehicleId').equals(id).delete();
      });
    }
  };

  // Seat Click Handler
  const handleSeatClick = (vehicleId: string, seatIndex: number, defaultRole: 'driver' | 'co_driver' | 'passenger') => {
    const existing = vehicleSeats?.find((s) => s.vehicleId === vehicleId && s.seatIndex === seatIndex);
    setTargetSeat({ vehicleId, seatIndex, role: existing?.seatRole || defaultRole });
    setSelectedGuestForSeat(existing?.guestId || '');
    setIsSeatAssignModalOpen(true);
  };

  const handleSaveSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSeat) return;

    const seatRecordId = `seat-${targetSeat.vehicleId}-${targetSeat.seatIndex}`;

    if (selectedGuestForSeat) {
      const seatRecord: VehicleSeat = {
        id: seatRecordId,
        weddingId: wedding.id,
        vehicleId: targetSeat.vehicleId,
        seatIndex: targetSeat.seatIndex,
        seatRole: targetSeat.role,
        guestId: selectedGuestForSeat,
      };
      await db.vehicleSeats.put(seatRecord);
    } else {
      await db.vehicleSeats.delete(seatRecordId);
    }

    setIsSeatAssignModalOpen(false);
  };

  const handleUnassignSeat = async (vehicleId: string, seatIndex: number) => {
    const seatRecordId = `seat-${vehicleId}-${seatIndex}`;
    await db.vehicleSeats.delete(seatRecordId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Mode Switcher */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                Travel & Vehicle Seating Charts
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 5: Flight/train arrivals tracker, personal vehicles with driver mapping, and pictorial vehicle seating.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switcher */}
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
                <span>Vehicles & Seating</span>
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
                <span>Arrivals & Drops</span>
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
                <span>Add Travel Entry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: Pictorial Vehicle Fleet Seating */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-theme-text-main flex items-center gap-2">
              <span>Vehicle Fleet & Pictorial Seating Charts</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-theme-secondary-light text-theme-accent font-bold">
                {vehicles?.length || 0} Vehicles
              </span>
            </h3>
            <span className="text-xs text-theme-text-muted">Click any seat to allocate driver or passenger</span>
          </div>

          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => {
                const isPersonal = vehicle.isPersonalVehicle;
                const vSeats = vehicleSeats?.filter((s) => s.vehicleId === vehicle.id) || [];

                return (
                  <div
                    key={vehicle.id}
                    className="bg-theme-card border-2 border-theme-border hover:border-theme-primary/60 rounded-3xl p-6 shadow-2xs space-y-4 relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-theme-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-theme-text-main">
                            {vehicle.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isPersonal
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPersonal ? 'Personal Car' : 'Taxi / Shuttle'}
                          </span>
                        </div>
                        <div className="text-xs text-theme-text-muted mt-0.5 flex items-center gap-2">
                          {vehicle.plateNumber && <span className="font-mono font-bold">{vehicle.plateNumber}</span>}
                          {vehicle.driverName && <span>&bull; Driver: {vehicle.driverName}</span>}
                          {vehicle.driverPhone && <span>({vehicle.driverPhone})</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* PICTORIAL AUTOMOTIVE SEAT LAYOUT */}
                    <div className="bg-theme-background border border-theme-border rounded-3xl p-5 shadow-inner">
                      <div className="max-w-[260px] mx-auto bg-theme-card border-4 border-theme-border rounded-3xl p-4 shadow-md space-y-4 relative">
                        {/* Windshield Indicator */}
                        <div className="w-full h-3 rounded-t-xl bg-sky-100 border border-sky-300 text-[8px] font-bold uppercase text-sky-700 flex items-center justify-center tracking-widest">
                          Windshield (Front)
                        </div>

                        {/* ROW 1: Driver & Co-Driver */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Driver Seat */}
                          <PictorialSeat
                            role="driver"
                            seatIndex={0}
                            vehicleId={vehicle.id}
                            allocatedSeat={vSeats.find((s) => s.seatIndex === 0)}
                            guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 0)?.guestId)}
                            onClick={() => handleSeatClick(vehicle.id, 0, 'driver')}
                            onUnassign={() => handleUnassignSeat(vehicle.id, 0)}
                          />

                          {/* Co-Driver Seat */}
                          <PictorialSeat
                            role="co_driver"
                            seatIndex={1}
                            vehicleId={vehicle.id}
                            allocatedSeat={vSeats.find((s) => s.seatIndex === 1)}
                            guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 1)?.guestId)}
                            onClick={() => handleSeatClick(vehicle.id, 1, 'co_driver')}
                            onUnassign={() => handleUnassignSeat(vehicle.id, 1)}
                          />
                        </div>

                        {/* ROW 2: Passenger Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <PictorialSeat
                            role="passenger"
                            seatIndex={2}
                            vehicleId={vehicle.id}
                            allocatedSeat={vSeats.find((s) => s.seatIndex === 2)}
                            guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 2)?.guestId)}
                            onClick={() => handleSeatClick(vehicle.id, 2, 'passenger')}
                            onUnassign={() => handleUnassignSeat(vehicle.id, 2)}
                          />
                          <PictorialSeat
                            role="passenger"
                            seatIndex={3}
                            vehicleId={vehicle.id}
                            allocatedSeat={vSeats.find((s) => s.seatIndex === 3)}
                            guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 3)?.guestId)}
                            onClick={() => handleSeatClick(vehicle.id, 3, 'passenger')}
                            onUnassign={() => handleUnassignSeat(vehicle.id, 3)}
                          />
                          {vehicle.category === 'suv_7' && (
                            <PictorialSeat
                              role="passenger"
                              seatIndex={4}
                              vehicleId={vehicle.id}
                              allocatedSeat={vSeats.find((s) => s.seatIndex === 4)}
                              guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 4)?.guestId)}
                              onClick={() => handleSeatClick(vehicle.id, 4, 'passenger')}
                              onUnassign={() => handleUnassignSeat(vehicle.id, 4)}
                            />
                          )}
                        </div>

                        {/* ROW 3: Rear Row (if SUV/Innova) */}
                        {vehicle.category === 'suv_7' && (
                          <div className="grid grid-cols-2 gap-4 border-t border-theme-border/60 pt-2">
                            <PictorialSeat
                              role="passenger"
                              seatIndex={5}
                              vehicleId={vehicle.id}
                              allocatedSeat={vSeats.find((s) => s.seatIndex === 5)}
                              guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 5)?.guestId)}
                              onClick={() => handleSeatClick(vehicle.id, 5, 'passenger')}
                              onUnassign={() => handleUnassignSeat(vehicle.id, 5)}
                            />
                            <PictorialSeat
                              role="passenger"
                              seatIndex={6}
                              vehicleId={vehicle.id}
                              allocatedSeat={vSeats.find((s) => s.seatIndex === 6)}
                              guest={guests?.find((g) => g.id === vSeats.find((s) => s.seatIndex === 6)?.guestId)}
                              onClick={() => handleSeatClick(vehicle.id, 6, 'passenger')}
                              onUnassign={() => handleUnassignSeat(vehicle.id, 6)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-10 text-center space-y-3">
              <Car className="w-10 h-10 text-theme-text-muted mx-auto" />
              <h4 className="font-serif font-bold text-base text-theme-text-main">No Vehicles Configured</h4>
              <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
                Add Innova shuttles, private cars, or airport cabs to assign seating charts.
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
      )}

      {/* VIEW 2: Arrivals & Departures Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-theme-border flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-theme-text-main">
              Arrivals & Departures Tracker
            </h3>
            <span className="text-xs text-theme-text-muted">{travelItems?.length || 0} scheduled arrivals</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-background border-b border-theme-border text-theme-text-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Direction & Mode</th>
                  <th className="py-3 px-4">Flight / Train #</th>
                  <th className="py-3 px-4">Guest Party</th>
                  <th className="py-3 px-4">Route & Terminal</th>
                  <th className="py-3 px-4">Arrival Date/Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border/60">
                {travelItems?.map((item) => {
                  const party = parties?.find((p) => p.id === item.partyId);

                  return (
                    <tr key={item.id} className="hover:bg-theme-background/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              item.direction === 'arrival'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.direction === 'arrival' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="capitalize font-bold text-theme-text-main">
                            {item.mode.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-theme-primary">
                        {item.carrierNumber || '-'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-theme-text-main">{party?.partyName || 'Guest'}</div>
                        <div className="text-[10px] text-theme-text-muted">{party?.primaryContactName}</div>
                      </td>

                      <td className="py-3 px-4 text-theme-text-muted">
                        <div>{item.originCity} &rarr; {item.destinationHub}</div>
                        {item.pnr && <div className="text-[10px] font-mono">PNR: {item.pnr}</div>}
                      </td>

                      <td className="py-3 px-4 font-semibold text-theme-text-main">
                        {item.dateTime.replace('T', ' ')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTravel(item.id)}
                          className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {(!travelItems || travelItems.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-theme-text-muted">
                      No travel schedule entries. Click Add Travel Entry to register guest flights.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seat Assignment Modal */}
      {isSeatAssignModalOpen && targetSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Allocate Seat #{targetSeat.seatIndex + 1} ({targetSeat.role.toUpperCase()})
              </h3>
              <button
                onClick={() => setIsSeatAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeat} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Seat Role</label>
                <select
                  value={targetSeat.role}
                  onChange={(e) =>
                    setTargetSeat({ ...targetSeat, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                >
                  <option value="driver">Driver (Steering Lead)</option>
                  <option value="co_driver">Co-Driver (Front Passenger)</option>
                  <option value="passenger">Passenger</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Select Guest</label>
                <select
                  value={selectedGuestForSeat}
                  onChange={(e) => setSelectedGuestForSeat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                >
                  <option value="">-- Vacant Seat --</option>
                  {guests?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({parties?.find((p) => p.id === g.partyId)?.partyName || ''})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSeatAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  Save Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Add Vehicle
              </h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Vehicle Name / Label *</label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="e.g. Innova Crysta Shuttle 1, Rohan's Fortuner"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Category</label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  >
                    <option value="suv_7">SUV (7-Seater / Innova)</option>
                    <option value="suv_6">SUV (6-Seater Captain)</option>
                    <option value="sedan_4">Sedan (4-Seater)</option>
                    <option value="tempo_12">Tempo Traveller (12-Seater)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Plate Number</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="e.g. RJ 27 TA 1102"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-theme-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPersonal}
                    onChange={(e) => setIsPersonal(e.target.checked)}
                    className="rounded-sm border-theme-border text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Personal Vehicle (Guest/Family Driving)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Chauffeur / Driver name"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Driver Phone</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 94000 00000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Travel Modal */}
      {isTravelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Add Travel Schedule
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
                <label className="text-xs font-bold text-theme-text-main">Guest Family / Party *</label>
                <select
                  value={travelPartyId}
                  onChange={(e) => setTravelPartyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  required
                >
                  <option value="">-- Choose Party --</option>
                  {parties?.map((p) => (
                    <option key={p.id} value={p.id}>{p.partyName} ({p.side})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Direction</label>
                  <select
                    value={travelDirection}
                    onChange={(e) => setTravelDirection(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  >
                    <option value="arrival">Arrival (Pickup)</option>
                    <option value="departure">Departure (Dropoff)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Mode</label>
                  <select
                    value={travelMode}
                    onChange={(e) => setTravelMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="personal_car">Personal Car</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Flight / Train #</label>
                  <input
                    type="text"
                    value={carrierNumber}
                    onChange={(e) => setCarrierNumber(e.target.value)}
                    placeholder="e.g. 6E 2341"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">PNR Number</label>
                  <input
                    type="text"
                    value={travelPnr}
                    onChange={(e) => setTravelPnr(e.target.value)}
                    placeholder="e.g. WX90PL"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
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
                    placeholder="e.g. Mumbai (BOM)"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Destination Hub</label>
                  <input
                    type="text"
                    value={destinationHub}
                    onChange={(e) => setDestinationHub(e.target.value)}
                    placeholder="e.g. Udaipur Airport"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Arrival Date & Time *</label>
                <input
                  type="datetime-local"
                  value={travelDateTime}
                  onChange={(e) => setTravelDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for Individual Pictorial Vehicle Seat
const PictorialSeat: React.FC<{
  role: 'driver' | 'co_driver' | 'passenger';
  seatIndex: number;
  vehicleId: string;
  allocatedSeat?: VehicleSeat;
  guest?: Guest;
  onClick: () => void;
  onUnassign: () => void;
}> = ({ role, seatIndex, guest, onClick, onUnassign }) => {
  const isOccupied = Boolean(guest);

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-2xl border-2 text-center cursor-pointer transition-all hover:scale-105 ${
        isOccupied
          ? role === 'driver'
            ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
            : 'border-theme-primary bg-theme-primary-light text-theme-text-main shadow-xs'
          : 'border-dashed border-theme-border bg-theme-background hover:bg-theme-border/40 text-theme-text-muted'
      }`}
      title={isOccupied ? `${guest?.name} (${role})` : `Seat #${seatIndex + 1} (${role}) - Click to allocate`}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {role === 'driver' ? (
          <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[8px] font-bold">
            D
          </span>
        ) : (
          <Users className="w-3.5 h-3.5 opacity-60" />
        )}
        <span className="text-[9px] uppercase font-bold tracking-wider">
          {role === 'driver' ? 'Driver' : role === 'co_driver' ? 'Front' : `Seat ${seatIndex + 1}`}
        </span>
      </div>

      <div className="text-[11px] font-bold truncate">
        {guest ? guest.name.split(' ')[0] : 'Vacant'}
      </div>

      {guest && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnassign();
          }}
          className="text-[9px] text-rose-600 hover:underline block mx-auto mt-0.5"
        >
          Clear
        </button>
      )}
    </div>
  );
};
