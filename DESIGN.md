# Vivah Planner — System Architecture & Design Specification

> **Version**: 1.1.0  
> **Status**: Production Release  
> **Application Type**: 100% Client-Side Offline-First Progressive Web App (PWA)  
> **Target Audience**: Professional Wedding Planners, Couple Families (*Ladkiwale* & *Ladkewale*), Hospitality Coordinators  
> **Companion Document**: [`AGENTS.md`](./AGENTS.md)  

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
  --theme-text-main: #271E1D;       /* Deep Charcoal */
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

## 4. Component Structure & Architectural Hierarchy

Vivah Planner follows a strictly tiered, modular component architecture that isolates concerns, prevents cross-pillar coupling, and guarantees maintainability across large feature expansions.

```
src/
├── components/
│   ├── common/                  # Tier 1: Agnostic UI Primitives (NestedScreen, Tooltip, CustomToggle)
│   ├── tags/                    # Tier 2: Cross-Cutting Domain Utilities (TagBadge, TagSelector, TagManager)
│   ├── pillar1/ ... pillar7/    # Tier 3: Isolated Domain Pillar Controllers (Events, Family, Guests, Rooms, Fleet, Seating, Invites)
│   ├── Navbar.tsx               # Tier 4: Global App Shell & Navigation
│   ├── WeddingDashboard.tsx     # Tier 4: Primary Tab Orchestrator & View Switcher
│   └── WeddingCommandCenter.tsx # Tier 4: Cross-Pillar High-Level KPI Summary
├── context/                     # Shared React State (ThemeContext, WeddingContext)
├── db/                          # Offline Storage Layer (Dexie.js schema, indexes, transactions, backup)
└── utils/                       # Pure Utility Functions (tagUtils, formatting, geometry)
```

### 4.1 Component Tiers and Contracts

#### Tier 1: Agnostic UI Primitives (`src/components/common/`)
- Reusable, accessible UI components with zero wedding-specific business logic.
- **`<NestedScreen>`**: Universal slide-in drawer and modal engine with stacked Esc handling.
- **`<Tooltip>`**: Portal-based, z-index resilient contextual help bubble with auto-positioning.
- **`<CustomToggle>`**: Accessible switch component for bilateral options (e.g. RHD vs LHD, Attending vs Unseated).
- **`<CustomSelect>`**: Styled dropdown compatible with dynamic CSS variables.

#### Tier 2: Cross-Cutting Domain Elements (`src/components/tags/`)
- Domain-aware components used across multiple pillars.
- **`<TagBadge>`**: Renders tags with custom Lucide vector icons, color chips, and dismiss buttons.
- **`<TagSelector>`**: Multi-select dropdown filtering by Wedding vs Global scope.
- **`<TagManagerModal>`**: 2-level drawer for tag cataloging and authoring.

#### Tier 3: Domain Pillar Controllers (`src/components/pillar[1-7]/`)
- Each pillar lives in its own directory with dedicated subcomponents and types.
- Pillar managers receive `wedding: Wedding` as their primary prop and read/write to Dexie independently via indexed queries.
- Pillar managers never import other pillar components directly; cross-cutting operations are bridged via the database schema and shared tags.

#### Tier 4: Global Shell & Orchestration
- **`<Navbar>`**: Unified header housing wedding context, switcher dropdown, and global modals.
- **`<WeddingDashboard>`**: Orchestrates active pillar selection, tab transitions, and responsive containers.
- **`<WeddingContext>`**: Supplies the active `wedding` entity, wedding switcher dispatcher, and reload triggers.

---

## 5. Drawers and Nested Screens Design Paradigm

```
+-----------------------------------------------------------------------------------------------+
| ACTIVE WORKSPACE (Guest List Spreadsheet / Seating Canvas)                                     |
|                                                                                               |
|   +------------------------------------+  +-----------------------------------------------+   |
|   | Guest Table / Vehicle Fleet Grid   |  | LEVEL 1 DRAWER (e.g., Edit Guest Party)        |   |
|   |                                    |  | Width: xl (36rem) | z-index: 50               |   |
|   | Background dimmed (black/50)       |  |                                               |   |
|   | Remains fully mounted              |  |   [Open Tag Manager button]                   |   |
|   | Preserves scroll position          |  |   |                                           |   |
|   |                                    |  |   v                                           |   |
|   |                                    |  | +-------------------------------------------+ |   |
|   |                                    |  | | LEVEL 2 DRAWER (e.g., Tag Manager Modal)  | |   |
|   |                                    |  | | Width: lg (32rem) | z-index: 70           | |   |
|   |                                    |  | | Background dimmed (black/60)              | |   |
|   |                                    |  | | Esc -> closes Level 2 only                | |   |
|   |                                    |  | | Level 1 form state 100% preserved         | |   |
|   +------------------------------------+  +-----------------------------------------------+   |
+-----------------------------------------------------------------------------------------------+
```

