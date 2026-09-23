# Vivah Planner — System Architecture & Design Specification

> **Version**: 1.0.0  
> **Status**: Production Release  
> **Application Type**: 100% Client-Side Offline-First Progressive Web App (PWA)  
> **Target Audience**: Professional Wedding Planners, Couple Families (*Ladkiwale* & *Ladkewale*), Hospitality Coordinators  

---

## 1. Executive Summary & Product Vision

**Vivah Planner** is a specialized, privacy-first Indian wedding management platform engineered to orchestrate large-scale, multi-day, multi-ceremony weddings (often spanning 500 to 2,000+ attendees) across **7 foundational pillars**.

### 1.1 The Core Problem in Indian Wedding Planning
Indian weddings are distinctively complex, multi-day celebrations characterized by:
- **Parallel Ceremonies & Sub-Events**: Mehendi, Haldi, Sangeet, Baraat, Pheras/Vivah, Reception, and intimate poojas.
- **Bilateral Family Structures**: Two distinct sides (*Ladkiwale* / Bride's Side and *Ladkewale* / Groom's Side) with distinct hosting duties, generation hierarchies, and cultural protocols.
- **Logistical Interdependence**: A change in RSVP directly impacts hotel room allocations, airport pickup vans, banquet seating, and food catering counts.
- **Privacy & Connectivity Challenges**: Grand destination weddings (e.g., palaces in Udaipur, beach resorts in Goa) frequently experience poor cellular connectivity. Event coordinators cannot rely on fragile cloud servers or subscriptions.

### 1.2 The Vivah Planner Solution
- **100% Offline-First Architecture**: Powered by browser IndexedDB via `Dexie.js`. Zero cloud backends, zero external API keys, zero subscription barriers, and zero tracking. All wedding data remains entirely sovereign on the user's device.
- **Unified 7-Pillar Management**: From initial ceremony scheduling and genealogical family trees to 15–85% drag-and-drop vehicle fleet planning and proximity-snapping seating charts.
- **Instant Data Portability**: Single-click full JSON backup export and 1-click restore for offline device synchronization and archival.

---

## 2. Core Design Principles

### 2.1 Cultural Authenticity & Regal Aesthetics
Indian weddings are joyful, sacred, and grand. The UI reflects this through:
- Warm, royal color palettes (Deep Maroon, Marigold Gold, Ivory, Royal Peacock Teal, Sandalwood Saffron).
- Auspicious ceremonial motifs, ritual icons (☀️, 🎨, 🎵, 👑, 🥂, 🔥), and Muhurat countdown timers.
- Elegant serif typography (`Playfair Display` or serif font stacks) for ceremonial headers paired with ultra-clean sans-serif typography (`Inter` / system-ui) for dense operational data tables.

### 2.2 Offline Privacy First (Zero-Cloud Invariant)
Every feature must function completely offline:
- All database operations execute against local IndexedDB (`VivahPlannerDB`).
- Service worker caching (`vite-plugin-pwa` + Workbox) caches all application shells, assets, and icons for instant offline booting.
- Export mechanisms (PNG rendering via `html-to-image`, `.ics` calendar generation, standalone invite HTML files, JSON backups) execute entirely in-memory on the client thread.

### 2.3 Dense Information Architecture & Progressive Disclosure
Wedding coordinators manage high data density (guest dietary preferences, phone numbers, RSVP statuses across 5+ events, room check-in times). Vivah Planner balances density with clarity:
- **Dense Data Grids**: High-efficiency tabular views with sticky headers, subtle alternating row bands, and inline status badges.
- **Progressive Disclosure via Drawers**: Avoid disruptive full-page navigation. All forms, detail views, and edit flows slide smoothly from the right using the standardized `NestedScreen` drawer component.
- **Level 1 and Level 2 Stacking**: Secondary tasks (e.g., editing a guest tag while inside the Guest Edit drawer) stack seamlessly at `level={2}` with dimming backdrops and coordinated `Escape` key pops.

