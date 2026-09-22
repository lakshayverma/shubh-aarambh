import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import {
  Wedding,
  WeddingEvent,
  SeatingPlan,
  FloorPlanElement,
  TableSeatAssignment,
  GuestParty,
  Guest,
} from '../../db/schema';
import {
  Armchair,
  Plus,
  Trash2,
  Users,
  Maximize2,
  Sparkles,
  Layers,
  CheckCircle2,
  RotateCw,
  X,
  Eye,
  Crown,
} from 'lucide-react';

interface SeatingChartsManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export const SeatingChartsManager: React.FC<SeatingChartsManagerProps> = ({
  wedding,
  onOpenTagManager,
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

  // Active Ceremony & Seating Plan
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const activeEvent = events?.find((e) => e.id === selectedEventId) || events?.[0];
  const currentEventId = activeEvent?.id || '';

  // Get or initialize seating plan for current event
  const activePlan = seatingPlans?.find((p) => p.eventId === currentEventId);

  // Table Assignment Drawer/Modal
  const [activeElementForSeats, setActiveElementForSeats] = useState<FloorPlanElement | null>(null);

  // Dragging state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter elements belonging to active plan
  const planElements = elements?.filter((el) => el.seatingPlanId === activePlan?.id) || [];

  // Ensure a plan exists for the current event
  const ensurePlanExists = async () => {
    if (!activePlan && currentEventId) {
      const newPlan: SeatingPlan = {
        id: `plan-${wedding.id}-${currentEventId}`,
        weddingId: wedding.id,
        eventId: currentEventId,
        name: `${activeEvent?.name || 'Ceremony'} Floor Plan`,
        canvasWidth: 900,
        canvasHeight: 600,
      };
      await db.seatingPlans.put(newPlan);
    }
  };

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
      x: 100 + Math.floor(Math.random() * 200),
      y: 100 + Math.floor(Math.random() * 150),
      rotation: 0,
      width,
      height,
      capacity,
    };

    await db.floorPlanElements.put(newElement);
  };

  // Drag start
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

  // Drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElementId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let newX = Math.round((e.clientX - canvasRect.left - dragOffset.x) / 10) * 10; // Snap to 10px grid
    let newY = Math.round((e.clientY - canvasRect.top - dragOffset.y) / 10) * 10;

    newX = Math.max(10, Math.min(newX, 850));
    newY = Math.max(10, Math.min(newY, 550));

    db.floorPlanElements.update(draggingElementId, { x: newX, y: newY });
  };

  // Drag end
  const handleMouseUp = () => {
    setDraggingElementId(null);
  };

  const handleDeleteElement = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this venue element and remove its assigned seats?')) {
      await db.transaction('rw', [db.floorPlanElements, db.tableSeatAssignments], async () => {
        await db.floorPlanElements.delete(id);
        await db.tableSeatAssignments.where('elementId').equals(id).delete();
      });
      if (activeElementForSeats?.id === id) {
        setActiveElementForSeats(null);
      }
    }
  };

  // Seat Assignment Handling
  const handleAssignSeat = async (elementId: string, seatNumber: number, guestId: string) => {
    const existing = seatAssignments?.find((s) => s.elementId === elementId && s.seatNumber === seatNumber);
    if (guestId) {
      if (existing) {
        await db.tableSeatAssignments.update(existing.id, { guestId });
      } else {
        await db.tableSeatAssignments.put({
          id: `ts-${elementId}-${seatNumber}`,
          elementId,
          seatNumber,
          guestId,
        });
      }
    } else if (existing) {
      await db.tableSeatAssignments.delete(existing.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" onMouseUp={handleMouseUp}>
      
      {/* Header & Ceremony Selector */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Armchair className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                2D Floor Plan & Seating Charts
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 6: Drag-and-drop tables, stage, mandap, and assign guests to seats with side color-coding.
            </p>
          </div>

          {/* Ceremony Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-theme-text-muted">Function:</span>
            <select
              value={currentEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm font-semibold text-theme-text-main"
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
        <div className="border-t border-theme-border/60 pt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase text-theme-text-muted mr-1">Add to Floor:</span>

          <button
            onClick={() => handleAddElement('round_table', 'Round Table (8-Seater)', 110, 110, 8)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-theme-primary" />
            <span>Round Table (8)</span>
          </button>

          <button
            onClick={() => handleAddElement('rect_table', 'Banquet Table (10-Seater)', 160, 80, 10)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-theme-secondary" />
            <span>Rect Table (10)</span>
          </button>

          <button
            onClick={() => handleAddElement('lounge_sofa', 'Royal Diwan / Sofa', 140, 60, 4)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Couple Diwan (4)</span>
          </button>

          <button
            onClick={() => handleAddElement('stage', 'Main Stage', 320, 80, 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
          >
            <span>Stage</span>
          </button>

          <button
            onClick={() => handleAddElement('mandap', 'Sacred Mandap', 180, 120, 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
          >
            <span>Mandap</span>
          </button>

          <button
            onClick={() => handleAddElement('dance_floor', 'Dance Floor', 220, 100, 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
          >
            <span>Dance Floor</span>
          </button>
        </div>
      </div>

      {/* Main Interactive 2D Canvas & Side Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2D CANVAS (2 columns wide) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-text-muted px-1">
            <span>Drag items to position on grid. Click any table to configure seats.</span>
            <span>{planElements.length} elements placed</span>
          </div>

          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="w-full h-[580px] bg-theme-background border-2 border-theme-border rounded-3xl shadow-inner relative overflow-hidden select-none bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]"
          >
            {planElements.map((elem) => {
              const elemSeats = seatAssignments?.filter((s) => s.elementId === elem.id) || [];
              const isSelected = activeElementForSeats?.id === elem.id;

              return (
                <div
                  key={elem.id}
                  onMouseDown={(e) => handleMouseDown(e, elem)}
                  onClick={() => elem.capacity > 0 && setActiveElementForSeats(elem)}
                  className={`absolute rounded-2xl cursor-grab active:cursor-grabbing transition-shadow flex flex-col items-center justify-center p-2 text-center select-none ${
                    isSelected ? 'ring-3 ring-theme-primary shadow-xl' : 'shadow-md hover:shadow-lg'
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
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => handleDeleteElement(elem.id, e)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all text-xs"
                    title="Delete"
                  >
                    &times;
                  </button>

                  <span className="font-bold text-[11px] leading-tight truncate px-1">
                    {elem.label}
                  </span>

                  {elem.capacity > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold opacity-80">
                      <Users className="w-3 h-3" />
                      <span>{elemSeats.length} / {elem.capacity}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {planElements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-theme-text-muted space-y-2 pointer-events-none">
                <Armchair className="w-12 h-12 opacity-40" />
                <p className="font-bold text-sm">Floor Plan Empty</p>
                <p className="text-xs">Click items in the toolbar above to place tables, stage, or mandap.</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDE DRAWER: Table Seat Allocations (1 column wide) */}
        <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-theme-border/60 pb-3">
            <h3 className="font-serif font-bold text-base text-theme-text-main flex items-center gap-2">
              <Users className="w-4 h-4 text-theme-primary" />
              <span>Seat Allocation Details</span>
            </h3>
            <p className="text-xs text-theme-text-muted">
              {activeElementForSeats
                ? `Assigning guests for: ${activeElementForSeats.label}`
                : 'Click any table on the canvas to assign guest seats.'}
            </p>
          </div>

          {activeElementForSeats ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-theme-background p-2.5 rounded-xl border border-theme-border">
                <span className="font-semibold text-theme-text-main">{activeElementForSeats.label}</span>
                <span className="font-bold text-theme-primary">
                  Capacity: {activeElementForSeats.capacity} Seats
                </span>
              </div>

              {/* Seats List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {Array.from({ length: activeElementForSeats.capacity }).map((_, idx) => {
                  const seatNum = idx + 1;
                  const assignment = seatAssignments?.find(
                    (s) => s.elementId === activeElementForSeats.id && s.seatNumber === seatNum
                  );
                  const assignedGuest = guests?.find((g) => g.id === assignment?.guestId);
                  const guestParty = parties?.find((p) => p.id === assignedGuest?.partyId);

                  return (
                    <div
                      key={seatNum}
                      className="p-2.5 rounded-xl border border-theme-border bg-theme-background space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-theme-text-muted">Seat #{seatNum}</span>
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
                            {guestParty.side}
                          </span>
                        )}
                      </div>

                      <select
                        value={assignment?.guestId || ''}
                        onChange={(e) =>
                          handleAssignSeat(activeElementForSeats.id, seatNum, e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-card text-xs text-theme-text-main"
                      >
                        <option value="">-- Vacant Seat --</option>
                        {guests?.map((g) => {
                          const p = parties?.find((pty) => pty.id === g.partyId);
                          return (
                            <option key={g.id} value={g.id}>
                              {g.name} ({p?.partyName || 'Guest'})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-theme-text-muted space-y-2">
              <Armchair className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-semibold">Select a table on the 2D floor plan to view seat assignments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
