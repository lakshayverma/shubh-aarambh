# Vivah Planner — Indian Wedding Management PWA

A **100% offline-first Progressive Web App (PWA)** built with **React 18, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB)**. Designed specifically for Indian Wedding Planners to manage multi-day, multi-ceremony weddings across **7 foundational management pillars** with zero external cloud dependencies.

---

## 🚀 Key Highlights & Philosophy

- **Unified Navigation & Merged Header**: Merged wedding theme banner and app header into a sleek unified top bar. Switch weddings from the switcher dropdown with "+ New Wedding", and access app theme, offline sync status, and backup/restore from the Settings Gear dropdown.
- **Unified Guests & Family Hub**: Single unified workspace integrating Family Hierarchy, Genealogical Tree Graph, and Guest List & RSVPs into one cohesive module.
- **NestedScreen Slide-in Right Drawers**: Standardized slide-in right drawers across all pillars featuring global `Esc` key handling, backdrop dismiss, and 2-level nested drawer support.
- **Per-Member Contact & Address**: Individual party members support separate mobile numbers, emails, and residential addresses even under the same family party.
- **Spreadsheet-Style Individual RSVP Rows & Ceremony Tooltips**: Fast individual RSVP toggling with ceremony column headers featuring rich tooltips (date, timings, venue).
- **Interactive Genealogical Tree Graph**: Drag nodes freely on canvas, highlight connected relations on click with automatic dimming of unrelated branches, and 1-click **Export Family Tree as PNG**.
- **2-Level Tag Management Drawer**: Browse existing tags in a structured paginated list; open a 2nd-level drawer to create or edit tags with interactive "Wedding" vs "Global" scope switch, distinct Lucide icon picker, and custom color picker.
- **15–85% Drag-and-Drop Travel Fleet Planner**: 15% Left Guest Tray with Attending/Seated filters; 85% Fleet Grid supporting RHD/LHD steering, luggage boot slots, and complete seating chassis matrices for 5-seater Sedans, 7-seater SUVs, 12-seater Vans (`van_12`), 14-seater Vans (`van_14`), and 16-seater Vans (`van_16`).
- **15–85% Drag-and-Drop 2D Seating Charts**: Left Guest Tray with droppable assignment onto tables or specific seat pips around round and banquet tables.
- **Festive E-Invites with RGBA Watermark Engine**: 3-Column studio featuring live card preview, unclipped high-res PNG export, and an independent Watermark Pattern Color picker with RGBA opacity slider.
- **100% Client-Side & Zero Cloud Overhead**: All data is stored locally in the browser's IndexedDB via `Dexie.js`. No backend servers, no subscriptions, and no API keys required.
- **Offline-First PWA**: Configured with `vite-plugin-pwa` and Workbox for instant offline asset caching. Features an in-app installation banner and a live online/offline network indicator.
- **Data Portability & Backups**: Built-in JSON export (`vivah-planner-backup.json`) and 1-click restore to effortlessly migrate data between devices and preserve backups.
- **5 Cultural Palettes & Per-Wedding Custom Themes**: Instant global switching among 5 curated palettes, plus an in-depth **Custom Theme & Color Picker per wedding** (custom Primary, Secondary, Accent, and Background colors injected directly into CSS variables).
- **Configurable Pair Terminology**: Full customization of side names (e.g. *Team Ananya* / *Team Aarav* or *Ladkiwale* / *Ladkewale*) reflected universally across all 7 pillars.
- **Ultra-Wide Workspace Viewport**: Optimized layout spanning `max-w-[1720px]` providing ample room for multi-day calendar grids, complex family trees, and 15–85 split seating.

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

### 2 & 3. [Unified Guests & Family Hub](./docs/pillar-3-guest-list/README.md)
- **Combined Hub**: Integrated directory linking family hierarchy, generation tiers, operational roles, and guest lists into one seamless workspace.
- **Spreadsheet-Style Individual RSVP Table**: Every family member rendered on their own sub-row with individual multi-ceremony RSVP checkboxes for fast bulk toggling.
- **Multi-Event Column Tooltips**: Hover over ceremony headers to view full Ceremony Name, Date, Time, and Venue details.
- **Per-Member Contact & Address**: Individual phone numbers, emails, and distinct addresses per guest.
- **Interactive Genealogical Tree Graph**: Drag nodes freely, click any node to highlight all connected family relations while dimming others, loose-mode manual linking handles, and 1-click **Export Tree as PNG**.

### 4. [Accommodations & Hotel Room Grid](./docs/pillar-4-accommodations/README.md)
- Multi-hotel property management with room category cards (Suites, Villas, Deluxe Lake View).
- **Individual Guest Name Chips**: Cards explicitly display names and demographic markers of every allocated individual.
- Standardized `NestedScreen` slide-in right drawers for hotel, room, and guest allocations with global `Esc` support.
- Welcome hamper delivery tracking and Printable Front Desk Rooming List for check-in desks.

### 5. [Travel & Vehicle Seating](./docs/pillar-5-travel-arrangements/README.md)
- **15–85% Drag-and-Drop Seating**: Left sticky guest tray with search and filter; right vehicle fleet grid with interactive drop zones.
- **12, 14, and 16-Seater Vans**: Multi-row seating chassis matrices for `van_12`, `van_14`, and `van_16` (Force Urbania, Ford Transit, Chevrolet Express, Sprinter).
- **RHD vs LHD Steering Toggle**: Supports Right-Hand Drive (India, UK, Australia) and Left-Hand Drive (USA, Canada) steering configurations with 1-click flip.
- **Luggage Boot Capacity**: Visual rear trunk space tracking suitcases and check-in baggage.
- Standardized `NestedScreen` drawers for vehicles, arrivals, and seat assignments.

### 6. [Seating Charts & 2D Floor Plan](./docs/pillar-6-seating-charts/README.md)
- **15–85% Interactive Workspace**: Left Guest Tray with Attending/Seated/Side filters; 85% 2D canvas with snap-to-grid.
- Draggable venue elements: Main Stage, Sacred Mandap, LED Dance Floor, Round Banquet Tables (6, 8, 10), Rectangular Tables (8, 12), and Royal Couple Diwans.
- **Droppable Table Seats & Pips**: Drag guests directly onto table cards or specific circular seat pips around tables.
- `NestedScreen` table seat assignment drawer with side color coding (*Ladkewale* vs *Ladkiwale*) and clear seat actions.

### 7. [Festive E-Invites & 3-Column Designer Studio](./docs/pillar-7-e-invites/README.md)
- **3-Column Inline Designer Studio**:
  - *Column 1 (Data & Cohort)*: 4 Cohort types &times; adjacent ceremony checkboxes with auto-prefill, greetings, host families, custom message, and maps URL.
  - *Column 2 (Visuals & Aesthetics)*: 4 design templates, 6 cultural color palettes, custom color pickers, repeating watermark patterns, and **Independent Watermark Pattern Color with RGBA Opacity Slider**.
  - *Column 3 (Live Preview & Export)*: Real-time live card preview, unclipped full-height high-res PNG download (no scroll clipping), standalone interactive HTML export, and 1-click WhatsApp message generator.

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
