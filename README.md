# Vivah Planner — Indian Wedding Management PWA

A **100% offline-first Progressive Web App (PWA)** built with **React 18, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB)**. Designed specifically for Indian Wedding Planners to manage multi-day, multi-ceremony weddings across **7 foundational management pillars** with zero external cloud dependencies.

---

## 🚀 Key Highlights & Philosophy

- **100% Client-Side & Zero Cloud Overhead**: All data is stored locally in the browser's IndexedDB via `Dexie.js`. No backend servers, no subscriptions, and no API keys required.
- **Offline-First PWA**: Configured with `vite-plugin-pwa` and Workbox for instant offline asset caching. Features an in-app installation banner and a live online/offline network indicator.
- **Data Portability & Backups**: Built-in JSON export (`vivah-planner-backup.json`) and 1-click restore to effortlessly migrate data between devices and preserve backups.
- **5 Cultural & Contemporary Palettes**: Instant live switching among 5 design themes:
  1. **Royal Festive** (Deep Maroon, Marigold Gold, Ivory)
  2. **Minimalist Slate** (Modern Charcoal, Indigo, Pure White)
  3. **Pastel Luxury** (Blush Rose, Rose Gold, Sage Green)
  4. **Peacock Splendor** (Royal Teal, Emerald, Champagne Gold)
  5. **Sunlit Saffron** (Warm Saffron, Terracotta, Sand)
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

### 1. [Dates & Ceremonies Timeline](./docs/pillar-1-dates-and-events/README.md)
- Guided 3-step Indian wedding creation wizard (The Couple, Dates & City, Pre-populated Ceremonies: Mehendi, Sangeet, Haldi, Vivah, Reception).
- Real-time Muhurat Countdown Timer (Days, Hours, Minutes, Seconds).
- Chronological timeline with dress codes and 1-click `.ics` calendar export.

### 2. [Family Hierarchy & Roles](./docs/pillar-2-family-information/README.md)
- Dual-view interface: Structured cards split by *Ladkewale* and *Ladkiwale* across 4 generation tiers, plus an interactive genealogical tree graph powered by `@xyflow/react`.
- Operational role assignments (e.g. *Baraat Reception Lead*, *Pooja & Rituals Lead*), direct WhatsApp/call shortcuts, and a custom tag engine with global promotion support.

### 3. [Guest List & Multi-Event RSVP](./docs/pillar-3-guest-list/README.md)
- Family party grouping (primary contact, adult/child headcounts, side affiliation).
- Multi-event RSVP attendance matrix tracking attendance per ceremony.
- Dietary preference counters (Pure Veg, Jain, Non-Veg, Vegan) and special assistance notes.
- CSV Import & Export for spreadsheet synchronization.

### 4. [Accommodations & Hotel Room Grid](./docs/pillar-4-accommodations/README.md)
- Multi-hotel property management.
- Visual room grid categorized by category (Suites, Villas, Deluxe Lake View) with occupancy badges.
- Guest room allocation drawer, interconnecting room markers, and welcome hamper delivery tracking.
- Printable Front Desk Rooming List for hotel check-in desks.

### 5. [Travel & Vehicle Seating](./docs/pillar-5-travel-arrangements/README.md)
- Chronological flight and train arrival tracker with airport pickup batching.
- Fleet management covering commercial shuttles, hire cabs, and personal family vehicles.
- Pictorial automotive seating chart rendering car chassis layouts with click-to-seat allocation for Driver, Co-Driver, and Passengers.

### 6. [Seating Charts & 2D Floor Plan](./docs/pillar-6-seating-charts/README.md)
- Function-specific 2D floor plans (Sangeet, Reception, Pheras) with 10px snap-to-grid canvas.
- Draggable venue elements: Main Stage, Sacred Mandap, LED Dance Floor, Round Banquet Tables (8/10), Rectangular Tables, and Royal Couple Diwans.
- Table seat assignment drawer with side color coding and capacity alerts.

### 7. [Festive E-Invites & Exporter](./docs/pillar-7-e-invites/README.md)
- Multi-cohort e-invites with dedicated URL slugs (e.g. All Functions vs Reception-only).
- Live festive card preview with gold-foiled borders, Indian arch emblems, and ceremony itineraries.
- High-res PNG card download, standalone single-file interactive HTML exporter, 1-click WhatsApp message generator, and dedicated public invite route (`#/invite/:slug`).

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
