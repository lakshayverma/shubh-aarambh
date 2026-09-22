import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, Hotel, Room, RoomAllocation, GuestParty, Guest } from '../../db/schema';
import { TagBadge } from '../tags/TagBadge';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Users,
  Check,
  Gift,
  Link,
  Calendar,
  Clock,
  Printer,
  X,
  Sparkles,
  BedDouble,
  FileSpreadsheet,
} from 'lucide-react';

interface AccommodationsManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const AccommodationsManager: React.FC<AccommodationsManagerProps> = ({
  wedding,
  onOpenTagManager,
}) => {
  const hotels = useLiveQuery(
    () => db.hotels.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const rooms = useLiveQuery(
    () => db.rooms.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const allocations = useLiveQuery(
    () => db.roomAllocations.where('weddingId').equals(wedding.id).toArray(),
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
  const allTags = useLiveQuery(() => db.tags.toArray());

  // Modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeRoomForAssign, setActiveRoomForAssign] = useState<Room | null>(null);

  // Room Form State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomHotelId, setRoomHotelId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Deluxe Room');
  const [capacityAdults, setCapacityAdults] = useState<number>(2);
  const [capacityChildren, setCapacityChildren] = useState<number>(1);
  const [floorWing, setFloorWing] = useState('');
  const [isInterconnecting, setIsInterconnecting] = useState(false);

  // Hotel Form State
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Assign Form State
  const [assignPartyId, setAssignPartyId] = useState<string>('');
  const [assignCheckIn, setAssignCheckIn] = useState(wedding.startDate);
  const [assignCheckOut, setAssignCheckOut] = useState(wedding.endDate);
  const [welcomeHamper, setWelcomeHamper] = useState(true);
  const [specialRequests, setSpecialRequests] = useState('');

  // Default hotel creation if none
  const activeHotel = hotels && hotels.length > 0 ? hotels[0] : null;

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomHotelId(activeHotel?.id || '');
    setRoomNumber('');
    setRoomType('Deluxe Heritage Room');
    setCapacityAdults(2);
    setCapacityChildren(1);
    setFloorWing('Ground Floor');
    setIsInterconnecting(false);
    setIsRoomModalOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomHotelId(room.hotelId);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setCapacityAdults(room.capacityAdults);
    setCapacityChildren(room.capacityChildren);
    setFloorWing(room.floorWing || '');
    setIsInterconnecting(room.isInterconnecting || false);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    let targetHotelId = roomHotelId;
    if (!targetHotelId) {
      if (hotels && hotels.length > 0) {
        targetHotelId = hotels[0].id;
      } else {
        targetHotelId = `htl-${wedding.id}-1`;
        await db.hotels.put({
          id: targetHotelId,
          weddingId: wedding.id,
          name: wedding.venue || 'Primary Hotel',
          address: wedding.city,
        });
      }
    }

    if (editingRoom) {
      await db.rooms.update(editingRoom.id, {
        hotelId: targetHotelId,
        roomNumber: roomNumber.trim(),
        roomType: roomType.trim(),
        capacityAdults: Number(capacityAdults),
        capacityChildren: Number(capacityChildren),
        floorWing: floorWing.trim() || undefined,
        isInterconnecting,
      });
    } else {
      const newRoom: Room = {
        id: `rm-${wedding.id}-${Date.now()}`,
        weddingId: wedding.id,
        hotelId: targetHotelId,
        roomNumber: roomNumber.trim(),
        roomType: roomType.trim(),
        capacityAdults: Number(capacityAdults),
        capacityChildren: Number(capacityChildren),
        floorWing: floorWing.trim() || undefined,
        isInterconnecting,
        tagIds: [],
      };
      await db.rooms.put(newRoom);
    }

    setIsRoomModalOpen(false);
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Delete this room and remove any guest assignments?')) {
      await db.transaction('rw', [db.rooms, db.roomAllocations], async () => {
        await db.rooms.delete(id);
        await db.roomAllocations.where('roomId').equals(id).delete();
      });
    }
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName.trim()) return;

    const newHotel: Hotel = {
      id: `htl-${wedding.id}-${Date.now()}`,
      weddingId: wedding.id,
      name: hotelName.trim(),
      address: hotelAddress.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    };

    await db.hotels.put(newHotel);
    setIsHotelModalOpen(false);
    setHotelName('');
    setHotelAddress('');
    setContactPerson('');
    setContactPhone('');
  };

  const openAssignModal = (room: Room) => {
    setActiveRoomForAssign(room);
    const existing = allocations?.find((a) => a.roomId === room.id);
    if (existing) {
      setAssignPartyId(existing.partyId || '');
      setAssignCheckIn(existing.checkInDate);
      setAssignCheckOut(existing.checkOutDate);
      setWelcomeHamper(existing.welcomeHamperDelivered);
      setSpecialRequests(existing.specialRequests || '');
    } else {
      setAssignPartyId(parties?.[0]?.id || '');
      setAssignCheckIn(wedding.startDate);
      setAssignCheckOut(wedding.endDate);
      setWelcomeHamper(true);
      setSpecialRequests('');
    }
    setIsAssignModalOpen(true);
  };

  const handleSaveAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomForAssign || !assignPartyId) return;

    const partyGuests = guests?.filter((g) => g.partyId === assignPartyId) || [];
    const guestIds = partyGuests.map((g) => g.id);

    const allocationRecord: RoomAllocation = {
      id: `alloc-${activeRoomForAssign.id}`,
      weddingId: wedding.id,
      roomId: activeRoomForAssign.id,
      partyId: assignPartyId,
      guestIds,
      checkInDate: assignCheckIn,
      checkOutDate: assignCheckOut,
      welcomeHamperDelivered: welcomeHamper,
      specialRequests: specialRequests.trim() || undefined,
    };

    await db.roomAllocations.put(allocationRecord);
    setIsAssignModalOpen(false);
  };

  const handleDeallocate = async (roomId: string) => {
    await db.roomAllocations.where('roomId').equals(roomId).delete();
  };

  const toggleHamper = async (allocation: RoomAllocation) => {
    await db.roomAllocations.update(allocation.id, {
      welcomeHamperDelivered: !allocation.welcomeHamperDelivered,
    });
  };

  // Printable Front Desk Rooming List
  const handlePrintRoomingList = () => {
    if (!rooms || rooms.length === 0) return;

    let printContent = `
      <html>
        <head>
          <title>Rooming List - ${wedding.title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { font-size: 12px; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>${wedding.title} — Hospitality & Front Desk Rooming List</h1>
          <p>Venue: ${wedding.venue}, ${wedding.city} | Dates: ${wedding.startDate} to ${wedding.endDate}</p>
          <table>
            <thead>
              <tr>
                <th>Room #</th>
                <th>Room Type</th>
                <th>Floor / Wing</th>
                <th>Assigned Party / Guests</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Hamper</th>
                <th>Special Notes</th>
              </tr>
            </thead>
            <tbody>
    `;

    for (const r of rooms) {
      const alloc = allocations?.find((a) => a.roomId === r.id);
      const party = parties?.find((p) => p.id === alloc?.partyId);
      const partyGuests = guests?.filter((g) => alloc?.guestIds?.includes(g.id)) || [];
      const guestsStr = partyGuests.length > 0 ? partyGuests.map((g) => g.name).join(', ') : party?.partyName || 'Vacant';

      printContent += `
        <tr>
          <td><strong>${r.roomNumber}</strong></td>
          <td>${r.roomType}</td>
          <td>${r.floorWing || '-'}</td>
          <td>${party ? `<strong>${party.partyName}</strong> (${guestsStr})` : '<em>Vacant</em>'}</td>
          <td>${alloc?.checkInDate || '-'}</td>
          <td>${alloc?.checkOutDate || '-'}</td>
          <td>${alloc ? (alloc.welcomeHamperDelivered ? 'Delivered' : 'Pending') : '-'}</td>
          <td>${alloc?.specialRequests || '-'}</td>
        </tr>
      `;
    }

    printContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Metrics
  const totalRooms = rooms?.length || 0;
  const occupiedRooms = allocations?.length || 0;
  const vacantRooms = totalRooms - occupiedRooms;
  const hampersDelivered = allocations?.filter((a) => a.welcomeHamperDelivered).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Metrics */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                Accommodations & Room Grid
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 4: Hotel room blocks, rooming assignments, welcome hamper tracking, and front desk sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintRoomingList}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Print Rooming List</span>
            </button>

            <button
              onClick={() => setIsHotelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-theme-primary" />
              <span>Add Hotel / Resort</span>
            </button>

            <button
              onClick={openAddRoom}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Room</span>
            </button>
          </div>
        </div>

        {/* Analytics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-theme-border/60 pt-4">
          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-theme-text-muted">Total Room Inventory</div>
            <div className="text-xl font-serif font-bold text-theme-primary mt-0.5">{totalRooms} Rooms</div>
            <div className="text-[10px] text-theme-text-muted">{hotels?.length || 1} Hotel Property</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Allocated Rooms</div>
            <div className="text-xl font-serif font-bold text-emerald-700 mt-0.5">{occupiedRooms}</div>
            <div className="text-[10px] text-theme-text-muted">Parties checked in</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-amber-700">Vacant Rooms</div>
            <div className="text-xl font-serif font-bold text-amber-700 mt-0.5">{vacantRooms}</div>
            <div className="text-[10px] text-theme-text-muted">Available for allocation</div>
          </div>

          <div className="bg-theme-background p-3 rounded-2xl border border-theme-border/70">
            <div className="text-[10px] uppercase font-bold text-theme-secondary flex items-center gap-1">
              <Gift className="w-3 h-3" />
              <span>Welcome Hampers</span>
            </div>
            <div className="text-xl font-serif font-bold text-theme-secondary mt-0.5">
              {hampersDelivered} / {occupiedRooms}
            </div>
            <div className="text-[10px] text-theme-text-muted">Delivered to rooms</div>
          </div>
        </div>
      </div>

      {/* Room Grid Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-theme-secondary" />
            <h3 className="font-serif font-bold text-lg text-theme-text-main">Hotel Room Blocks</h3>
          </div>
          <span className="text-xs text-theme-text-muted">{totalRooms} total rooms configured</span>
        </div>

        {rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => {
              const allocation = allocations?.find((a) => a.roomId === room.id);
              const party = parties?.find((p) => p.id === allocation?.partyId);
              const isOccupied = Boolean(allocation && party);

              return (
                <div
                  key={room.id}
                  className={`bg-theme-card border-2 rounded-3xl p-5 shadow-2xs transition-all space-y-3 relative overflow-hidden ${
                    isOccupied ? 'border-theme-border' : 'border-dashed border-theme-primary/40'
                  }`}
                >
                  {/* Top status header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-2xl text-theme-primary">
                        #{room.roomNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isOccupied
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {room.isInterconnecting && (
                        <span
                          className="p-1 text-theme-secondary hover:text-theme-primary rounded-lg"
                          title="Interconnecting Room"
                        >
                          <Link className="w-4 h-4" />
                        </span>
                      )}
                      <button
                        onClick={() => openEditRoom(room)}
                        className="p-1 text-theme-text-muted hover:text-theme-primary rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="text-xs text-theme-text-muted space-y-1">
                    <div className="font-semibold text-theme-text-main">{room.roomType}</div>
                    <div className="flex items-center gap-3">
                      <span>{room.floorWing || 'Standard Wing'}</span>
                      <span>&bull;</span>
                      <span>Cap: {room.capacityAdults} Adults {room.capacityChildren > 0 && `+ ${room.capacityChildren} Kids`}</span>
                    </div>
                  </div>

                  {/* Guest Assignment Card */}
                  <div className="border-t border-theme-border/60 pt-3">
                    {isOccupied && allocation && party ? (
                      <div className="bg-theme-background p-3 rounded-2xl border border-theme-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-theme-text-main truncate">
                            {party.partyName}
                          </span>
                          <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-theme-card border border-theme-border font-semibold text-theme-primary">
                            {party.side}
                          </span>
                        </div>

                        <div className="text-[11px] text-theme-text-muted flex items-center justify-between">
                          <span>{allocation.checkInDate} &rarr; {allocation.checkOutDate}</span>
                        </div>

                        {allocation.specialRequests && (
                          <div className="text-[10px] text-theme-text-muted italic pt-0.5">
                            "{allocation.specialRequests}"
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-theme-border/40">
                          {/* Welcome hamper toggle */}
                          <button
                            onClick={() => toggleHamper(allocation)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                              allocation.welcomeHamperDelivered
                                ? 'bg-theme-secondary-light text-theme-accent border border-theme-secondary/40'
                                : 'bg-theme-border/40 text-theme-text-muted hover:bg-theme-border'
                            }`}
                          >
                            <Gift className="w-3 h-3" />
                            <span>{allocation.welcomeHamperDelivered ? 'Hamper Delivered' : 'Hamper Pending'}</span>
                          </button>

                          <button
                            onClick={() => handleDeallocate(room.id)}
                            className="text-[11px] text-rose-600 hover:underline font-semibold"
                          >
                            Unassign
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openAssignModal(room)}
                        className="w-full py-2.5 rounded-2xl border border-dashed border-theme-border hover:border-theme-primary bg-theme-background hover:bg-theme-primary-light/30 text-xs font-semibold text-theme-text-muted hover:text-theme-primary transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Guests to Room</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-12 text-center space-y-3">
            <Building className="w-10 h-10 text-theme-text-muted mx-auto" />
            <h3 className="font-serif font-bold text-base text-theme-text-main">No Rooms Added Yet</h3>
            <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
              Add rooms for your venue or destination hotel block to begin assigning guest families and tracking welcome hampers.
            </p>
            <button
              onClick={openAddRoom}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow hover:bg-theme-primary-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Room</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingRoom ? 'Edit Room' : 'Add Hotel Room'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Room Number *</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101, Villa 4, Suite 202"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Room Category / Type</label>
                <input
                  type="text"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  placeholder="e.g. Grand Heritage Lake View, Pool Villa"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Adults Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={capacityAdults}
                    onChange={(e) => setCapacityAdults(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Children Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={capacityChildren}
                    onChange={(e) => setCapacityChildren(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Floor / Wing</label>
                <input
                  type="text"
                  value={floorWing}
                  onChange={(e) => setFloorWing(e.target.value)}
                  placeholder="e.g. Ground Floor, East Wing"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-theme-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInterconnecting}
                    onChange={(e) => setIsInterconnecting(e.target.checked)}
                    className="rounded-sm border-theme-border text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Interconnecting Room</span>
                </label>
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  {editingRoom ? 'Save Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Guest Modal */}
      {isAssignModalOpen && activeRoomForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Assign to Room #{activeRoomForAssign.roomNumber}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocation} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Select Guest Family / Party *</label>
                <select
                  value={assignPartyId}
                  onChange={(e) => setAssignPartyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                >
                  <option value="">-- Choose Party --</option>
                  {parties?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partyName} ({p.adultsCount}A + {p.childrenCount}C, {p.side})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Check-In Date</label>
                  <input
                    type="date"
                    value={assignCheckIn}
                    onChange={(e) => setAssignCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Check-Out Date</label>
                  <input
                    type="date"
                    value={assignCheckOut}
                    onChange={(e) => setAssignCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Special Instructions</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Rollaway extra bed, low floor for elder"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-theme-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={welcomeHamper}
                    onChange={(e) => setWelcomeHamper(e.target.checked)}
                    className="rounded-sm border-theme-border text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Welcome Hamper Delivered</span>
                </label>
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hotel Property Modal */}
      {isHotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                Add Hotel / Property
              </h3>
              <button
                onClick={() => setIsHotelModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Hotel / Resort Name *</label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="e.g. The Leela Palace Udaipur"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Address / Location</label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  placeholder="e.g. Lake Pichola, Udaipur"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Front Desk POC</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Duty Manager name"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 294 000000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  Add Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
