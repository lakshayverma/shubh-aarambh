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

### 2.1 Function-Specific Floor Plans (`SeatingChartsManager.tsx`)
- Planners can create and switch between distinct floor plans for each ceremony (e.g. *Sangeet Ballroom Seating Layout*, *Reception Amphitheater*, *Lakeside Mandap Layout*).
- Preserves object positions and guest seat assignments per event.

### 2.2 Interactive 2D Drag-and-Drop Canvas
- **Grid Canvas**: Features a dot-matrix background with smooth 10px snap-to-grid movement.
- **Venue Elements Palette**:
  - **Main Performance Stage**: Wide platform element with gold/amber gradient for choreography and DJ setups.
  - **Sacred Mandap**: Royal crimson pavilion element for the sacred agni pheras.
  - **LED Dance Floor**: Central illuminated dance floor element.
  - **Round Banquet Tables (8-Seater & 10-Seater)**: Circular tables with surrounding seat dots and capacity counters.
  - **Banquet Rectangular Tables (10-Seater)**: Long presidential dining tables.
  - **Royal Couple Diwans / Lounge Sofas (4-Seater)**: Low Indian seating (baithak) for the couple and immediate parents.
- Elements display live capacity counters (e.g. `4 / 8 Seats Filled`) directly on the canvas.

### 2.3 Table Seat Assignment Drawer
- Clicking any table or diwan opens the side seat assignment panel.
- Displays individual seat slots (Seat #1 to Seat #N).
- Planners select guests from the Pillar 3 Guest List via dropdowns.
- Displays side affiliation badges (*Ladkewale* vs *Ladkiwale*) to ensure balanced and harmonious family seating.
- Unassigning a guest or reallocating is instantaneous.

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