### 2.4 Ultra-Wide Workspace Viewport
Wedding planners work on laptops, desktop monitors, and tablets. The application workspace expands up to `max-w-[1720px]`, accommodating multi-day calendar grids, complex genealogical family trees, and 15% / 85% split canvases without horizontal cramping.

---

## 3. Visual Design System & Design Tokens

### 3.1 Dynamic CSS Theme Engine
The visual theme is powered by CSS custom properties defined in `:root` and toggled via the `data-theme` attribute on the root `<html>` element.

```css
:root, [data-theme="royal-festive"] {
  --theme-primary: #7B1113;         /* Deep Crimson / Sindoor Maroon */
  --theme-primary-hover: #630d0f;   /* Darker Maroon */
  --theme-primary-light: #FDE8E9;   /* Soft Rose Tint */
  --theme-secondary: #D97706;       /* Marigold Gold / Amber */
  --theme-secondary-light: #FEF3C7; /* Pale Gold Tint */
  --theme-accent: #B45309;          /* Deep Amber Accent */
  --theme-background: #FCFBF7;      /* Warm Ivory Canvas */
  --theme-card: #FFFFFF;            /* Pure Card Surface */
  --theme-border: #E8DFD8;          /* Warm Sand Border */
  --theme-text-main: #271E1D;       /* Deep Charcoal Charcoal */
  --theme-text-muted: #786B69;      /* Muted Warm Slate */
}
```

### 3.2 The 5 Curated Cultural Palettes

| Theme Name | Identifier | Primary / Secondary / Accent | Vibe & Ideal Event |
|---|---|---|---|
| **Royal Festive** *(Default)* | `royal-festive` | `#7B1113` / `#D97706` / `#B45309` | Traditional North Indian, Marwar/Rajput royal heritage, grand Vivah & Pheras |
| **Minimalist Slate** | `minimalist-slate` | `#1E293B` / `#4F46E5` / `#6366F1` | Contemporary Urban, Cocktail, Sangeet Afterparty, Modern Indigo luxury |
| **Pastel Luxury** | `pastel-luxury` | `#BE185D` / `#B45309` / `#65A30D` | Day weddings, Mehendi, Floral Garden ceremonies, Rose Gold & Sage |
| **Peacock Splendor** | `peacock-splendor` | `#0F766E` / `#CA8A04` / `#0D9488` | South Indian Temple weddings, Royal Peacock Teal, Emerald & Champagne Gold |
| **Sunlit Saffron** | `sunlit-saffron` | `#C2410C` / `#D97706` / `#EA580C` | Haldi, Chuda ceremony, Auspicious Terracotta, Saffron & Sandalwood |

### 3.3 Per-Wedding Custom Themes
In addition to global themes, every individual `Wedding` record supports a `customColors` object (`primary`, `secondary`, `accent`, `card`, `background`, `textMain`). When set, these values override the active CSS variables dynamically on the page, allowing couples to mirror their bespoke wedding stationery palette.

### 3.4 Elevation & Surface Hierarchy
- **Level 0 (Canvas)**: `var(--theme-background)` — subtle warm tint reducing eye fatigue during multi-hour coordination.
- **Level 1 (Card/Container)**: `var(--theme-card)` with `border border-[var(--theme-border)]` and subtle shadow `shadow-sm`.
- **Level 2 (Interactive Floating)**: Tooltips, dropdown menus, context popovers with `shadow-xl` and `z-[60]`.
- **Level 3 (Slide-in Drawers & Modals)**: Standardized slide-in right panels (`z-[50]` for Level 1, `z-[70]` for Level 2) with `backdrop-blur-sm bg-black/50`.

---

## 4. UI Architecture & Navigation Patterns

