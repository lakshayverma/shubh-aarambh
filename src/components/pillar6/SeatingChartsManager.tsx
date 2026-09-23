import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import {
  Wedding,
  FloorPlanElement,
  TableSeatAssignment,
  Guest,
  GuestParty,
} from '../../db/schema';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Position,
  Handle,
  MarkerType,
  Connection,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import {
  Armchair,
  Plus,
  Trash2,
  Users,
  Sparkles,
  Search,
  HelpCircle,
  X,
  Edit2,
  Download,
  RotateCcw,
  Crown,
  ChevronDown,
  Flame,
  Music,
  Wine,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react';
import { NestedScreen } from '../common/NestedScreen';

// ---------------------------------------------------------------------------
// Custom Table / Venue Element Node for React Flow
// ---------------------------------------------------------------------------

interface TableNodeData {
  element: FloorPlanElement;
  assignedSeats: TableSeatAssignment[];
  guestsMap: Map<string, Guest>;
  partiesMap: Map<string, GuestParty>;
  onEdit: (elem: FloorPlanElement) => void;
  onClearSeats: (elemId: string) => void;
  onDelete: (elemId: string) => void;
  onUnseatGuest: (elemId: string, seatNumber: number) => void;
}

const TableNodeComponent: React.FC<{ data: TableNodeData }> = ({ data }) => {
  const { element, assignedSeats, guestsMap, onEdit, onClearSeats, onDelete, onUnseatGuest } = data;
  const capacity = element.capacity || 0;
  const occupiedCount = assignedSeats.length;
  const isFull = capacity > 0 && occupiedCount >= capacity;

  // Build seat assignment lookup: seatNumber -> TableSeatAssignment
  const seatLookup = useMemo(() => {
    const map = new Map<number, TableSeatAssignment>();
    for (const s of assignedSeats) {
      map.set(s.seatNumber, s);
    }
    return map;
  }, [assignedSeats]);

  // 1. ROYAL DIWAN (Lounge Sofa) - 4 Seats on front (bottom) side
  if (element.type === 'lounge_sofa') {
    return (
      <div className="relative group select-none">
        {/* Diwan Body */}
        <div className="w-[300px] h-[130px] rounded-3xl bg-gradient-to-b from-amber-900/90 to-amber-950 text-white border-3 border-amber-400/90 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          {/* Royal Velvet Texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />

          {/* Diwan Backrest Cushion arch */}
          <div className="absolute -top-3 left-6 right-6 h-6 rounded-t-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 border-t-2 border-x-2 border-amber-300 opacity-90 shadow-inner" />

          {/* Header Row */}
          <div className="relative z-10 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/30 border border-amber-400 flex items-center justify-center text-amber-300">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif font-bold text-xs text-amber-200 tracking-wide truncate max-w-[150px]">
                {element.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isFull
                    ? 'bg-rose-500 text-white'
                    : occupiedCount > 0
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-amber-900/60 text-amber-200 border border-amber-700'
                }`}
              >
                {occupiedCount} / {capacity} Seated
              </span>

              {/* Hover Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(element);
                  }}
                  className="p-1 rounded bg-black/40 hover:bg-black/60 text-amber-300"
                  title="Edit Diwan"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                {occupiedCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearSeats(element.id);
                    }}
                    className="p-1 rounded bg-black/40 hover:bg-rose-600 text-rose-300"
                    title="Clear All Seats"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(element.id);
                  }}
                  className="p-1 rounded bg-black/40 hover:bg-rose-700 text-rose-300"
                  title="Delete Diwan"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Diwan Seating Matrix / Avatars on cushions */}
          <div className="relative z-10 grid grid-cols-4 gap-2 my-auto px-1">
            {[1, 2, 3, 4].map((seatNum) => {
              const assigned = seatLookup.get(seatNum);
              const guest = assigned ? guestsMap.get(assigned.guestId) : null;

              return (
                <div
                  key={seatNum}
                  className={`h-11 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                    guest
                      ? 'bg-amber-400/20 border-amber-300 text-white'
                      : 'bg-black/20 border-amber-500/30 text-amber-400/60'
                  }`}
                >
                  <span className="text-[8px] font-bold opacity-75">S{seatNum}</span>
                  {guest ? (
                    <div className="flex items-center gap-0.5 max-w-full">
                      <span className="text-[10px] font-bold truncate">{guest.name.split(' ')[0]}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnseatGuest(element.id, seatNum);
                        }}
                        className="text-rose-300 hover:text-white"
                        title="Unseat"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[9px] font-medium italic">Empty</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative z-10 text-[9px] text-amber-400/80 text-center font-medium">
            Front Edge Seats (Connect guests below)
          </div>
        </div>

        {/* 4 Edge Handles strictly on the FRONT (Bottom) side */}
        {[1, 2, 3, 4].map((seatNum) => {
          const leftOffsets = [15, 38, 62, 85];
          const assigned = seatLookup.get(seatNum);
          const isOcc = !!assigned;

          return (
            <Handle
              key={seatNum}
              type="source"
              position={Position.Bottom}
              id={`seat-${seatNum}`}
              style={{ left: `${leftOffsets[seatNum - 1]}%` }}
              className={`!w-5 !h-5 !rounded-full !border-2 !border-white flex items-center justify-center text-[9px] font-bold shadow-md hover:!scale-125 transition-transform z-20 ${
                isOcc ? '!bg-emerald-500 !text-white' : '!bg-amber-400 !text-amber-950'
              }`}
            >
              <span>{seatNum}</span>
            </Handle>
          );
        })}
      </div>
    );
  }

  // 2. ROUND TABLES (4, 6, 8, 10 Seater)
  if (element.type === 'round_table') {
    const size = Math.max(160, Math.min(240, 140 + capacity * 10));
    const radius = size / 2;

    // Generate radial handle positions around circle
    const handles = [];
    for (let i = 1; i <= capacity; i++) {
      const angle = (i - 1) * (360 / capacity) - 90; // Start at top
      const rad = (angle * Math.PI) / 180;
      const xPercent = 50 + 47 * Math.cos(rad);
      const yPercent = 50 + 47 * Math.sin(rad);

      // Closest standard position for connector edge orientation
      let pos = Position.Top;
      if (angle >= -45 && angle < 45) pos = Position.Right;
      else if (angle >= 45 && angle < 135) pos = Position.Bottom;
      else if (angle >= 135 && angle < 225) pos = Position.Left;

      handles.push({ seatNum: i, x: xPercent, y: yPercent, pos });
    }

    return (
      <div className="relative group select-none">
        {/* Circular Table Top */}
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-full bg-theme-card border-4 border-theme-primary/80 shadow-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-md"
        >
          {/* Decorative Tablecloth concentric ring */}
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-theme-border/70 pointer-events-none" />

          {/* Table Centerpiece Icon */}
          <div className="w-8 h-8 rounded-full bg-theme-primary-light text-theme-primary flex items-center justify-center mb-1 shadow-2xs">
            <UtensilsCrossed className="w-4 h-4" />
          </div>

          <span className="font-serif font-bold text-xs text-theme-text-main truncate max-w-[110px]">
            {element.label}
          </span>

          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
              isFull
                ? 'bg-rose-500 text-white'
                : occupiedCount > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            {occupiedCount} / {capacity} Seated
          </span>

          {/* Hover Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(element);
              }}
              className="p-1 rounded bg-theme-background border border-theme-border hover:border-theme-primary text-theme-text-muted hover:text-theme-primary"
              title="Edit Table"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            {occupiedCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearSeats(element.id);
                }}
                className="p-1 rounded bg-theme-background border border-theme-border hover:border-rose-500 text-theme-text-muted hover:text-rose-600"
                title="Clear Seats"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="p-1 rounded bg-theme-background border border-theme-border hover:border-rose-500 text-theme-text-muted hover:text-rose-600"
              title="Delete Table"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Radial Edge Handles around circumference */}
        {handles.map(({ seatNum, x, y, pos }) => {
          const assigned = seatLookup.get(seatNum);
          const isOcc = !!assigned;

          return (
            <Handle
              key={seatNum}
              type="source"
              position={pos}
              id={`seat-${seatNum}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`!w-5 !h-5 !rounded-full !border-2 !border-white flex items-center justify-center text-[9px] font-bold shadow-md hover:!scale-125 transition-transform z-20 ${
                isOcc ? '!bg-emerald-500 !text-white' : '!bg-theme-secondary !text-white'
              }`}
            >
              <span>{seatNum}</span>
            </Handle>
          );
        })}
      </div>
    );
  }

  // 3. RECTANGULAR TABLES (4, 6, 8, 10, 12 Seater)
  if (element.type === 'rect_table') {
    const half = Math.ceil(capacity / 2);
    const width = Math.max(220, Math.min(360, half * 65));
    const height = 110;

    return (
      <div className="relative group select-none">
        {/* Top Handles Row */}
        {Array.from({ length: half }).map((_, idx) => {
          const seatNum = idx + 1;
          const leftPercent = ((idx + 0.5) / half) * 100;
          const isOcc = seatLookup.has(seatNum);

          return (
            <Handle
              key={seatNum}
              type="source"
              position={Position.Top}
              id={`seat-${seatNum}`}
              style={{ left: `${leftPercent}%` }}
              className={`!w-5 !h-5 !rounded-full !border-2 !border-white flex items-center justify-center text-[9px] font-bold shadow-md hover:!scale-125 transition-transform z-20 ${
                isOcc ? '!bg-emerald-500 !text-white' : '!bg-indigo-500 !text-white'
              }`}
            >
              <span>{seatNum}</span>
            </Handle>
          );
        })}

        {/* Rectangular Table Body */}
        <div
          style={{ width: `${width}px`, height: `${height}px` }}
          className="rounded-2xl bg-theme-card border-3 border-indigo-400 shadow-xl p-3 flex flex-col justify-between relative backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="font-serif font-bold text-xs text-theme-text-main truncate max-w-[150px]">
              {element.label}
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isFull
                  ? 'bg-rose-500 text-white'
                  : occupiedCount > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {occupiedCount} / {capacity} Seated
            </span>
          </div>

          <div className="text-[10px] text-theme-text-muted text-center italic">
            Long Banquet Table
          </div>

          {/* Hover Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(element);
              }}
              className="p-1 rounded bg-theme-background border border-theme-border text-theme-text-muted hover:text-theme-primary"
              title="Edit Table"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            {occupiedCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearSeats(element.id);
                }}
                className="p-1 rounded bg-theme-background border border-theme-border text-theme-text-muted hover:text-rose-600"
                title="Clear Seats"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="p-1 rounded bg-theme-background border border-theme-border text-theme-text-muted hover:text-rose-600"
              title="Delete Table"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Bottom Handles Row */}
        {Array.from({ length: capacity - half }).map((_, idx) => {
          const seatNum = half + idx + 1;
          const leftPercent = ((idx + 0.5) / (capacity - half)) * 100;
          const isOcc = seatLookup.has(seatNum);

          return (
            <Handle
              key={seatNum}
              type="source"
              position={Position.Bottom}
              id={`seat-${seatNum}`}
              style={{ left: `${leftPercent}%` }}
              className={`!w-5 !h-5 !rounded-full !border-2 !border-white flex items-center justify-center text-[9px] font-bold shadow-md hover:!scale-125 transition-transform z-20 ${
                isOcc ? '!bg-emerald-500 !text-white' : '!bg-indigo-500 !text-white'
              }`}
            >
              <span>{seatNum}</span>
            </Handle>
          );
        })}
      </div>
    );
  }

  // 4. VENUE LANDMARKS (Mandap, Stage, Dance Floor, Bar, Buffet)
  const landmarkStyles = {
    mandap: {
      bg: 'bg-gradient-to-br from-amber-600 via-rose-600 to-amber-700 text-white border-amber-300',
      icon: Flame,
      title: 'Vedic Mandap & Pheras',
    },
    stage: {
      bg: 'bg-gradient-to-br from-rose-800 to-purple-900 text-white border-amber-400',
      icon: Sparkles,
      title: 'Grand Royal Stage',
    },
    dance_floor: {
      bg: 'bg-gradient-to-br from-purple-800 to-indigo-950 text-white border-fuchsia-400',
      icon: Music,
      title: 'Dance Floor & DJ',
    },
    bar: {
      bg: 'bg-gradient-to-br from-stone-800 to-stone-950 text-amber-200 border-amber-500',
      icon: Wine,
      title: 'Royal Cocktail Bar',
    },
    buffet: {
      bg: 'bg-gradient-to-br from-emerald-800 to-teal-950 text-white border-emerald-400',
      icon: UtensilsCrossed,
      title: 'Royal Feast Buffet',
    },
    custom: {
      bg: 'bg-theme-card text-theme-text-main border-theme-border',
      icon: Sparkles,
      title: 'Venue Element',
    },
  }[element.type] || {
    bg: 'bg-theme-card text-theme-text-main border-theme-border',
    icon: Sparkles,
    title: 'Venue Landmark',
  };

  const IconComp = landmarkStyles.icon;

  return (
    <div className="relative group select-none">
      <div
        style={{ width: `${element.width || 220}px`, height: `${element.height || 100}px` }}
        className={`rounded-3xl border-3 shadow-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-md ${landmarkStyles.bg}`}
      >
        <IconComp className="w-6 h-6 mb-1 opacity-90" />
        <span className="font-serif font-bold text-sm tracking-wide">{element.label}</span>
        <span className="text-[10px] opacity-75 font-medium">{landmarkStyles.title}</span>

        {/* Hover Delete Action */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="p-1 rounded bg-black/40 hover:bg-rose-600 text-white"
            title="Delete Landmark"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Custom Guest Node for React Flow
// ---------------------------------------------------------------------------

interface GuestNodeData {
  guest: Guest;
  party?: GuestParty;
  assignment?: { tableName: string; elementId: string; seatNumber: number };
  onUnseat: (guestId: string) => void;
}

const GuestNodeComponent: React.FC<{ data: GuestNodeData }> = ({ data }) => {
  const { guest, party, assignment, onUnseat } = data;
  const isLadkewale = party?.side === 'ladkewale';
  const isLadkiwale = party?.side === 'ladkiwale';

  return (
    <div className="relative group select-none">
      {/* Target handle on top to connect from Table seat handle */}
      <Handle
        type="target"
        position={Position.Top}
        id={`guest-target-${guest.id}`}
        className="!w-3.5 !h-3.5 !bg-theme-primary !border-2 !border-white !rounded-full -top-2 hover:!scale-125 transition-transform"
      />

      <div
        className={`p-2.5 rounded-2xl border-2 shadow-lg bg-theme-card min-w-[140px] max-w-[180px] transition-all ${
          assignment
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-100'
            : isLadkewale
            ? 'border-amber-300 shadow-amber-50'
            : isLadkiwale
            ? 'border-rose-300 shadow-rose-50'
            : 'border-theme-border'
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base">
              {guest.ageCategory === 'elder'
                ? '👴'
                : guest.ageCategory === 'child'
                ? '🧒'
                : guest.ageCategory === 'infant'
                ? '👶'
                : '👤'}
            </span>
            <div className="min-w-0">
              <div className="font-bold text-xs text-theme-text-main truncate">{guest.name}</div>
              <div className="text-[9px] text-theme-text-muted truncate">{party?.partyName || 'Family'}</div>
            </div>
          </div>

          {assignment && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnseat(guest.id);
              }}
              className="p-0.5 rounded text-theme-text-muted hover:text-rose-600 hover:bg-rose-50"
              title="Unseat Guest"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {assignment ? (
          <div className="mt-1.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold truncate flex items-center justify-between">
            <span className="truncate">{assignment.tableName}</span>
            <span className="ml-1 shrink-0">Seat #{assignment.seatNumber}</span>
          </div>
        ) : (
          <div className="mt-1.5 text-[9px] font-medium text-amber-700 bg-amber-50 px-1 py-0.2 rounded text-center">
            Drag near table to seat
          </div>
        )}
      </div>

      {/* Source handle on bottom if needed for chaining */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`guest-source-${guest.id}`}
        className="!w-2 !h-2 !bg-theme-secondary !border !border-white !rounded-full -bottom-1"
      />
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNodeComponent,
  guestNode: GuestNodeComponent,
};

// ---------------------------------------------------------------------------
// Main Seating Charts Canvas Component (Inside ReactFlowProvider)
// ---------------------------------------------------------------------------

interface SeatingChartsManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

const SeatingFlowCanvas: React.FC<SeatingChartsManagerProps> = ({ wedding }) => {
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );
  const seatingPlans = useLiveQuery(
    () => db.seatingPlans.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const elements = useLiveQuery(() => db.floorPlanElements.toArray(), []);
  const seatAssignments = useLiveQuery(() => db.tableSeatAssignments.toArray(), []);
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

  const activePlan = seatingPlans?.find((p) => p.eventId === currentEventId);

  // Flow Wrapper Ref for Export
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Table Edit Modal/Drawer
  const [isEditElementOpen, setIsEditElementOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<FloorPlanElement | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCapacity, setEditCapacity] = useState(8);

  // Guest Tray Filter State
  const [guestSearch, setGuestSearch] = useState('');
  const [guestTrayFilter, setGuestTrayFilter] = useState<'all' | 'unassigned' | 'assigned' | 'confirmed'>('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'ladkewale' | 'ladkiwale'>('all');

  // Plan Elements
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

  // Lookup Maps
  const guestsMap = useMemo(() => {
    const map = new Map<string, Guest>();
    if (guests) {
      for (const g of guests) map.set(g.id, g);
    }
    return map;
  }, [guests]);

  const partiesMap = useMemo(() => {
    const map = new Map<string, GuestParty>();
    if (parties) {
      for (const p of parties) map.set(p.id, p);
    }
    return map;
  }, [parties]);

  // Filtered guest list for left tray
  const filteredTrayGuests = useMemo(() => {
    if (!guests) return [];
    return guests.filter((g) => {
      const party = partiesMap.get(g.partyId);
      const matchesSearch =
        g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        (party?.partyName && party.partyName.toLowerCase().includes(guestSearch.toLowerCase()));

      const isAssigned = guestAssignmentMap.has(g.id);
      const isConfirmed = rsvps?.some(
        (r) =>
          (r.guestId === g.id && r.eventId === currentEventId && r.status === 'confirmed') ||
          (r.partyId === g.partyId && !r.guestId && r.eventId === currentEventId && r.status === 'confirmed')
      );

      const matchesFilter =
        guestTrayFilter === 'all'
          ? true
          : guestTrayFilter === 'assigned'
          ? isAssigned
          : guestTrayFilter === 'confirmed'
          ? isConfirmed
          : !isAssigned;

      const matchesSide = sideFilter === 'all' ? true : party?.side === sideFilter;

      return matchesSearch && matchesFilter && matchesSide;
    });
  }, [guests, partiesMap, guestSearch, guestTrayFilter, sideFilter, guestAssignmentMap, rsvps, currentEventId]);

  // Ensure Plan Record Exists
  const ensurePlanExists = async (): Promise<string> => {
    let planId = activePlan?.id;
    if (!planId) {
      planId = `plan-${wedding.id}-${currentEventId}`;
      await db.seatingPlans.put({
        id: planId,
        weddingId: wedding.id,
        eventId: currentEventId,
        name: `${activeEvent?.name || 'Ceremony'} Floor Plan`,
        canvasWidth: 1200,
        canvasHeight: 800,
      });
    }
    return planId;
  };

  // Add Element to Plan
  const handleAddElementAtPosition = async (
    type: FloorPlanElement['type'],
    label: string,
    width: number,
    height: number,
    capacity: number,
    x: number,
    y: number
  ) => {
    const planId = await ensurePlanExists();
    const newElement: FloorPlanElement = {
      id: `elem-${Date.now()}`,
      seatingPlanId: planId,
      type,
      label,
      x,
      y,
      rotation: 0,
      width,
      height,
      capacity,
    };
    await db.floorPlanElements.put(newElement);
  };

  // Seat Assignment Actions
  const assignGuestToTableSeat = async (elementId: string, seatNumber: number, guestId: string) => {
    const planElemIds = new Set(planElements.map((e) => e.id));
    const allAssignments = await db.tableSeatAssignments.toArray();

    // 1. Unassign prior seat in this ceremony
    const prior = allAssignments.find((s) => planElemIds.has(s.elementId) && s.guestId === guestId);
    if (prior) {
      await db.tableSeatAssignments.delete(prior.id);
    }

    // 2. Put new seat assignment
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

  const handleDropOnTable = async (element: FloorPlanElement, guestId: string) => {
    if (element.capacity <= 0) return;
    const tableSeats = seatAssignments?.filter((s) => s.elementId === element.id) || [];
    const occupiedSeats = new Set(tableSeats.map((s) => s.seatNumber));

    let vacantSeatNum = 1;
    for (let i = 1; i <= element.capacity; i++) {
      if (!occupiedSeats.has(i)) {
        vacantSeatNum = i;
        break;
      }
    }
    await assignGuestToTableSeat(element.id, vacantSeatNum, guestId);
  };

  const handleUnseatGuest = async (elementId: string, seatNumber: number) => {
    const allAssignments = await db.tableSeatAssignments.toArray();
    const target = allAssignments.find(
      (s) => s.elementId === elementId && s.seatNumber === seatNumber
    );
    if (target) {
      await db.tableSeatAssignments.delete(target.id);
    }
  };

  const handleUnseatGuestById = async (guestId: string) => {
    const planElemIds = new Set(planElements.map((e) => e.id));
    const allAssignments = await db.tableSeatAssignments.toArray();
    const target = allAssignments.find((s) => planElemIds.has(s.elementId) && s.guestId === guestId);
    if (target) {
      await db.tableSeatAssignments.delete(target.id);
    }
  };

  const handleClearAllTableSeats = async (elementId: string) => {
    if (confirm('Clear all seated guests from this table?')) {
      const allAssignments = await db.tableSeatAssignments.where('elementId').equals(elementId).toArray();
      for (const a of allAssignments) {
        await db.tableSeatAssignments.delete(a.id);
      }
    }
  };

  const handleDeleteElement = async (id: string) => {
    if (confirm('Delete this venue element and remove all assigned seats?')) {
      await db.transaction('rw', [db.floorPlanElements, db.tableSeatAssignments], async () => {
        await db.floorPlanElements.delete(id);
        await db.tableSeatAssignments.where('elementId').equals(id).delete();
      });
      setIsEditElementOpen(false);
    }
  };

  // Convert elements and assignments to React Flow Nodes & Edges
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // 1. Table / Venue Element Nodes
    for (const elem of planElements) {
      const elemSeats = seatAssignments?.filter((s) => s.elementId === elem.id) || [];

      flowNodes.push({
        id: elem.id,
        type: 'tableNode',
        position: { x: elem.x, y: elem.y },
        data: {
          element: elem,
          assignedSeats: elemSeats,
          guestsMap,
          partiesMap,
          onEdit: (e: FloorPlanElement) => {
            setEditingElement(e);
            setEditLabel(e.label);
            setEditCapacity(e.capacity);
            setIsEditElementOpen(true);
          },
          onClearSeats: handleClearAllTableSeats,
          onDelete: handleDeleteElement,
          onUnseatGuest: handleUnseatGuest,
        },
      });

      // 2. Add Seated Guest Nodes and Connector Edges
      elemSeats.forEach((seat, idx) => {
        const guest = guestsMap.get(seat.guestId);
        if (!guest) return;

        const party = partiesMap.get(guest.partyId);
        const guestNodeId = `guest-${guest.id}`;

        // Compute aesthetic offset relative to table node
        let guestX = elem.x + (idx % 2 === 0 ? -160 : (elem.width || 200) + 20);
        let guestY = elem.y + Math.floor(idx / 2) * 80;

        if (elem.type === 'lounge_sofa') {
          // Position under the diwan handles
          guestX = elem.x + idx * 75 - 10;
          guestY = elem.y + 170;
        }

        flowNodes.push({
          id: guestNodeId,
          type: 'guestNode',
          position: { x: guestX, y: guestY },
          data: {
            guest,
            party,
            assignment: {
              tableName: elem.label,
              elementId: elem.id,
              seatNumber: seat.seatNumber,
            },
            onUnseat: handleUnseatGuestById,
          },
        });

        // Edge connector from table seat handle to guest
        flowEdges.push({
          id: `edge-${elem.id}-seat-${seat.seatNumber}-${guest.id}`,
          source: elem.id,
          sourceHandle: `seat-${seat.seatNumber}`,
          target: guestNodeId,
          targetHandle: `guest-target-${guest.id}`,
          animated: true,
          style: {
            stroke:
              party?.side === 'ladkewale'
                ? '#D97706'
                : party?.side === 'ladkiwale'
                ? '#BE185D'
                : '#7B1113',
            strokeWidth: 2.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: party?.side === 'ladkewale' ? '#D97706' : '#BE185D',
          },
        });
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [planElements, seatAssignments, guestsMap, partiesMap]);

  // Proximity Snap on Node Drag Stop
  const onNodeDragStop = useCallback(
    async (_: MouseEvent | TouchEvent, node: Node) => {
      if (node.type === 'tableNode') {
        await db.floorPlanElements.update(node.id, {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        });
      } else if (node.type === 'guestNode') {
        const guestId = (node.data as any).guest?.id;
        if (!guestId) return;

        // Proximity detection: find closest table within 170px
        const PROXIMITY_THRESHOLD = 170;
        let closestTable: FloorPlanElement | null = null;
        let minDistance = Infinity;

        for (const elem of planElements) {
          const elemCenterX = elem.x + (elem.width || 180) / 2;
          const elemCenterY = elem.y + (elem.height || 120) / 2;
          const guestCenterX = node.position.x + 80;
          const guestCenterY = node.position.y + 30;
          const dist = Math.hypot(elemCenterX - guestCenterX, elemCenterY - guestCenterY);

          if (dist < minDistance && dist <= PROXIMITY_THRESHOLD) {
            minDistance = dist;
            closestTable = elem;
          }
        }

        if (closestTable && closestTable.capacity > 0) {
          await handleDropOnTable(closestTable, guestId);
        }
      }
    },
    [planElements]
  );

  // Manual Edge Connection (Connecting seat handle to guest)
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Case 1: table seat -> guest
      if (connection.sourceHandle?.startsWith('seat-') && connection.target.startsWith('guest-')) {
        const elementId = connection.source;
        const seatNumber = parseInt(connection.sourceHandle.replace('seat-', ''), 10) || 1;
        const guestId = connection.target.replace('guest-', '');
        await assignGuestToTableSeat(elementId, seatNumber, guestId);
      }
      // Case 2: guest -> table seat
      else if (connection.targetHandle?.startsWith('seat-') && connection.source.startsWith('guest-')) {
        const elementId = connection.target;
        const seatNumber = parseInt(connection.targetHandle.replace('seat-', ''), 10) || 1;
        const guestId = connection.source.replace('guest-', '');
        await assignGuestToTableSeat(elementId, seatNumber, guestId);
      }
    },
    [planElements]
  );

  // Drag and Drop from Left Guest Tray or Element Palette onto Canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = flowWrapperRef.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      // 1. Dropped Venue Element
      const elemDataStr = event.dataTransfer.getData('application/reactflow-element');
      if (elemDataStr) {
        try {
          const parsed = JSON.parse(elemDataStr);
          const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          await handleAddElementAtPosition(
            parsed.type,
            parsed.label,
            parsed.width,
            parsed.height,
            parsed.capacity,
            Math.round(position.x),
            Math.round(position.y)
          );
        } catch (err) {
          console.error('Failed to parse dropped element:', err);
        }
        return;
      }

      // 2. Dropped Guest from Left Tray
      const guestId = event.dataTransfer.getData('application/reactflow-guest') || event.dataTransfer.getData('text/plain');
      if (guestId) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Check proximity to existing table nodes
        const PROXIMITY_THRESHOLD = 170;
        let closestTable: FloorPlanElement | null = null;
        let minDistance = Infinity;

        for (const elem of planElements) {
          const elemCenterX = elem.x + (elem.width || 180) / 2;
          const elemCenterY = elem.y + (elem.height || 120) / 2;
          const dist = Math.hypot(elemCenterX - position.x, elemCenterY - position.y);
          if (dist < minDistance && dist <= PROXIMITY_THRESHOLD) {
            minDistance = dist;
            closestTable = elem;
          }
        }

        if (closestTable && closestTable.capacity > 0) {
          await handleDropOnTable(closestTable, guestId);
        } else if (planElements.length > 0) {
          // If dropped near canvas without snapping, seat at first table with vacant seat
          const firstVacant = planElements.find((e) => {
            const seats = seatAssignments?.filter((s) => s.elementId === e.id) || [];
            return e.capacity > 0 && seats.length < e.capacity;
          });
          if (firstVacant) {
            await handleDropOnTable(firstVacant, guestId);
          }
        }
      }
    },
    [screenToFlowPosition, planElements, seatAssignments]
  );

  // High-Resolution Image Export (PNG)
  const handleExportPng = async () => {
    if (!flowWrapperRef.current) return;
    setIsExporting(true);
    try {
      const viewportElem =
        (flowWrapperRef.current.querySelector('.react-flow__viewport') as HTMLElement) ||
        flowWrapperRef.current;

      const dataUrl = await toPng(viewportElem, {
        backgroundColor: '#FCFBF7',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${(activeEvent?.name || 'Ceremony').replace(/[^a-z0-9]/gi, '_')}-Seating-Chart.png`;
      link.href = dataUrl;
      link.click();
      setExportNotice('Seating chart exported as high-resolution PNG!');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Export failed:', err);
      setExportNotice('Failed to export seating chart.');
      setTimeout(() => setExportNotice(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveElementProperties = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElement) return;
    await db.floorPlanElements.update(editingElement.id, {
      label: editLabel.trim() || editingElement.label,
      capacity: Number(editCapacity) || 8,
    });
    setIsEditElementOpen(false);
    setEditingElement(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Ceremony Selector & Action Toolbar */}
      <div className="bg-theme-card p-4 rounded-3xl border border-theme-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Ceremony Dropdown / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted shrink-0 flex items-center gap-1">
              <Armchair className="w-4 h-4 text-theme-primary" />
              <span>Ceremony:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              {events?.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                    ev.id === currentEventId
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                      : 'border-theme-border bg-theme-background text-theme-text-main hover:border-theme-primary/40'
                  }`}
                >
                  {ev.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics & Export Button */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-theme-background border border-theme-border text-xs">
              <span>
                Tables: <strong>{planElements.length}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Seated: <strong>{seatAssignments?.filter((s) => planElements.some((e) => e.id === s.elementId)).length || 0}</strong>
              </span>
            </div>

            {/* PNG Export Button */}
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-card hover:bg-theme-border/30 text-xs font-bold text-theme-text-main transition-colors shadow-2xs"
              title="Export floor plan as high-resolution PNG"
            >
              <Download className="w-3.5 h-3.5 text-theme-primary" />
              <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
            </button>
          </div>
        </div>

        {/* DRAG-AND-DROP VENUE ELEMENT PALETTE TOOLBAR */}
        <div className="pt-2 border-t border-theme-border/70 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider shrink-0">
            Drag Elements to Canvas:
          </span>

          {/* 1. Royal Diwan (4 seats) */}
          <div
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                'application/reactflow-element',
                JSON.stringify({
                  type: 'lounge_sofa',
                  label: 'Royal Diwan (VIP)',
                  width: 300,
                  height: 130,
                  capacity: 4,
                })
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-2xs shrink-0 select-none hover:scale-105 transition-transform"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Royal Diwan (4 Seats)</span>
          </div>

          {/* 2. Round Tables (4, 6, 8, 10 Seats) */}
          {[4, 6, 8, 10].map((cap) => (
            <div
              key={`round-${cap}`}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/reactflow-element',
                  JSON.stringify({
                    type: 'round_table',
                    label: `Round Table (${cap})`,
                    width: 180,
                    height: 180,
                    capacity: cap,
                  })
                );
              }}
              className="px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:border-theme-primary text-xs font-semibold text-theme-text-main flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-2xs shrink-0 select-none hover:scale-105 transition-transform"
            >
              <UtensilsCrossed className="w-3 h-3 text-theme-primary" />
              <span>Round ({cap})</span>
            </div>
          ))}

          {/* 3. Rect Tables (6, 8, 12 Seats) */}
          {[6, 8, 12].map((cap) => (
            <div
              key={`rect-${cap}`}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/reactflow-element',
                  JSON.stringify({
                    type: 'rect_table',
                    label: `Banquet (${cap})`,
                    width: 260,
                    height: 110,
                    capacity: cap,
                  })
                );
              }}
              className="px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-background hover:border-indigo-500 text-xs font-semibold text-theme-text-main flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-2xs shrink-0 select-none hover:scale-105 transition-transform"
            >
              <Users className="w-3 h-3 text-indigo-600" />
              <span>Banquet ({cap})</span>
            </div>
          ))}

          {/* 4. Landmarks (Mandap, Stage, Dance Floor) */}
          <div
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                'application/reactflow-element',
                JSON.stringify({
                  type: 'mandap',
                  label: 'Vedic Mandap',
                  width: 240,
                  height: 120,
                  capacity: 0,
                })
              );
            }}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-2xs shrink-0 select-none"
          >
            <Flame className="w-3 h-3" />
            <span>Mandap</span>
          </div>

          <div
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                'application/reactflow-element',
                JSON.stringify({
                  type: 'stage',
                  label: 'Grand Stage',
                  width: 260,
                  height: 110,
                  capacity: 0,
                })
              );
            }}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-2xs shrink-0 select-none"
          >
            <Sparkles className="w-3 h-3" />
            <span>Stage</span>
          </div>

          <div
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                'application/reactflow-element',
                JSON.stringify({
                  type: 'dance_floor',
                  label: 'Dance Floor',
                  width: 200,
                  height: 140,
                  capacity: 0,
                })
              );
            }}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950 text-purple-200 border border-purple-700 text-xs font-semibold flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-2xs shrink-0 select-none"
          >
            <Music className="w-3 h-3" />
            <span>Dance Floor</span>
          </div>
        </div>
      </div>

      {/* Export Notice Toast */}
      {exportNotice && (
        <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* MAIN 15-85 INTERACTIVE SEATING LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT 15-20% COLUMN: Guest Tray */}
        <div className="lg:col-span-3 xl:col-span-2 bg-theme-card p-3 rounded-3xl border border-theme-border shadow-xs flex flex-col h-[700px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-xs text-theme-text-main flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-theme-primary" />
              <span>Guest Tray</span>
            </span>
            <span className="text-[10px] text-theme-text-muted bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-full font-bold">
              {filteredTrayGuests.length}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-theme-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              placeholder="Search guests..."
              className="w-full pl-8 pr-2 py-1 rounded-xl border border-theme-border bg-theme-background text-xs text-theme-text-main"
            />
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-theme-background/70 p-1 rounded-xl text-[10px] font-semibold border border-theme-border/50">
            <button
              onClick={() => setGuestTrayFilter('all')}
              className={`py-1 rounded-lg ${
                guestTrayFilter === 'all' ? 'bg-theme-card text-theme-text-main shadow-2xs font-bold' : 'text-theme-text-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGuestTrayFilter('unassigned')}
              className={`py-1 rounded-lg ${
                guestTrayFilter === 'unassigned' ? 'bg-theme-card text-amber-700 shadow-2xs font-bold' : 'text-theme-text-muted'
              }`}
            >
              Unseated
            </button>
            <button
              onClick={() => setGuestTrayFilter('assigned')}
              className={`py-1 rounded-lg ${
                guestTrayFilter === 'assigned' ? 'bg-theme-card text-emerald-700 shadow-2xs font-bold' : 'text-theme-text-muted'
              }`}
            >
              Seated
            </button>
            <button
              onClick={() => setGuestTrayFilter('confirmed')}
              className={`py-1 rounded-lg ${
                guestTrayFilter === 'confirmed' ? 'bg-theme-card text-indigo-700 shadow-2xs font-bold' : 'text-theme-text-muted'
              }`}
            >
              RSVP Yes
            </button>
          </div>

          {/* Side Filter */}
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
              const party = partiesMap.get(g.partyId);

              return (
                <div
                  key={g.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow-guest', g.id);
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

                    <div className="flex items-center gap-1 shrink-0">
                      {assigned ? (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                          title={`Seated: ${assigned.tableName} (Seat ${assigned.seatNumber})`}
                        />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" title="Unseated" />
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
                        {party.side === 'ladkewale' ? '👔 Groom' : party.side === 'ladkiwale' ? '👗 Bride' : 'Mutual'}
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
            <HelpCircle className="w-3.5 h-3.5 text-theme-secondary shrink-0" />
            <span>Drag guest onto tables or near seats to auto-connect!</span>
          </div>
        </div>

        {/* RIGHT 80-85% CANVAS: React Flow Interactive Floor Plan */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-3">
          <div className="flex items-center justify-between text-xs text-theme-text-muted px-1">
            <span>
              💡 <strong>React Flow Canvas</strong>: Drag & drop elements or guests onto canvas. Connect seat handles to guests, or drag guest near table for proximity snap!
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fitView()}
                className="px-2.5 py-1 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-border/20 text-xs font-semibold text-theme-text-main shadow-2xs"
              >
                Fit Canvas
              </button>
            </div>
          </div>

          {/* REACT FLOW CANVAS CONTAINER */}
          <div
            ref={flowWrapperRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="w-full h-[700px] bg-theme-background border-2 border-theme-border rounded-3xl shadow-inner relative overflow-hidden"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeDragStop={onNodeDragStop}
              onConnect={onConnect}
              connectionMode={ConnectionMode.Loose}
              fitView
              className="bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px]"
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--theme-border)" />
              <Controls showZoom={true} showFitView={true} showInteractive={true} />
              <MiniMap
                nodeStrokeColor="#7B1113"
                nodeColor="#FEF3C7"
                className="!bg-theme-card !border !border-theme-border !rounded-2xl shadow-lg"
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Edit Table Properties Drawer */}
      <NestedScreen
        isOpen={isEditElementOpen}
        onClose={() => {
          setIsEditElementOpen(false);
          setEditingElement(null);
        }}
        title={`Edit ${editingElement?.label || 'Table'}`}
        subtitle="Update seating capacity and table identifier"
        mode="drawer"
        width="md"
        level={1}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditElementOpen(false);
                setEditingElement(null);
              }}
              className="px-4 py-2 rounded-xl border border-theme-border text-xs font-semibold text-theme-text-muted hover:bg-theme-border/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveElementProperties}
              className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold transition-all shadow-xs"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveElementProperties} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-main">Table Label / Name</label>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm text-theme-text-main"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-main">Seating Capacity</label>
            <input
              type="number"
              min={1}
              max={16}
              value={editCapacity}
              onChange={(e) => setEditCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm text-theme-text-main"
            />
          </div>
        </form>
      </NestedScreen>
    </div>
  );
};

export const SeatingChartsManager: React.FC<SeatingChartsManagerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <SeatingFlowCanvas {...props} />
    </ReactFlowProvider>
  );
};