### 5.1 The Architectural Philosophy: Why Drawers over Modals or Routes?
Indian wedding planning involves dense, interconnected operations. A user editing a guest party may realize that an uncle needs a new "VIP Airport Escort" tag, or that a member needs specific dietary notes.

- **Why Not Full-Page Routing?**
  Full-page redirects dismantle ephemeral form state, wipe out active filters or scroll positions in large 2,000-row guest tables, and break user flow.
- **Why Not Centered Pop-Up Modals?**
  Centered modal dialogs feel claustrophobic, cut off tall multi-member forms on small screens, and create clumsy multi-layer modal stacking (where modals overlap and fight for z-indexes).
- **The Drawer Advantage**:
  Slide-in right drawers (`<NestedScreen>`) keep the primary workspace visible in the dimmed periphery, providing spatial grounding. Drawers provide full-height vertical scrolling (`h-screen overflow-y-auto`) ideal for detailed multi-field forms, while maintaining dedicated sticky headers and footers.

### 5.2 Two-Tier Nesting Hierarchy (`level={1}` and `level={2}`)
`<NestedScreen>` provides native two-level stacking:
- **`level={1}` (Primary Drawers)**:
  - Invoked directly from workspaces (e.g., *Edit Guest Party*, *Add Hotel*, *Vehicle Details*, *E-Invite Customizer*).
  - Backing overlay: `bg-black/50 backdrop-blur-sm`, `z-[50]`.
- **`level={2}` (Secondary / Child Drawers)**:
  - Invoked from *inside* a Level 1 drawer (e.g., *Tag Manager* opened from Guest Edit, *Add New Custom Tag* opened from Tag Manager).
  - Backing overlay: `bg-black/60 backdrop-blur-sm`, `z-[70]`.

### 5.3 Coordinated `Escape` Key Stack Management
To eliminate accidental form closure when working across nested drawers:
1. Every `<NestedScreen>` mounts a global `keydown` listener.
2. When `Escape` is pressed, a `level={1}` drawer inspects the DOM for `[data-nested-level="2"]`.
3. If an active Level 2 drawer exists, the Level 1 listener **silently yields** (`return`), allowing the Level 2 drawer to handle the event and close itself.
4. Only when no Level 2 drawer is active does pressing `Escape` dismiss the Level 1 drawer.
5. Level 1 draft inputs remain entirely intact while Level 2 operations occur.

### 5.4 Anatomical Specification of `<NestedScreen>`
- **Header**: Sticky bar with font-serif title, contextual subtitle, and prominent close `X` button.
- **Body**: Scrollable content container (`flex-1 overflow-y-auto p-6 space-y-6`) containing form fields, member cards, and tag selectors.
- **Footer**: Sticky action bar (`px-6 py-4 border-t bg-stone-50/80`) housing primary actions (`Save`, `Update`, `Export`) and secondary actions (`Cancel`, `Delete`).
- **Responsive Width Presets**:
  - `md` (`max-w-md` / 28rem) — simple single-field prompts.
  - `lg` (`max-w-lg` / 32rem) — tag creation, single-guest roles.
  - `xl` (`max-w-xl` / 36rem) — standard entity editors (hotels, vehicles, event details).
  - `2xl` (`max-w-2xl` / 42rem) — multi-member guest parties, chassis seat mappings.
  - `3xl` (`max-w-4xl` / 56rem) — wide preview tools and import wizards.
  - `4xl` (`max-w-5xl` / 64rem) — complex genealogical tree authoring.

---

## 6. UI-Heavy Spatial Design Flow via React Flow (`@xyflow/react`)