```
+-----------------------------------------------------------------------------------------+
| [Vivah Planner]  | [Switch Wedding v]  | [Dec 12-15 - Udaipur]  | [Offline *] [Theme] [*] |
+-----------------------------------------------------------------------------------------+
| [Pillar 1: Dates] [Pillars 2&3: Guests & Family] [Pillar 4: Rooms] [Pillar 5: Travel]   |
| [Pillar 6: Seating Charts] [Pillar 7: Festive E-Invites]                                |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|                      ACTIVE PILLAR WORKSPACE (max-w-[1720px])                           |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |  Sub-navigation / Filters / Search / Action Bar                                 |   |
|   +---------------------------------------------------------------------------------+   |
|   |                                                                                 |   |
|   |  Content Area (Spreadsheet Tables, Drag-and-Drop Chassis, React Flow Canvases) |   |
|   |                                                                                 |   |
|   +---------------------------------------------------------------------------------+   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
| SLIDE-IN RIGHT DRAWER (NestedScreen Level 1)                                            |
|   +---------------------------------------------------------------------------------+   |
|   | Title: Edit Guest Party                           [Esc / X]                     |   |
|   | Forms, Multi-member sub-forms, Role assignments                                 |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
```

### 4.1 Unified Top Navigation Bar
The header merges wedding context and global utilities into a single top bar:
- **Brand Title**: Vivah Planner logo with dynamic theme-colored gradient accent.
- **Wedding Switcher Dropdown**: Displays the active wedding title, with a list of all existing weddings and a prominent `+ New Wedding` button.
- **Wedding Metadata Chip**: Shows the active wedding's primary date and host city.
- **Utility Cluster**:
  - `OfflineStatusIndicator`: Real-time network listener (`navigator.onLine`) indicating offline persistence.
  - `ThemeSelectorModal`: Quick switcher across the 5 cultural themes.
  - `WeddingSettingsModal`: Gear icon opening backup/restore (JSON import/export), wedding configuration, and theme customization.
  - `InstallPwaBanner`: In-app PWA install trigger button when `beforeinstallprompt` is active.

### 4.2 Standardized `NestedScreen` Drawer Architecture
All detail views, entity creation forms, and editors are implemented via `<NestedScreen>` (`src/components/common/NestedScreen.tsx`):
- **Slide-in Right Animation**: Natural, non-jarring entry preserving workspace scroll position.
- **Configurable Widths**: `md` (28rem), `lg` (32rem), `xl` (36rem), `2xl` (42rem), `3xl` (56rem), `4xl` (64rem), `full`.
- **Keyboard Navigation**: Global `Escape` listener. When a Level 2 drawer is mounted (`data-nested-level="2"`), pressing `Escape` closes the Level 2 drawer only, preserving Level 1 state.
- **Scroll Containment**: Sticky drawer header, scrollable body (`overflow-y-auto`), and sticky footer action buttons (`Save`, `Cancel`).

### 4.3 15% Left Tray / 85% Main Canvas Workspace
Adopted in **Pillar 5 (Travel Fleet Planner)** and **Pillar 6 (Seating Charts)**:
- **Left Tray (15–20% width)**: Sticky guest selector sidebar with search bar, unseated/seated filters, side badges (*Ladkiwale* / *Ladkewale* / *Mutual*), and drag handles.
- **Right Workspace (80–85% width)**: Interactive drop canvas. In Travel, it renders vehicle chassis grids with seat slots; in Seating, it renders the `@xyflow/react` infinite floor plan canvas.

### 4.4 2-Level Tag Management System
Tags categorize dietary preferences, priority VIPs, logistics leads, and core family branches.
- **Level 1 Drawer**: Paginated catalog of all active tags, displaying name, icon, color badge, scope (`global` vs `wedding`), and usage count.
- **Level 2 Drawer**: Modal form to create or edit tags:
  - Interactive scope switch (`Wedding` vs `Global`).
  - Curated Lucide Icon Picker (Star, Heart, Shield, Crown, Sparkles, Music, Wine, etc.).
  - Color Picker with cultural presets and hex input.
- **Automatic Tag Sync**: Toggling `isCoreFamily` or assigning an operational role automatically attaches the corresponding tag to the guest via `syncMemberTags`.

---

