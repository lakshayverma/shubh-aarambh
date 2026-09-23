# Vivah Planner — AI Agent & Developer Operating Manual (AGENTS.md)

> **Audience**: AI Agents (Antigravity, coding assistants) & Software Engineers  
> **Product**: Vivah Planner (Indian Wedding Management PWA)  
> **Architecture**: 100% Client-Side Offline-First (React 18 + Vite 6 + TypeScript 5 + Tailwind CSS + Dexie.js 4 IndexedDB)  
> **Companion Document**: [`DESIGN.md`](./DESIGN.md)  

---

## 1. Core Invariants & Rules of Engagement

Every agent operating in this codebase **must strictly adhere** to the following non-negotiable architectural invariants:

### 1.1 Invariant 1: 100% Offline-First (Zero-Cloud Standard)
- **NO external APIs, backend endpoints, cloud databases (Firebase, Supabase, AWS), or telemetry.**
- All persistent data **must** reside in the client's local IndexedDB instance managed via `Dexie.js` (`src/db/`).
- External network requests are prohibited except for loading standard open fonts or local PWA assets.
- All export and sharing features (PNG generation via `html-to-image`, `.ics` calendars, backup JSON, WhatsApp link generation) must execute strictly in-memory on the client thread.

### 1.2 Invariant 2: TypeScript Strictness & Clean Builds
- **Zero build errors**. Always verify your work by running:
  ```bash
  npm run build
  ```
  (`tsc && vite build`). Any type error, missing property, or unused import that fails `tsc` will break production.
- Do not use `any` unless absolutely required for complex library internals. Prefer explicit type interfaces defined in `src/db/schema.ts`.

### 1.3 Invariant 3: Drawer Component Standard (`<NestedScreen>`)
- **NEVER** introduce ad-hoc modals with custom backdrop divs or full-page routing redirects for forms/detail views.
- **ALWAYS** use `<NestedScreen>` from `src/components/common/NestedScreen.tsx` for slide-in panels.
- Respect the nesting hierarchy:
  - `level={1}`: Primary drawers (e.g., Edit Guest Party, Add Hotel, Vehicle Details).
  - `level={2}`: Secondary/child drawers (e.g., Tag Manager opened from within Guest Edit).
- `<NestedScreen>` contains built-in `Escape` key stack handling. When `level={2}` is open, pressing `Escape` only closes the Level 2 panel, preserving the Level 1 form state.

### 1.4 Invariant 4: React Flow 60fps Buffer Standard
- In `@xyflow/react` canvases (`src/components/pillar6/SeatingChartsManager.tsx`), **NEVER** bind raw Dexie `useLiveQuery` arrays directly to `<ReactFlow nodes={...}>`. Doing so causes frame drops and sluggish dragging.
- State buffering via `useNodesState` and `useEdgesState` is mandatory. Synchronize Dexie records into local nodes only when remote/indexed data actually changes.
- Custom node components (`TableNode`, `GuestNode`) must be wrapped in `React.memo` with custom equality comparators (`areTablePropsEqual`, `areGuestPropsEqual`).

### 1.5 Invariant 5: Cultural & Bilateral Integrity
- Honor Indian wedding cultural concepts:
  - Bilateral structures: *Ladkiwale* (Bride's Side) vs. *Ladkewale* (Groom's Side) vs. *Mutual*.
  - Configurable side terminology (e.g., "Team Ananya" vs. "Team Aarav").
  - Ceremonies: Mehendi, Haldi, Sangeet, Vivah/Pheras, Reception, Roka, Cocktail.
  - Authentic operational roles (Baraat & Safa Coordinator, Room Key Lead, Shagun Cash Lead, etc.).

---

## 2. Directory Layout & Module Responsibilities

