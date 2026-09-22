# Vivah Planner — Indian Wedding Management PWA

A **100% offline-first Progressive Web App (PWA)** built with **React 18, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB)**. Designed specifically for Indian Wedding Planners to manage multi-day, multi-ceremony weddings across **7 foundational management pillars** with zero external cloud dependencies.

---

## 🚀 Key Highlights & Philosophy

- **100% Client-Side & Zero Cloud Overhead**: All data is stored locally in the browser's IndexedDB via `Dexie.js`. No backend servers, no subscriptions, and no API keys required.
- **Offline-First PWA**: Configured with `vite-plugin-pwa` and Workbox for instant offline asset caching. Features an in-app installation banner and a live online/offline network indicator.
- **Data Portability & Backups**: Built-in JSON export (`vivah-planner-backup.json`) and 1-click restore to effortlessly migrate data between devices and preserve backups.
- **5 Cultural Palettes & Per-Wedding Custom Themes**: Instant global switching among 5 curated palettes, plus an in-depth **Custom Theme & Color Picker per wedding** (custom Primary, Secondary, Accent, and Background colors injected directly into CSS variables).
- **Configurable Pair Terminology**: Full customization of side names (e.g. *Team Ananya* / *Team Aarav* or *Ladkiwale* / *Ladkewale*) reflected universally across all 7 pillars.
- **Ultra-Wide Workspace Viewport**: Optimized layout spanning `max-w-[1720px]` providing ample room for multi-day calendar grids, complex family trees, and 15–85 split vehicle seating.
- **Multi-Wedding Coordinator**: Manage multiple client weddings from a unified dashboard, switch active events on the fly, or load the pre-configured *"Aarav & Ananya's Royal Jaipur Wedding"* demo with a single click.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Framework** | [React 18](https://react.dev/) | Component architecture with functional hooks |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type-safe entities, models, and interfaces |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Instant HMR and optimized production bundling |
| **Local Database** | [Dexie.js 4](https://dexie.org/) | Type-safe wrapper for IndexedDB with `dexie-react-hooks` (`useLiveQuery`) |
| **PWA & Offline** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service worker generation and Workbox caching |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with dynamic CSS theme variables |
| **Graph Visualizer** | [@xyflow/react](https://reactflow.dev/) | Interactive node-and-link genealogical family tree graph |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern, clean vector iconography |
| **Image Export** | [html-to-image](https://github.com/bubkoo/html-to-image) | High-res PNG card rendering for E-Invites |
| **Celebrations** | [canvas-confetti](https://github.com/catdad/canvas-confetti) | Visual celebration on wedding creation |

---

## 🏛️ The 7 Management Pillars

Detailed architectural specifications and feature breakdowns for each pillar are documented in the [`docs/`](./docs) folder:

### 1. [Dates & Ceremonies Calendar](./docs/pillar-1-dates-and-events/README.md)
- Guided 3-step Indian wedding creation wizard (The Couple, Dates & City, Pre-populated Ceremonies: Mehendi, Sangeet, Haldi, Vivah, Reception).
- Real-time Muhurat Countdown Timer (Days, Hours, Minutes, Seconds).
- **Calendar Week View** (default) with day columns, time slots, side filter, ritual icons (☀️, 🎨, 🎵, 👑, 🥂), and **Live RSVP Expected Headcounts**.
- **Event Form Ceremony Auto-Prefill**: Selecting ceremony types automatically fills in standard timings, venues, dress codes, and ritual notes with 1-click replenish.
- Chronological timeline with dress codes and 1-click `.ics` calendar export.

### 2. [Family Hierarchy & Merged Relations](./docs/pillar-2-family-information/README.md)
- **Merged with Guest List**: Relatives from Guest List with kinship annotations automatically join the genealogical directory and tree.
- Dual-view interface: Structured cards split by customizable pair terms (*Team Ananya* vs *Team Aarav*) across 4 generation tiers, plus an interactive genealogical tree graph powered by `@xyflow/react`.
- **Interactive Canvas Drag-and-Drop Linking**: Connect any two relatives directly on the canvas by dragging between circular handles on node borders (`ConnectionMode.Loose`) with automatic relation detection, quick prompt, and click-to-edit/delete on lines.
- Dynamic Groom/Bride wing separation, automated generational lineage edges, central animated Vivah union bond, and color-coded kinship badges.
- Operational role assignments, direct WhatsApp/call shortcuts, and custom tag engine with global promotion support.

### 3. [Guest List & Flexible Multi-Event RSVP Matrix](./docs/pillar-3-guest-list/README.md)
- **Tabular Member Editing**: Manage individual party members in a spreadsheet-style table with primary contact selector, age tiers (**Adult, Elder, Child, Infant**), and **Indian Kinship Relation Guides** to Bride and Groom.
- **Granular Party vs. Individual RSVP Matrix**: Toggle attendance for the whole family party or fine-tune individual members with live `X/Y attending` counters.
- **Universal Downstream Attendance Sync**: Synchronizes RSVP confirmation states into:
  - Pillar 1 Live Expected Ceremony Headcounts.
  - Pillar 4 Room Allocation guest picker (highlights attending members).
  - Pillar 5 Vehicle Seating left tray (attending filter & badges).
  - Pillar 6 Table Seating (attending guests only filter).
- Dietary preference counters (Pure Veg, Jain, Non-Veg, Vegan) and special assistance notes.
- CSV Import & Export for spreadsheet synchronization.

### 4. [Accommodations & Hotel Room Grid](./docs/pillar-4-accommodations/README.md)
- Multi-hotel property management.
- Visual room grid categorized by category (Suites, Villas, Deluxe Lake View) with occupancy badges.
- Guest room allocation drawer with RSVP-attending badges and selective member allocation, interconnecting room markers, and welcome hamper delivery tracking.
- Printable Front Desk Rooming List for hotel check-in desks.

### 5. [Travel & Vehicle Seating](./docs/pillar-5-travel-arrangements/README.md)
- **15–85% Drag-and-Drop Seating**: Left sticky guest tray with search and filter (including **Attending Only** filter & RSVP badges); right vehicle fleet grid with interactive drop zones.
- **RHD vs LHD Steering Toggle**: Supports Right-Hand Drive (India, UK, Australia) and Left-Hand Drive (USA, Canada) steering configurations with 1-click on-the-fly flip.
- **Luggage Boot Capacity**: Visual rear trunk space tracking suitcases and check-in baggage.
- **Country Model Presets Dropdown**: Popular models grouped by India (Innova, Ertiga, Fortuner), USA (Escalade, Suburban), Australia (Prado, Carnival), Canada, and UK.
- Chronological flight and train arrival tracker with airport pickup batching.

### 6. [Seating Charts & 2D Floor Plan](./docs/pillar-6-seating-charts/README.md)
- Function-specific 2D floor plans (Sangeet, Reception, Pheras) with 10px snap-to-grid canvas.
- Draggable venue elements: Main Stage, Sacred Mandap, LED Dance Floor, Round Banquet Tables (8/10), Rectangular Tables, and Royal Couple Diwans.
- Table seat assignment drawer with ceremony-attending guest filter and side color coding.

### 7. [Festive E-Invites & 3-Column Designer Studio](./docs/pillar-7-e-invites/README.md)
- **3-Column Inline Designer Studio** (replaces modal):
  - *Column 1 (Data & Cohort)*: 4 Cohort types &times; adjacent ceremony checkboxes with auto-prefill, greetings, host families, custom message, and maps URL.
  - *Column 2 (Visuals & Aesthetics)*: 4 design templates, 6 cultural color palettes, granular color pickers, and repeating background watermark patterns.
  - *Column 3 (Live Preview & Export)*: Real-time live card preview, unclipped full-height high-res PNG download (no scroll clipping), standalone interactive HTML export, and 1-click WhatsApp message generator.
- **High-Contrast Watermarks**: Repeating patterns (Damask, Mandala, Floral Trellis, Imperial Aura, Clean Linen) rendered directly on the invitation card.

---

## 🏁 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (or `v24+`)
- npm `v9+` or `v10+`

### Installation & Development
```bash
# Clone repository
git clone https://github.com/your-username/wedding-planner.git
cd wedding-planner

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📱 PWA Installation Instructions

1. Open the app in any modern browser (Chrome, Edge, Safari, Brave).
2. Click the **"Install PWA"** button in the top banner or select **"Install App"** from your browser's address bar / menu.
3. Vivah Planner will install as a standalone desktop or mobile application with full offline support.

---

## 📄 License
MIT License. Built for wedding planners and families celebrating grand Indian weddings.