## 5. Architectural Blueprint of the 7 Pillars

```
+---------------------------------------------------------------------------------------------------+
|                                      THE 7 FOUNDATIONAL PILLARS                                   |
+---------------------------------------------------------------------------------------------------+
|  1. Dates & Events       | 3-Step Wizard, Muhurat Timer, Week Grid, Ceremony Prefill, .ics Export |
|  2. Family Tree Graph    | Interactive Dagre/React Flow, Generation Tiers, PNG Tree Export        |
|  3. Guest List & RSVPs   | Unified Hub, Member RSVP Rows, Ceremony Tooltips, 2000+ Pagination     |
|  4. Accommodations       | Multi-Hotel Cards, Guest Name Chips, Interconnecting Rooms, Rooming List|
|  5. Travel & Logistics   | 15-85% Tray, Chassis Matrix (Sedan, SUV, Van 12/14/16), RHD/LHD, Boot  |
|  6. Seating Floor Plan   | React Flow 60fps, Royal Diwan, Round/Banquet Tables, Proximity Snapping|
|  7. Festive E-Invites    | 3-Column Studio, RGBA Watermark Engine, Unclipped PNG, WhatsApp Blast  |
+---------------------------------------------------------------------------------------------------+
```

### Pillar 1: Dates & Ceremonies Calendar
- **3-Step Creation Wizard**: Step 1 (Bride & Groom Names, Custom Side Terminology), Step 2 (Wedding Dates, City, Main Muhurat Date), Step 3 (Pre-populated ceremonies checklist).
- **Muhurat Countdown**: Auspicious real-time countdown widget showing Days, Hours, Minutes, and Seconds to the main wedding ceremony.
- **Week Calendar View & Timeline**: Visual day columns with hourly tracks, ceremonial icons, side scope filters (*Common*, *Bride Only*, *Groom Only*), and live RSVP expected headcounts.
- **Ceremony Auto-Prefill**: Selecting ceremony types (Haldi, Mehendi, Sangeet, Vivah, Reception) auto-populates standard timings, venues, dress codes, and ritual notes.
- **Calendar Export**: 1-click `.ics` standard iCalendar file download to import into Apple Calendar, Google Calendar, or Outlook.

### Pillars 2 & 3: Unified Guests & Family Hub
To eliminate disjointed family vs. guest management, Pillars 2 and 3 are merged into a single cohesive command center with 3 dedicated sub-tabs:

#### Sub-Tab A: Guest List & RSVPs
- **Spreadsheet-Style RSVP Grid**: Each family party expands into individual guest sub-rows. Every ceremony is a column with a 1-click checkbox for RSVP state (`confirmed`, `declined`, `tentative`, `invited`).
- **Rich Ceremony Tooltip Headers**: Hovering over ceremony column headers displays the ceremony date, start/end time, venue name, and dress code.
- **Per-Member Contact & Demographics**: Individual phone numbers, emails, dietary preferences (`pure_veg`, `jain`, `non_veg`, `vegan`), age categories (`adult`, `child`, `infant`, `elder`), and residential addresses.
- **Scalability for 2000+ Guests**: Client-side pagination with selectable page sizes (25, 50, 100, All), fast text search, and indexed side filters (*All*, *Bride Side*, *Groom Side*, *Mutual*).
- **Data Portability**: Full CSV export with column-mapped multi-ceremony RSVPs and 1-click CSV import.

#### Sub-Tab B: Core Family & Roles
- **Direct Guest Mapping**: Core family members are direct entries in the guest table flagged with `isCoreFamily: true` and optional `roleTitle`.
- **1-Click Crown Toggle**: Click the crown icon to instantly promote or demote a guest to/from Core Family.
- **Operational Roles Preset**: Pre-populated with authentic Indian wedding duties (*Chief Host*, *Baraat & Safa Coordinator*, *Room Key & Welcome Kit Lead*, *Pooja & Samagri Coordinator*, *Shagun Cash In-charge*, etc.).