```
wedding-planner/
├── public/                     # PWA icons, manifest, favicon
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI primitives (NestedScreen, Tooltip, CustomToggle)
│   │   ├── pillar1/            # Dates & Ceremonies (EventsTimeline.tsx)
│   │   ├── pillar2/            # Family Information & Hierarchy (FamilyManager.tsx)
│   │   ├── pillar3/            # Unified Guests & RSVPs (GuestListManager.tsx)
│   │   ├── pillar4/            # Accommodations & Hotel Rooms (AccommodationsManager.tsx)
│   │   ├── pillar5/            # Travel & Vehicle Fleet (TravelManager.tsx)
│   │   ├── pillar6/            # Seating Charts & Floor Plan (SeatingChartsManager.tsx)
│   │   ├── pillar7/            # Festive E-Invites Studio (EInvitesManager.tsx)
│   │   ├── tags/               # TagBadge, TagSelector, TagManagerModal
│   │   ├── Navbar.tsx          # Unified Top Navigation Bar
│   │   ├── WeddingDashboard.tsx# Main tab orchestrator
│   │   └── ...                 # Modals (ThemeSelector, WeddingSettings, CreateWedding)
│   ├── context/
│   │   ├── ThemeContext.tsx    # Global theme provider (5 cultural palettes)
│   │   └── WeddingContext.tsx  # Active wedding context & state
│   ├── db/
│   │   ├── index.ts            # Dexie database class & store index definitions
│   │   ├── schema.ts           # Canonical TypeScript interfaces for all 7 pillars
│   │   ├── sampleData.ts       # Rich mock data generator for onboarding
│   │   └── backup.ts           # JSON database export & atomic restore
│   ├── utils/
│   │   └── tagUtils.ts         # Tag helper functions & automatic member tag syncing
│   ├── index.css               # Tailwind directives & CSS theme custom properties
│   └── App.tsx                 # Root application component
├── docs/                       # Pillar-specific architectural deep-dives
├── DESIGN.md                   # Canonical design system and product specification
├── AGENTS.md                   # This operational manual
├── LICENSE.md                  # Custom MIT License with commercial & AI clauses
└── package.json                # Dependencies and scripts
```

---

## 3. Database & State Management Playbook

### 3.1 Schema & Indexes (`src/db/index.ts`)
Vivah Planner uses Dexie.js v4. When adding or querying records:
- **Always query by indexed keys**:
  ```typescript
  // GOOD: Uses index on weddingId
  const events = await db.events.where('weddingId').equals(weddingId).sortBy('orderIndex');

  // BAD: Scans entire table into memory
  const allEvents = await db.events.toArray();
  const events = allEvents.filter(e => e.weddingId === weddingId);
  ```
- **Compound & Multi-key indexes**: Indexes are comma-separated in `VivahDatabase.version(1).stores({...})`. If you add a new filter pattern, declare an index in `src/db/index.ts`.

### 3.2 Reactive UI with `useLiveQuery`
- Wrap data fetching with `useLiveQuery` from `dexie-react-hooks`:
  ```typescript
  const guests = useLiveQuery(
    () => db.guests.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  ```
- Ensure the dependency array includes all relevant reactive state variables (e.g., `wedding.id`, `activeEventId`).
- Provide default fallbacks (`guests ?? []`) while queries resolve asynchronously.

### 3.3 Atomic Bulk Transactions
When modifying multiple related tables or multiple records in a loop, **always wrap the operations in a Dexie transaction**:
```typescript
await db.transaction('rw', [db.guests, db.eventRsvps, db.tags], async () => {
  await db.guests.bulkPut(updatedGuests);
  await db.eventRsvps.bulkPut(updatedRsvps);
});
```
This guarantees atomicity and prevents UI flickering caused by multiple intermediate reactive triggers.

---

## 4. Performance & Scalability Playbook

### 4.1 React Flow Seating Canvas Optimization (`Pillar 6`)
The seating chart canvas (`SeatingChartsManager.tsx`) supports interactive floor plans with dozens of tables and hundreds of guest nodes. To guarantee 60fps performance:
1. **Decouple React Flow State from Dexie**:
   - Maintain canvas elements in `nodes` (`useNodesState`) and `edges` (`useEdgesState`).
   - On drag or move (`onNodesChange`), update the local `nodes` array immediately for 60fps physics.
   - Debounce writes to Dexie (`db.floorPlanElements.update(...)` or `db.tableSeatAssignments.put(...)`) until the drag ends (`onNodeDragStop`).
2. **Memoize Custom Nodes**:
   - `TableNode` and `GuestNode` must use `React.memo` with custom equality comparators:
   ```typescript
   export const TableNode = React.memo(TableNodeComponent, areTablePropsEqual);
   ```
   - Only re-render a node if its own coordinates, selection state, label, capacity, or assigned seat count changes.
