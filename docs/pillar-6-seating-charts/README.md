# Pillar 6: Seating Charts & 2D Floor Plan Designer

## 1. Overview & Purpose
Seating at Indian weddings differs by ceremony:
- A **Sangeet** requires a performance stage, dance floor, cocktail high-tops, and VIP lounge diwans.
- The **Shubh Vivah / Pheras** requires an auspicious mandap, sacred fire boundary, and theater-style rows divided by Bride and Groom families.
- The **Reception Dinner** requires round banquet tables and long presidential family tables.

Pillar 6 provides:
- Per-function **2D Floor Plan Layouts** (Sangeet, Reception, Pheras).
- An interactive **Drag-and-Drop Canvas with Snap-to-Grid**.
- Rich placeable venue objects: **Stage**, **Mandap**, **LED Dance Floor**, **Round Banquet Tables (8/10-seater)**, **Rectangular Tables**, and **Couple Diwans**.
- Table seat assignment drawer with side color-coding (*Ladkewale*, *Ladkiwale*, *Mutual*) and capacity limit enforcement.

---

## 2. Key Features & Capabilities

### 2.1 15–85% Drag-and-Drop Seating Workspace (`SeatingChartsManager.tsx`)
- **Left 15–20% Sticky Guest Tray**:
  - Displays all wedding guests with fast search and filters by *All*, *Attending*, *Unseated*, and *Seated*.
  - Side filter toggle: *All Sides*, *👔 Groom (Ladkewale)*, *👗 Bride (Ladkiwale)*.
  - Draggable HTML5 guest cards with demographic markers and current seating status dots (emerald if seated at a table, stone if unseated).
- **Right 80–85% Interactive 2D Floor Plan Canvas**:
  - Dot-matrix grid background with 10px snap-to-grid movement.
  - Drag tables, stage, mandap, or dance floor anywhere on the canvas to configure the layout.
  - Direct drag-and-drop: dragging a guest chip directly onto a table card automatically allocates them to the first available seat.
  - **Visual Droppable Seat Pips**: Circular seats around round tables display their seat numbers and occupied/vacant states; dropping directly on a seat pip assigns that exact seat number.
  - Hover actions on canvas elements to edit table label/capacity or delete elements.

### 2.2 Function-Specific Floor Plans
- Planners can create and switch between distinct floor plans for each ceremony (e.g. *Sangeet Ballroom Seating Layout*, *Reception Amphitheater*, *Lakeside Mandap Layout*).
- Preserves object positions and guest seat assignments per event.

### 2.3 Table Seat Allocation Drawer (`NestedScreen`)
- Clicking any table or diwan opens the `NestedScreen` slide-in right drawer with global `Esc` key support.
- Displays individual seat slots with drag-over drop target support, guest picker dropdown, and clear seat button (`X`).
- Displays side affiliation badges (*Ladkewale* vs *Ladkiwale*) to ensure balanced and harmonious family seating.
- "Clear All Seats" quick action to reset a table in one click.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface SeatingPlan {
  id: string;
  weddingId: string;
  eventId: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface FloorPlanElement {
  id: string;
  seatingPlanId: string;
  type: 'round_table' | 'rect_table' | 'lounge_sofa' | 'mandap' | 'stage' | 'dance_floor' | 'bar' | 'buffet' | 'custom';
  label: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  capacity: number;
}

export interface TableSeatAssignment {
  id: string;
  elementId: string;
  seatNumber: number;
  guestId: string;
}
```

IndexedDB Table Indexes:
- `seatingPlans`: `id, weddingId, eventId`
- `floorPlanElements`: `id, seatingPlanId, type`
- `tableSeatAssignments`: `id, elementId, guestId`