```
+-----------------------------------------------------------------------------------------------+
| SEATING CHARTS & FLOOR PLAN STUDIO (Pillar 6)                                                  |
+-----------------------------------------------------------------------------------------------+
| 15% GUEST TRAY (Sticky) | 85% REACT FLOW CANVAS (Infinite Pan & Zoom)                         |
|                         |                                                                     |
| [Search Guests...]      |       [Stage Landmark]                                              |
| Filters: Unseated/Side  |             ▲                                                       |
|                         |             │                                                       |
| +---------------------+ |       [Vedic Mandap]                                                |
| | Guest: Rajesh Verma | |                                                                     |
| | Side: Ladkewale     | |    +------------------+             (Radial Orbit Seat Handles)     |
| | [Drag Handle :::]   | |    | Royal Diwan      |                  ○  ○  ○                    |
| +---------------------+ |    | [S1] [S2][S3][S4]|               ○  +-------+  ○               |
|                         |    +------------------+               ○  |Table 1|  ○ (Round 8)     |
| Dragging near table     |         │        │                    ○  +-------+  ○               |
| triggers proximity snap |         ▼        ▼                       ○  ○  ○                    |
| (< 170px auto-connect)  |    [Guest 1]  [Guest 2]                                             |
|                         |                                                                     |
|                         | [MiniMap]                      [Controls: Zoom +/- | Fit | 2x PNG]  |
+-----------------------------------------------------------------------------------------------+
```

### 6.1 The Spatial Design Philosophy
Indian wedding planning is fundamentally **spatial and topological**, not merely tabular. Banquet layouts, family seating hierarchies, sacred mandap orientations, and genealogical kinship cannot be adequately expressed through standard spreadsheets.

Vivah Planner leverages `@xyflow/react` to provide two high-performance spatial canvases:
1. **Pillar 2 (Genealogical Family Tree)**: Node-and-link generational hierarchy with kinship edges and interactive branch isolation.
2. **Pillar 6 (Seating Charts & Floor Plan Studio)**: Physical venue floor planner with proximity snapping, custom venue furniture nodes, and seat assignment edges.

### 6.2 The 15%–85% Spatial Workspace Pattern
Both spatial studios utilize the 15% / 85% split layout:
- **Left Tray (15–20% width)**: Sticky guest selector sidebar with search bar, unseated/seated filters, side badges (*Ladkiwale* / *Ladkewale* / *Mutual*), and drag handles.
- **Right Workspace (80–85% width)**: Interactive drop canvas rendering infinite pan/zoom grids, dynamic venue nodes, and animated connection edges.

### 6.3 Custom Venue Topologies & Node Geometries

#### 1. The Royal Diwan Node (`royal_diwan` / `lounge_sofa`)
Traditional low-seating royal lounge reserved for immediate family elders and VIPs.
- Features **4 dedicated front-edge handle connectors (`S1`, `S2`, `S3`, `S4`)** distributed along the bottom margin.
- Styled with regal crimson and gold border accents to visually distinguish VIP seating from standard tables.

#### 2. Round Tables (`round_table` — 4, 6, 8, 10-seaters)
- Designed with **Trigonometric Radial Seat Placement**:
  Seat coordinates orbit the table perimeter mathematically:
  $$\theta_i = \frac{2\pi \cdot i}{N}, \quad x_i = r \cdot \cos(\theta_i), \quad y_i = r \cdot \sin(\theta_i)$$
- Seat handles are exposed radially along the circumference, allowing seated guest badges to orbit the table without visual collisions.

#### 3. Banquet Tables (`rect_table` — 4 to 12-seaters)
- Rectangular elongated tables with seats distributed along the top and bottom edges.
- Supports head-of-table VIP placements and banquet dining rows.

#### 4. Ceremonial Landmark Nodes
- **Sacred Vedic Mandap**: Sacred fire altar for Pheras (`bg-gradient-to-br from-amber-600 via-rose-600 to-amber-700` with Flame icon).
- **Grand Royal Stage**: Elevated couple reception stage with floral backdrop styling.
- **Dance Floor & DJ**: High-energy dance zone for Sangeet night.
- **Royal Cocktail Bar & Feast Buffet**: Key hospitality nodes for guest circulation.

### 6.4 High-Performance 60fps Buffering Engine
Interactive floor plans may contain 50+ tables and 300+ guest nodes. Direct binding of reactive database queries to React Flow causes frame drops and sluggish dragging. Vivah Planner solves this with a **three-tier performance architecture**:

#### Tier A: Decoupling Dexie from the Render Loop
- Canvas nodes and edges are maintained exclusively in local React state via `useNodesState` and `useEdgesState`.
- Dragging, panning, and moving execute at native 60fps in memory without disk I/O.
- Dexie persistence is debounced and committed **only on drag completion** (`onNodeDragStop` and `onSelectionDragStop`).

