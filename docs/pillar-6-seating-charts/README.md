# Pillar 6: Seating Charts with React Flow & Proximity Drag-and-Drop

## 1. Overview & Purpose
Seating at Indian weddings differs by ceremony:
- A **Sangeet** requires a performance stage, dance floor, cocktail high-tops, and VIP lounge diwans.
- The **Shubh Vivah / Pheras** requires an auspicious mandap, sacred fire boundary, and theater-style rows divided by Bride and Groom families.
- The **Reception Dinner** requires round banquet tables and long presidential family tables.

Pillar 6 provides:
- Per-function **2D Floor Plan Layouts** (Sangeet, Reception, Pheras) powered by **React Flow (`@xyflow/react`)**.
- Custom table and venue nodes with accurate seating sizes, shapes, and handles.
- **Royal Diwan** with 4 front-edge seat connectors for VIPs and elders.
- **Round Tables (4, 6, 8, 10-seaters)** with radial perimeter handles.
- **Rectangular Banquet Tables (4, 6, 8, 10, 12-seaters)** with top/bottom edge handles.
- **Proximity Snap & Auto-Connect**: Dragging a guest node near a table automatically connects them to the closest vacant seat handle via an animated edge.
- **Manual Edge Connections**: Drag connector lines directly from table seat handles to guest nodes.
- **Drag-and-Drop Palette**: Drag venue elements (Diwans, Round Tables, Rect Tables, Mandap, Stage, Dance Floor) directly from toolbar onto the canvas.
- **High-Resolution PNG Export**: 1-click export of the floor plan as a high-DPI image via `html-to-image`.
- **Zoom & Viewport Controls**: Full pan, mouse wheel zoom, trackpad pinch, `<Controls />`, and `<MiniMap />`.

---

## 2. Key Features & Capabilities

### 2.1 15–85% Drag-and-Drop Seating Workspace (`SeatingChartsManager.tsx`)
- **Left 15–20% Sticky Guest Tray**:
  - Displays all wedding guests with fast search and filters by *All*, *Unseated*, *Seated*, and *RSVP Yes*.
  - Side filter toggle: *All Sides*, *👔 Groom (Ladkewale)*, *👗 Bride (Ladkiwale)*.
  - Draggable HTML5 guest cards with demographic markers and current seating status dots (emerald if seated, stone if unseated).
  - Dragging a guest from the tray onto the canvas seats them at the table or places them on the floor plan.
- **Right 80–85% React Flow Canvas**:
  - Dot-matrix blueprint background with grid spacing.
  - Interactive nodes for tables and placed guests.
  - **Royal Diwan (4 Seats)**: Ornate velvet arch styling with 4 front-edge seat handles (S1, S2, S3, S4) ready for VIP connections.
  - **Round Tables**: Radial perimeter handles at calculated angles (4, 6, 8, 10 seaters).
  - **Rectangular Tables**: Dual-edge handles on top and bottom rows.
  - **Proximity Auto-Connect**: Moving any guest node within 170px of a table automatically assigns them to the first vacant seat and draws an animated colored edge.
  - **Manual Edge Connection**: Dragging a line from any seat handle to a guest node assigns that seat immediately.
  - **Hover Actions on Tables**: Edit label and capacity, clear all seats, or delete table.

### 2.2 Function-Specific Floor Plans
- Planners can create and switch between distinct floor plans for each ceremony (e.g. *Sangeet Ballroom Seating Layout*, *Reception Amphitheater*, *Lakeside Mandap Layout*).
- Preserves object positions and guest seat assignments per event.

### 2.3 Image Export & Zoom Controls
- **Export PNG Button**: Captures the flow viewport at 2x pixel ratio and downloads `[Ceremony]_Seating_Chart.png`.
- **Zoom Controls**: `<Controls />` widget (Zoom In, Zoom Out, Fit View, Lock).
- **MiniMap**: Bird's eye overview of large ballroom layouts with color-coded nodes.

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