#### Sub-Tab C: Interactive Genealogical Tree Graph
- **Node-and-Link Visualizer**: Visual family tree rendered with generation tiers (Tier 1: Grandparents, Tier 2: Parents & Uncles, Tier 3: Couple & Siblings/Cousins, Tier 4: Next Gen/Children).
- **Interactive Relation Highlighting**: Clicking any member node highlights all directly connected relationships while gracefully dimming unrelated branches.
- **Loose-Mode Linking**: Visual handle connectors to create manual cross-family or custom relations.
- **PNG Tree Export**: High-resolution image export for family keepsakes.

### Pillar 4: Accommodations & Room Allocation
- **Multi-Property Management**: Manage multiple hotels or resort wings (e.g., *The Leela Palace*, *Taj Lake Palace*, *Garden Villas*).
- **Room Category Cards**: Organized by room types (Suites, Deluxe Rooms, Lake View Villas) with adult and child capacity meters.
- **Individual Guest Name Chips**: Cards explicitly display guest name chips, age indicators, dietary flags, and side tags.
- **Interconnecting Rooms Support**: Link adjoining rooms with visual indicators for large joint families.
- **Welcome Hamper Tracking**: Checkbox tracking welcome gift and itinerary bag delivery to each room.
- **Printable Front Desk Rooming List**: Formatted print view for hotel reception desks.

### Pillar 5: Travel & Fleet Logistics
- **15–85% Drag-and-Drop Fleet Planner**: Left guest tray with Attending and Unassigned filters; right vehicle fleet grid.
- **Chassis Seating Matrices**: Accurate physical seat layouts with driver, front passenger, and row matrices:
  - 5-Seater Sedans (2 + 3)
  - 7-Seater SUVs (2 + 2 + 3)
  - 12-Seater Vans (`van_12` — 1 driver + 11 passenger rows)
  - 14-Seater Vans (`van_14` — Force Urbania / Ford Transit configurations)
  - 16-Seater Vans (`van_16` — High-capacity shuttle vans)
  - 30-Seater Deluxe Coaches
- **RHD vs. LHD Steering Switch**: Toggle between Right-Hand Drive (India, UK, Australia) and Left-Hand Drive (USA, Canada, Europe).
- **Luggage Boot Slots**: Visual rear trunk space tracking large suitcases and cabin baggage.
- **Transit Schedule Tracking**: Arrival and departure tracking with Flight/Train carrier numbers, PNRs, and terminal hubs.

### Pillar 6: React Flow Seating Charts & Proximity Snapping
- **15–85% Floor Plan Workspace**: Left draggable guest tray; right `@xyflow/react` infinite canvas.
- **Custom Indian Wedding Venue Nodes**:
  - **Royal Diwan Node**: Traditional low-seating royal lounge with 4 front-edge seat connectors (S1..S4) reserved for elders and VIPs.
  - **Round Tables**: 4, 6, 8, and 10-seater round tables with mathematically distributed radial handles and orbiting seated guest cards.
  - **Banquet Tables**: 4 to 12-seater rectangular banquet tables with top and bottom row seat handles.
  - **Landmark Nodes**: Sacred Vedic Mandap, Grand Royal Stage, Dance Floor & DJ, Royal Cocktail Bar, Feast Buffet.
- **Proximity Auto-Connect**: Dragging a guest card within 170px of a table automatically snaps them into the nearest vacant seat with a colored connector edge.
- **Manual Edge Connection**: Drag connector edges directly between seat handles and guest cards.
- **60fps React Flow Buffer**: Decoupled local `useNodesState` and `useEdgesState` buffering with custom memoization to ensure smooth 60fps panning and dragging.
- **High-Res Floor Plan Export**: 2x resolution PNG download with automatic minimap and venue bounds calculation.