#### Tier B: Custom Node Memoization Comparators
Custom nodes (`TableNode` and `GuestNode`) are wrapped in `React.memo` with custom equality comparators (`areTablePropsEqual`, `areGuestPropsEqual`):
- A table node re-renders **only** if its own coordinates, selection state, label, capacity, or assigned seat count changes.
- Unaffected tables and guests skip re-rendering entirely during active drag operations.

#### Tier C: Proximity Snapping Engine
- Dragging a guest card within `170px` (`PROXIMITY_SNAP_DISTANCE`) of a table automatically calculates Euclidean distances:
  $$d = \sqrt{(x_{\text{guest}} - x_{\text{table}})^2 + (y_{\text{guest}} - y_{\text{table}})^2}$$
- On drop, the engine automatically finds the lowest available seat index and generates an animated connection edge, committing the seat assignment to Dexie atomically.

### 6.5 High-Resolution 2x PNG Canvas Export
Planners need physical printouts for venue staff and decorators. Vivah Planner implements an in-memory export pipeline:
1. Calculates canvas boundary rectangles across all floor plan elements using `getNodesBounds`.
2. Temporarily hides canvas control panels and minimap.
3. Renders the viewport to high-resolution PNG using `html-to-image` at `pixelRatio: 2`.
4. Triggers an instant in-memory browser download (`[wedding-title]-seating-plan.png`) with zero cloud processing.

---

## 7. Architectural Blueprint of the 7 Pillars

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
- **Custom Indian Wedding Venue Nodes**: Royal Diwan, Round Tables (4–10 seaters), Banquet Tables (4–12 seaters), Sacred Mandap, Stage, Dance Floor, Bar, Buffet.
- **Proximity Auto-Connect**: Dragging a guest card within 170px of a table automatically snaps them into the nearest vacant seat with a colored connector edge.
- **Manual Edge Connection**: Drag connector edges directly between seat handles and guest cards.
- **60fps React Flow Buffer**: Decoupled local `useNodesState` and `useEdgesState` buffering with custom memoization.
- **High-Res Floor Plan Export**: 2x resolution PNG download with automatic minimap and venue bounds calculation.

### Pillar 7: Festive E-Invites & 3-Column Designer Studio
- **3-Column Inline Studio**:
  - **Column 1 (Data & Cohort)**: Cohort selector (*Whole Wedding*, *Ceremony Only*, *Initial Events*, *Party Only*), ceremony inclusion checkboxes, host family names, bespoke greetings, and Google Maps venue link.
  - **Column 2 (Visuals & Aesthetics)**: 4 layout templates (*Royal Palace*, *Mughal Floral*, *Regal Mandala*, *Contemporary Ivory*), 6 cultural palettes, custom background themes (*Damask*, *Mandala*, *Floral*, *Imperial Gradient*, *Clean Linen*), and **Independent Watermark Pattern Color with RGBA Opacity Slider**.
  - **Column 3 (Live Preview & Export)**: Real-time live card preview, unclipped full-bleed PNG export (`toPng` without scroll clipping), standalone interactive HTML export, and 1-click WhatsApp formatted message generator.

---

## 8. Offline Data Architecture & Dexie Schema

Vivah Planner uses **Dexie.js 4** wrapping the browser's IndexedDB.

### 8.1 Database Schema (`VivahPlannerDB` v1)

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

### 8.2 Primary Indexes & Query Patterns
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

### 8.3 Backup & Disaster Recovery
- All tables are serialized to a single, formatted JSON structure (`vivah-planner-backup.json`) including database schema version, export timestamp, and table collections.
- Restoring from backup wraps table clearances and bulk additions inside an atomic `db.transaction('rw', ...)` block to prevent partial or corrupted states.

---

## 9. Performance & Scalability Guardrails

1. **Reactive Subscriptions (`useLiveQuery`)**: UI components subscribe to targeted Dexie queries filtered by `weddingId`. Subscriptions must always use indexed `.where()` clauses rather than scanning entire tables with `.toArray()`.
2. **React Flow 60fps Optimization**: In canvas components, state is buffered locally using `useNodesState` and `useEdgesState`. Custom memo comparators (`areTablePropsEqual`, `areGuestPropsEqual`) prevent global canvas re-renders when a single node is dragged.
3. **Table Virtualization & Pagination**: Guest lists supporting up to 2,000 attendees are partitioned via client-side pagination (25 / 50 / 100 / All) to keep DOM node counts under 300 elements at any given moment.
4. **Zero Layout Shifts**: All drawers, modals, and split-panes use explicit CSS transitions and fixed aspect containers to eliminate cumulative layout shifts (CLS).