3. **Geometry-Aware Seating Offsets**:
   - Round tables: Position seats radially along the circumference using trigonometric offsets:
     `x = radius * cos(theta)`, `y = radius * sin(theta)`.
   - Royal Diwan: 4 front-edge seat handles (S1..S4) with distinct handle IDs.
   - Banquet tables: Distribute seats along top and bottom edges.
4. **Proximity Snapping**:
   - `PROXIMITY_SNAP_DISTANCE` is tuned to `170px`.
   - Calculate distance between dragged guest node and table centers using Euclidean distance `hypot(dx, dy)`.

### 4.2 Guest List Scalability for 2000+ Guests (`Pillar 3`)
- **Client-Side Pagination**:
  - Keep `pageSize` controls (25, 50, 100, All). Default to 25 or 50.
  - Never render 2,000 table rows into the DOM simultaneously.
- **Search & Filters**:
  - Memoize search filters using `useMemo`:
  ```typescript
  const filteredParties = useMemo(() => {
    if (!searchTerm) return parties;
    const term = searchTerm.toLowerCase();
    return parties.filter(p => p.partyName.toLowerCase().includes(term));
  }, [parties, searchTerm]);
  ```
- **Core Family & Roles**:
  - Core Family members are direct entries in `Guest` (`isCoreFamily: true`, `roleTitle: string`).
  - Always call `syncMemberTags(guest, tags, weddingId)` when changing core status or role titles to keep tag associations synchronized.

---

## 5. Styling, Theming & UI Conventions

### 5.1 Dynamic CSS Custom Properties
Always use the semantic CSS variable classes or direct Tailwind classes:
- Background: `bg-theme-background`
- Surface/Card: `bg-theme-card`
- Borders: `border-theme-border`
- Text: `text-theme-text-main` (primary text), `text-theme-text-muted` (secondary text)
- Brand Colors: `bg-theme-primary`, `text-theme-primary`, `hover:bg-theme-primary-hover`, `bg-theme-primary-light`
- Accents: `bg-theme-secondary`, `text-theme-secondary`, `bg-theme-accent`

### 5.2 Responsive Workspace Layout
- Top-level workspace containers must use `max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8`.
- In split views (Pillars 5 & 6), use the 15%–85% flex layout:
  - Left tray: `w-72 lg:w-80 shrink-0` (sticky or scrollable).
  - Main canvas: `flex-1 min-w-0`.

### 5.3 Iconography
- Use **Lucide React** (`lucide-react`) exclusively.
- Size icons consistently: `w-4 h-4` for inline badges/buttons, `w-5 h-5` for action bars, `w-6 h-6` for headers.

---

## 6. Development & Verification Workflows

### 6.1 Common Maintenance Tasks

#### Task A: Adding a New Field to an Existing Entity
1. Update interface in `src/db/schema.ts` (e.g., add `dietaryNotes?: string` to `Guest`).
2. If the field needs indexing, update `src/db/index.ts` stores definition.
3. Update forms in the corresponding pillar component (e.g., `GuestListManager.tsx`).
4. Update `src/db/sampleData.ts` if sample data should illustrate the new field.
5. Verify build: `npm run build`.

#### Task B: Adding a New Vehicle Chassis (`Pillar 5`)
1. Add new category to `Vehicle['category']` in `src/db/schema.ts`.
2. Add chassis layout configuration in `src/components/pillar5/TravelManager.tsx` defining row counts, seat roles (`driver`, `co_driver`, `passenger`), and visual grid slots.
3. Verify RHD/LHD steering toggle compatibility.

#### Task C: Adding a New Ceremony Preset (`Pillar 1`)
1. Update `CEREMONY_PRESETS` in `src/components/pillar1/EventsTimeline.tsx`.
2. Provide default timings, dress code recommendations, and ritual notes.

### 6.2 Pre-Commit Verification Checklist
Before submitting changes or marking a task complete:
- [ ] Run `npm run build` — confirm TypeScript compiler passes with 0 errors and Vite bundles successfully.
- [ ] Verify that no cloud dependencies or external network calls were added.
- [ ] Confirm drawers use `<NestedScreen>` with proper `level={1}` or `level={2}`.
- [ ] Check responsive layout on standard laptops and large displays (`max-w-[1720px]`).
- [ ] Verify that Dexie queries utilize indexed `.where()` filters.
- [ ] Commit logically with descriptive commit messages following Conventional Commits format (`feat:`, `fix:`, `perf:`, `docs:`, `refactor:`).