### Pillar 7: Festive E-Invites & 3-Column Designer Studio
- **3-Column Inline Studio**:
  - **Column 1 (Data & Cohort)**: Cohort selector (*Whole Wedding*, *Ceremony Only*, *Initial Events*, *Party Only*), ceremony inclusion checkboxes, host family names, bespoke greetings, and Google Maps venue link.
  - **Column 2 (Visuals & Aesthetics)**: 4 layout templates (*Royal Palace*, *Mughal Floral*, *Regal Mandala*, *Contemporary Ivory*), 6 cultural palettes, custom background themes (*Damask*, *Mandala*, *Floral*, *Imperial Gradient*, *Clean Linen*), and **Independent Watermark Pattern Color with RGBA Opacity Slider**.
  - **Column 3 (Live Preview & Export)**: Real-time live card preview, unclipped full-bleed PNG export (`toPng` without scroll clipping), standalone interactive HTML export, and 1-click WhatsApp formatted message generator.

---

## 6. Offline Data Architecture & Dexie Schema

Vivah Planner uses **Dexie.js 4** wrapping the browser's IndexedDB.

### 6.1 Database Schema (`VivahPlannerDB` v1)

```typescript
export class VivahDatabase extends Dexie {
  weddings!: Table<Wedding, string>;
  events!: Table<WeddingEvent, string>;
  tags!: Table<Tag, string>;
  familyMembers!: Table<FamilyMember, string>;
  guestParties!: Table<GuestParty, string>;
  guests!: Table<Guest, string>;
  eventRsvps!: Table<EventRsvp, string>;
  hotels!: Table<Hotel, string>;
  rooms!: Table<Room, string>;
  roomAllocations!: Table<RoomAllocation, string>;
  travelItems!: Table<TravelItem, string>;
  vehicles!: Table<Vehicle, string>;
  vehicleSeats!: Table<VehicleSeat, string>;
  seatingPlans!: Table<SeatingPlan, string>;
  floorPlanElements!: Table<FloorPlanElement, string>;
  tableSeatAssignments!: Table<TableSeatAssignment, string>;
  eInvites!: Table<EInvite, string>;
  familyRelations!: Table<FamilyRelationLink, string>;
}
```

### 6.2 Primary Indexes & Query Patterns
Indexes are configured in `src/db/index.ts` to guarantee sub-millisecond query performance:
- `weddings`: `id, primaryDate, createdAt, updatedAt`
- `events`: `id, weddingId, date, orderIndex`
- `tags`: `id, scope, weddingId`
- `guestParties`: `id, weddingId, side`
- `guests`: `id, partyId, weddingId`
- `eventRsvps`: `id, weddingId, partyId, guestId, eventId`
- `rooms`: `id, weddingId, hotelId, roomNumber`
- `vehicleSeats`: `id, weddingId, vehicleId, seatIndex, guestId`
- `floorPlanElements`: `id, seatingPlanId, type`
- `tableSeatAssignments`: `id, elementId, guestId`

### 6.3 Backup & Disaster Recovery
- All tables are serialized to a single, formatted JSON structure (`vivah-planner-backup.json`) including database schema version, export timestamp, and table collections.
- Restoring from backup wraps table clearances and bulk additions inside an atomic `db.transaction('rw', ...)` block to prevent partial or corrupted states.

---

## 7. Performance & Scalability Guardrails

1. **Reactive Subscriptions (`useLiveQuery`)**: UI components subscribe to targeted Dexie queries filtered by `weddingId`. Subscriptions must always use indexed `.where()` clauses rather than scanning entire tables with `.toArray()`.
2. **React Flow 60fps Optimization**: In canvas components, state is buffered locally using `useNodesState` and `useEdgesState`. Custom memo comparators (`areTablePropsEqual`, `areGuestPropsEqual`) prevent global canvas re-renders when a single node is dragged.
3. **Table Virtualization & Pagination**: Guest lists supporting up to 2,000 attendees are partitioned via client-side pagination (25 / 50 / 100 / All) to keep DOM node counts under 300 elements at any given moment.
4. **Zero Layout Shifts**: All drawers, modals, and split-panes use explicit CSS transitions and fixed aspect containers to eliminate cumulative layout shifts (CLS).
