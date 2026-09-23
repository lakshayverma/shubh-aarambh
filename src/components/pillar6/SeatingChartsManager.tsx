import React, { useState, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import {
  Wedding,
  SeatingPlan,
  FloorPlanElement,
  TableSeatAssignment,
  Guest,
} from '../../db/schema';
import {
  Armchair,
  Plus,
  Trash2,
  Users,
  Sparkles,
  Search,
  HelpCircle,
  UserCheck,
  X,
  Edit2,
} from 'lucide-react';
import { NestedScreen } from '../common/NestedScreen';

interface SeatingChartsManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const SeatingChartsManager: React.FC<SeatingChartsManagerProps> = ({
  wedding,
}) => {
  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );
  const seatingPlans = useLiveQuery(
    () => db.seatingPlans.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const elements = useLiveQuery(
    () => db.floorPlanElements.toArray(),
    []
  );
  const seatAssignments = useLiveQuery(
    () => db.tableSeatAssignments.toArray(),
    []
  );
  const parties = useLiveQuery(
    () => db.guestParties.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const guests = useLiveQuery(
    () => db.guests.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const rsvps = useLiveQuery(
    () => db.eventRsvps.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  // Active Ceremony & Seating Plan
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const activeEvent = events?.find((e) => e.id === selectedEventId) || events?.[0];
  const currentEventId = activeEvent?.id || '';

  // Get active plan for current event
  const activePlan = seatingPlans?.find((p) => p.eventId === currentEventId);

  // Table Assignment Drawer (NestedScreen)
  const [activeElementForSeats, setActiveElementForSeats] = useState<FloorPlanElement | null>(null);
  const [onlyAttendingFilter, setOnlyAttendingFilter] = useState(true);

  // Table Edit Modal/Drawer
  const [isEditElementOpen, setIsEditElementOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCapacity, setEditCapacity] = useState(8);

  // Dragging state on Canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Guest Tray State (15-20% Left Column)
  const [guestSearch, setGuestSearch] = useState('');
  const [guestTrayFilter, setGuestTrayFilter] = useState<'all' | 'unassigned' | 'assigned' | 'confirmed'>('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'ladkewale' | 'ladkiwale'>('all');

  // Filter elements belonging to active plan
  const planElements = useMemo(() => {
    return elements?.filter((el) => el.seatingPlanId === activePlan?.id) || [];
  }, [elements, activePlan?.id]);

  // Map of guestId -> seat info in current plan
  const guestAssignmentMap = useMemo(() => {
    const map = new Map<string, { tableName: string; elementId: string; seatNumber: number }>();
    if (!seatAssignments || !planElements.length) return map;

    const elemMap = new Map(planElements.map((el) => [el.id, el.label]));
    for (const sa of seatAssignments) {
      if (elemMap.has(sa.elementId) && sa.guestId) {
        map.set(sa.guestId, {
          tableName: elemMap.get(sa.elementId) || 'Table',
          elementId: sa.elementId,
          seatNumber: sa.seatNumber,
        });
      }
    }
    return map;
  }, [seatAssignments, planElements]);

  // Filtered guest list for left tray
  const filteredTrayGuests = useMemo(() => {
    if (!guests) return [];
    return guests.filter((g) => {
      const party = parties?.find((p) => p.id === g.partyId);
      const matchesSearch =
        g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        (party?.partyName && party.partyName.toLowerCase().includes(guestSearch.toLowerCase()));

      const isAssigned = guestAssignmentMap.has(g.id);
      const isConfirmed = rsvps?.some(
        (r) =>
          ((r.guestId === g.id && r.eventId === currentEventId && r.status === 'confirmed') ||
            (r.partyId === g.partyId && !r.guestId && r.eventId === currentEventId && r.status === 'confirmed'))
      );

      const matchesFilter =
        guestTrayFilter === 'all'
          ? true
          : guestTrayFilter === 'assigned'
          ? isAssigned
          : guestTrayFilter === 'confirmed'
          ? isConfirmed
          : !isAssigned;

      const matchesSide =
        sideFilter === 'all' ? true : party?.side === sideFilter;

      return matchesSearch && matchesFilter && matchesSide;
    });
  }, [guests, parties, guestSearch, guestTrayFilter, sideFilter, guestAssignmentMap, rsvps, currentEventId]);

  // Add Element to 2D Floor Plan
  const handleAddElement = async (
    type: FloorPlanElement['type'],
    label: string,
    width: number,
    height: number,
    capacity: number
  ) => {
    let planId = activePlan?.id;
    if (!planId) {
      planId = `plan-${wedding.id}-${currentEventId}`;
      await db.seatingPlans.put({
        id: planId,
        weddingId: wedding.id,
        eventId: currentEventId,
        name: `${activeEvent?.name || 'Ceremony'} Floor Plan`,
        canvasWidth: 900,
        canvasHeight: 600,
      });
    }

    const newElement: FloorPlanElement = {
      id: `elem-${Date.now()}`,
      seatingPlanId: planId,
      type,
      label,
      x: 60 + Math.floor(Math.random() * 260),
      y: 60 + Math.floor(Math.random() * 200),
      rotation: 0,
      width,
      height,
      capacity,
    };

    await db.floorPlanElements.put(newElement);
  };

  // Canvas Drag Handling
  const handleMouseDown = (e: React.MouseEvent, elem: FloorPlanElement) => {
    e.stopPropagation();
    setDraggingElementId(elem.id);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      setDragOffset({
        x: e.clientX - canvasRect.left - elem.x,
        y: e.clientY - canvasRect.top - elem.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElementId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let newX = Math.round((e.clientX - canvasRect.left - dragOffset.x) / 10) * 10; // Snap to 10px grid
    let newY = Math.round((e.clientY - canvasRect.top - dragOffset.y) / 10) * 10;

    newX = Math.max(10, Math.min(newX, 950));
    newY = Math.max(10, Math.min(newY, 650));

    db.floorPlanElements.update(draggingElementId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingElementId(null);
  };

  const handleDeleteElement = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this venue element and remove its assigned seats?')) {
      await db.transaction('rw', [db.floorPlanElements, db.tableSeatAssignments], async () => {
        await db.floorPlanElements.delete(id);
        await db.tableSeatAssignments.where('elementId').equals(id).delete();
      });
      if (activeElementForSeats?.id === id) {
        setActiveElementForSeats(null);
      }
      setIsEditElementOpen(false);
    }
  };

  // Direct Table & Seat Drag-and-Drop Assignment
  const assignGuestToTableSeat = async (elementId: string, seatNumber: number, guestId: string) => {
    // 1. If guest is currently seated at another table in this seating plan, unassign them first
    const planElemIds = new Set(planElements.map((e) => e.id));
    const allAssignments = await db.tableSeatAssignments.toArray();
    const prior = allAssignments.find((s) => planElemIds.has(s.elementId) && s.guestId === guestId);
    if (prior) {
      await db.tableSeatAssignments.delete(prior.id);
    }

    // 2. Put seat assignment record
    const existingTarget = allAssignments.find(
      (s) => s.elementId === elementId && s.seatNumber === seatNumber
    );
    const seatId = existingTarget ? existingTarget.id : `ts-${elementId}-${seatNumber}`;

    await db.tableSeatAssignments.put({
      id: seatId,
      elementId,
      seatNumber,
      guestId,
    });
  };

  // Drop directly onto table (picks first vacant seat)
  const handleDropOnTable = async (element: FloorPlanElement, guestId: string) => {
    if (element.capacity <= 0) return;
    const tableSeats = seatAssignments?.filter((s) => s.elementId === element.id) || [];
    const occupiedSeats = new Set(tableSeats.map((s) => s.seatNumber));

    // Find first vacant seat index from 1 to capacity
    let vacantSeatNum = 1;
    for (let i = 1; i <= element.capacity; i++) {
      if (!occupiedSeats.has(i)) {
        vacantSeatNum = i;
        break;
      }
    }

    await assignGuestToTableSeat(element.id, vacantSeatNum, guestId);
  };

  const handleUnassignSeat = async (elementId: string, seatNumber: number) => {
    const allAssignments = await db.tableSeatAssignments.toArray();
    const target = allAssignments.find(
      (s) => s.elementId === elementId && s.seatNumber === seatNumber
    );
    if (target) {
      await db.tableSeatAssignments.delete(target.id);
    }
    await db.tableSeatAssignments.delete(`ts-${elementId}-${seatNumber}`);
  };

  const handleClearAllTableSeats = async (elementId: string) => {
    if (confirm('Clear all seated guests from this table?')) {
      const allAssignments = await db.tableSeatAssignments.where('elementId').equals(elementId).toArray();
      for (const a of allAssignments) {
        await db.tableSeatAssignments.delete(a.id);
      }
    }
  };

  // Edit element properties
  const openEditElement = (elem: FloorPlanElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingElement(elem);
    setEditLabel(elem.label);
    setEditCapacity(elem.capacity);
    setIsEditElementOpen(true);
  };

  const handleSaveElementProperties = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElement) return;
    await db.floorPlanElements.update(editingElement.id, {
      label: editLabel.trim() || editingElement.label,
      capacity: Number(editCapacity) || 0,
    });
    setIsEditElementOpen(false);
  };

  // Summary Metrics
  const totalTables = planElements.filter((e) => e.capacity > 0).length;
  const totalSeats = planElements.reduce((acc, e) => acc + e.capacity, 0);
  const totalSeatedGuests = seatAssignments?.filter((sa) =>
    planElements.some((pe) => pe.id === sa.elementId) && !!sa.guestId
  ).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200" onMouseUp={handleMouseUp}>
      {/* Header & Ceremony Selector */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Armchair className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                2D Floor Plan & Interactive Seating Charts
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 6: 15-85 drag-and-drop seating workspace with Left Guest Tray, interactive 2D canvas, droppable table seats, and Ladkewale/Ladkiwale color tags.
            </p>
          </div>

          {/* Ceremony Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-theme-text-muted">Function:</span>
            <select
              value={currentEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm font-semibold text-theme-text-main cursor-pointer"
            >
              {events?.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar: Add Elements to Floor Plan */}
        <div className="border-t border-theme-border/60 pt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase text-theme-text-muted mr-1">Add Element:</span>

            <button
              onClick={() => handleAddElement('round_table', 'Round Table (8)', 120, 120, 8)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-theme-primary" />
              <span>Round Table (8)</span>
            </button>

            <button
              onClick={() => handleAddElement('round_table', 'Round Table (10)', 135, 135, 10)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-theme-primary" />
              <span>Round Table (10)</span>
            </button>

            <button
              onClick={() => handleAddElement('rect_table', 'Banquet Table (8)', 160, 85, 8)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Rect Table (8)</span>
            </button>

            <button
              onClick={() => handleAddElement('rect_table', 'Banquet Table (12)', 200, 90, 12)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Rect Table (12)</span>
            </button>

            <button
              onClick={() => handleAddElement('lounge_sofa', 'Royal Diwan / Sofa', 140, 65, 4)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Couple Diwan (4)</span>
            </button>

            <button
              onClick={() => handleAddElement('stage', 'Main Stage', 320, 85, 0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <span>Stage</span>
            </button>

            <button
              onClick={() => handleAddElement('mandap', 'Sacred Mandap', 180, 130, 0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <span>Mandap</span>
            </button>

            <button
              onClick={() => handleAddElement('dance_floor', 'Dance Floor', 220, 110, 0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors shadow-2xs"
            >
              <span>Dance Floor</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-theme-background border border-theme-border font-bold text-theme-text-main">
              {totalTables} Tables ({totalSeats} Seats)
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              {totalSeatedGuests} / {totalSeats} Seated
            </span>
          </div>
        </div>
      </div>

      {/* 15-85 RATIO SPLIT: Left Guest Tray (15-20%) and Right Floor Plan Canvas (80-85%) */}
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

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-text-muted" />
            <input
              type="text"
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              placeholder="Search guests or party..."
              className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-theme-border bg-theme-background text-[11px] focus:outline-hidden focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          {/* Filter Status Buttons */}
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
              onClick={() => setGuestTrayFilter('confirmed')}
              className={`flex-1 py-1 rounded transition-colors ${
                guestTrayFilter === 'confirmed'
                  ? 'bg-theme-card text-emerald-700 shadow-2xs font-bold'
                  : 'text-theme-text-muted'
              }`}
              title="Filter confirmed RSVP guests"
            >
              Attending
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

          {/* Side Filter (Ladkewale / Ladkiwale) */}
          <div className="flex items-center gap-1 bg-theme-background/70 p-0.5 rounded-lg text-[10px] font-medium border border-theme-border/50">
            <button
              onClick={() => setSideFilter('all')}
              className={`flex-1 py-0.5 rounded ${
                sideFilter === 'all' ? 'bg-theme-card font-bold text-theme-text-main shadow-2xs' : 'text-theme-text-muted'
              }`}
            >
              All Sides
            </button>
            <button
              onClick={() => setSideFilter('ladkewale')}
              className={`flex-1 py-0.5 rounded ${
                sideFilter === 'ladkewale' ? 'bg-amber-100 text-amber-900 font-bold shadow-2xs' : 'text-theme-text-muted'
              }`}
            >
              👔 Groom
            </button>
            <button
              onClick={() => setSideFilter('ladkiwale')}
              className={`flex-1 py-0.5 rounded ${
                sideFilter === 'ladkiwale' ? 'bg-rose-100 text-rose-900 font-bold shadow-2xs' : 'text-theme-text-muted'
              }`}
            >
              👗 Bride
            </button>
          </div>

          {/* Draggable Guest Chips List */}
          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {filteredTrayGuests.map((g) => {
              const assigned = guestAssignmentMap.get(g.id);
              const party = parties?.find((p) => p.id === g.partyId);
              const isConfirmed = rsvps?.some(
                (r) =>
                  ((r.guestId === g.id && r.eventId === currentEventId && r.status === 'confirmed') ||
                    (r.partyId === g.partyId && !r.guestId && r.eventId === currentEventId && r.status === 'confirmed'))
              );

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

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isConfirmed && (
                        <span
                          className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 py-0.2 rounded"
                          title="RSVP Confirmed"
                        >
                          ✓
                        </span>
                      )}
                      {assigned ? (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-500"
                          title={`Seated: ${assigned.tableName} (Seat ${assigned.seatNumber})`}
                        />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-stone-300" title="Unseated" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-theme-text-muted mt-1">
                    <span className="truncate">{party?.partyName || 'Family'}</span>
                    {party?.side && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full capitalize ${
                          party.side === 'ladkewale'
                            ? 'bg-amber-100 text-amber-800'
                            : party.side === 'ladkiwale'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {party.side === 'ladkewale' ? '👔 Groom' : party.side === 'ladkiwale' ? '👗 Bride' : party.side}
                      </span>
                    )}
                  </div>

                  {assigned && (
                    <div className="text-[9px] font-semibold text-emerald-700 mt-1 truncate">
                      {assigned.tableName} &bull; Seat #{assigned.seatNumber}
                    </div>
                  )}
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
            <span>Drag any guest onto tables or seats on the floor plan!</span>
          </div>
        </div>

        {/* RIGHT 80-85% AREA: 2D Floor Plan Canvas with Interactive Droppable Tables */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-4">
          <div className="flex items-center justify-between text-xs text-theme-text-muted px-1">
            <span>
              💡 Drag elements on canvas to reposition. Drop guests directly onto tables or click to view details.
            </span>
            <span>{planElements.length} elements placed</span>
          </div>

          {/* 2D CANVAS */}
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="w-full h-[660px] bg-theme-background border-2 border-theme-border rounded-3xl shadow-inner relative overflow-hidden select-none bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px]"
          >
            {planElements.map((elem) => {
              const elemSeats = seatAssignments?.filter((s) => s.elementId === elem.id) || [];
              const isSelected = activeElementForSeats?.id === elem.id;

              return (
                <div
                  key={elem.id}
                  onMouseDown={(e) => handleMouseDown(e, elem)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const guestId = e.dataTransfer.getData('text/plain');
                    if (guestId && elem.capacity > 0) {
                      handleDropOnTable(elem, guestId);
                    }
                  }}
                  onClick={() => elem.capacity > 0 && setActiveElementForSeats(elem)}
                  className={`absolute rounded-2xl cursor-grab active:cursor-grabbing transition-shadow flex flex-col items-center justify-center p-2 text-center select-none group ${
                    isSelected ? 'ring-3 ring-theme-primary shadow-2xl' : 'shadow-md hover:shadow-xl'
                  } ${
                    elem.type === 'stage'
                      ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white border-2 border-amber-500'
                      : elem.type === 'mandap'
                      ? 'bg-gradient-to-r from-rose-700 to-rose-900 text-white border-2 border-rose-400'
                      : elem.type === 'dance_floor'
                      ? 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white border-2 border-purple-400'
                      : elem.type === 'round_table'
                      ? 'bg-theme-card border-2 border-theme-border rounded-full'
                      : elem.type === 'lounge_sofa'
                      ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-2xl'
                      : 'bg-theme-card border-2 border-theme-border'
                  }`}
                  style={{
                    left: `${elem.x}px`,
                    top: `${elem.y}px`,
                    width: `${elem.width}px`,
                    height: `${elem.height}px`,
                  }}
                >
                  {/* Action buttons (Edit & Delete) on hover */}
                  <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={(e) => openEditElement(elem, e)}
                      className="w-5 h-5 rounded-full bg-stone-700 text-white flex items-center justify-center hover:scale-110 shadow-xs text-[10px]"
                      title="Edit Label / Capacity"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteElement(elem.id, e)}
                      className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:scale-110 shadow-xs text-xs"
                      title="Delete Element"
                    >
                      &times;
                    </button>
                  </div>

                  <span className="font-bold text-[11px] leading-tight truncate px-1 pointer-events-none">
                    {elem.label}
                  </span>

                  {elem.capacity > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold opacity-90 pointer-events-none">
                      <Users className="w-3 h-3 text-theme-primary" />
                      <span>
                        {elemSeats.length} / {elem.capacity}
                      </span>
                    </div>
                  )}

                  {/* Visual Droppable Seat Pips around the Table */}
                  {elem.capacity > 0 && elem.type === 'round_table' && (
                    <div className="absolute inset-0 pointer-events-auto">
                      {Array.from({ length: elem.capacity }).map((_, idx) => {
                        const seatNum = idx + 1;
                        const angle = (idx * 2 * Math.PI) / elem.capacity;
                        const radius = elem.width / 2 + 10;
                        const pipX = elem.width / 2 + radius * Math.cos(angle) - 9;
                        const pipY = elem.height / 2 + radius * Math.sin(angle) - 9;

                        const seat = elemSeats.find((s) => s.seatNumber === seatNum);
                        const guest = seat?.guestId ? guests?.find((g) => g.id === seat.guestId) : null;

                        return (
                          <div
                            key={seatNum}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const guestId = e.dataTransfer.getData('text/plain');
                              if (guestId) {
                                assignGuestToTableSeat(elem.id, seatNum, guestId);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveElementForSeats(elem);
                            }}
                            className={`absolute w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all hover:scale-125 z-10 shadow-xs ${
                              guest
                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                : 'bg-white/90 border-stone-400 text-stone-700 hover:border-theme-primary'
                            }`}
                            style={{
                              left: `${pipX}px`,
                              top: `${pipY}px`,
                            }}
                            title={guest ? `Seat ${seatNum}: ${guest.name}` : `Seat ${seatNum} (Vacant)`}
                          >
                            {seatNum}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {planElements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-theme-text-muted space-y-3 pointer-events-none">
                <Armchair className="w-12 h-12 opacity-40 text-theme-primary" />
                <p className="font-bold text-base">2D Floor Plan is Empty</p>
                <p className="text-xs max-w-sm text-center">
                  Use the toolbar above to place Round Tables, Rectangular Tables, Stage, Mandap, or Dance Floor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Seat Allocations Drawer (NestedScreen) */}
      <NestedScreen
        isOpen={!!activeElementForSeats}
        onClose={() => setActiveElementForSeats(null)}
        title={activeElementForSeats?.label || 'Table Details'}
        subtitle={`Pillar 6: Seating Allocation (${activeElementForSeats?.capacity || 0} Seats)`}
        mode="drawer"
        width="lg"
        level={1}
      >
        {activeElementForSeats && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-theme-background p-3 rounded-2xl border border-theme-border">
              <div>
                <span className="font-bold text-theme-text-main block">{activeElementForSeats.label}</span>
                <span className="text-[11px] text-theme-text-muted">
                  Drag any guest onto a seat below, or pick from the dropdown.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleClearAllTableSeats(activeElementForSeats.id)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Clear All Seats
              </button>
            </div>

            {/* Attending Filter Checkbox */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-theme-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAttendingFilter}
                  onChange={(e) => setOnlyAttendingFilter(e.target.checked)}
                  className="rounded text-theme-primary focus:ring-theme-primary"
                />
                <span>Show attending RSVP guests only in dropdown</span>
              </label>
            </div>

            {/* Seats List */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {Array.from({ length: activeElementForSeats.capacity }).map((_, idx) => {
                const seatNum = idx + 1;
                const assignment = seatAssignments?.find(
                  (s) => s.elementId === activeElementForSeats.id && s.seatNumber === seatNum
                );
                const assignedGuest = guests?.find((g) => g.id === assignment?.guestId);
                const guestParty = parties?.find((p) => p.id === assignedGuest?.partyId);

                // Filter guests based on RSVP if enabled
                const displayedGuests = guests?.filter((g) => {
                  if (g.id === assignment?.guestId) return true; // always show currently seated guest
                  if (!onlyAttendingFilter) return true;
                  return rsvps?.some(
                    (r) =>
                      ((r.guestId === g.id && r.eventId === currentEventId && r.status === 'confirmed') ||
                        (r.partyId === g.partyId && !r.guestId && r.eventId === currentEventId && r.status === 'confirmed'))
                  );
                });

                return (
                  <div
                    key={seatNum}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const guestId = e.dataTransfer.getData('text/plain');
                      if (guestId) {
                        assignGuestToTableSeat(activeElementForSeats.id, seatNum, guestId);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all ${
                      assignedGuest
                        ? 'border-emerald-300 bg-emerald-500/5'
                        : 'border-dashed border-theme-border bg-theme-background'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-theme-primary/10 text-theme-primary font-bold text-[10px] flex items-center justify-center">
                          #{seatNum}
                        </span>
                        <span className="font-bold text-theme-text-main">
                          {assignedGuest ? assignedGuest.name : 'Empty Seat (Drop guest here)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {assignedGuest && guestParty && (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              guestParty.side === 'ladkewale'
                                ? 'bg-amber-100 text-amber-800'
                                : guestParty.side === 'ladkiwale'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {guestParty.side === 'ladkewale' ? '👔 Groom' : guestParty.side === 'ladkiwale' ? '👗 Bride' : guestParty.side}
                          </span>
                        )}

                        {assignedGuest && (
                          <button
                            type="button"
                            onClick={() => handleUnassignSeat(activeElementForSeats.id, seatNum)}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-600 transition-colors"
                            title="Clear Seat"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <select
                      value={assignment?.guestId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignGuestToTableSeat(activeElementForSeats.id, seatNum, e.target.value);
                        } else {
                          handleUnassignSeat(activeElementForSeats.id, seatNum);
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs text-theme-text-main cursor-pointer"
                    >
                      <option value="">-- Choose or drop a guest --</option>
                      {displayedGuests?.map((g) => {
                        const p = parties?.find((pty) => pty.id === g.partyId);
                        const isConfirmed = rsvps?.some(
                          (r) =>
                            ((r.guestId === g.id && r.eventId === currentEventId && r.status === 'confirmed') ||
                              (r.partyId === g.partyId && !r.guestId && r.eventId === currentEventId && r.status === 'confirmed'))
                        );
                        return (
                          <option key={g.id} value={g.id}>
                            {g.name} ({p?.partyName || 'Family'}{isConfirmed ? ' • RSVP Confirmed' : ''})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </NestedScreen>

      {/* Edit Table Properties Drawer (NestedScreen) */}
      <NestedScreen
        isOpen={isEditElementOpen && !!editingElement}
        onClose={() => setIsEditElementOpen(false)}
        title="Edit Venue Element"
        subtitle="Modify table label or seat capacity"
        mode="drawer"
        width="md"
        level={1}
      >
        {editingElement && (
          <form onSubmit={handleSaveElementProperties} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-text-main">Label / Name</label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-text-main">Seating Capacity</label>
              <input
                type="number"
                min="0"
                max="30"
                value={editCapacity}
                onChange={(e) => setEditCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
              />
              <span className="text-[10px] text-theme-text-muted">
                Set 0 for decorative elements like Stage, Mandap, or Dance Floor.
              </span>
            </div>

            <div className="pt-3 border-t border-theme-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteElement(editingElement.id)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Delete Table
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditElementOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </NestedScreen>
    </div>
  );
};
