# Vivah Planner — Technical Documentation Hub

Welcome to the comprehensive documentation repository for **Vivah Planner**, the 100% offline-first Indian Wedding Management Progressive Web App (PWA).

---

## 🏛️ Foundational Architectural Documents

Before diving into individual pillars or modules, review the primary architectural manuals:

| Document | Description | Key Topics |
|---|---|---|
| [`DESIGN.md`](../DESIGN.md) | **Canonical System & Design Specification** | Cultural design principles, 4-tier component architecture, `<NestedScreen>` drawer paradigm, React Flow 60fps spatial engineering, 7-pillar blueprints |
| [`AGENTS.md`](../AGENTS.md) | **AI Agent & Developer Operating Manual** | The 5 Invariants (Zero-Cloud, strict TypeScript, drawer standards), Dexie indexing rules, React Flow buffering, pre-commit checklists |
| [`LICENSE.md`](../LICENSE.md) | **Software License & Terms** | Modified MIT base with commercial reservations, AI non-training clause, and Antigravity attribution |

---

## 🏛️ The 7 Foundational Management Pillars

Detailed architectural specifications and feature breakdowns for each pillar:

| Pillar | Documentation Link | Source Component | Key Capabilities |
|---|---|---|---|
| **1. Dates & Events** | [`pillar-1-dates-and-events/`](./pillar-1-dates-and-events/README.md) | `src/components/pillar1/EventsTimeline.tsx` | 3-step wedding wizard, real-time Muhurat countdown, week calendar view, ceremony auto-prefill, `.ics` calendar sync |
| **2. Family Hierarchy** | [`pillar-2-family-information/`](./pillar-2-family-information/README.md) | `src/components/pillar2/FamilyManager.tsx` | Genealogical tree graph via React Flow, 4 generation tiers, bilateral *Ladkiwale*/*Ladkewale* branching, PNG tree export |
| **3. Unified Guests & RSVPs** | [`pillar-3-guest-list/`](./pillar-3-guest-list/README.md) | `src/components/pillar3/GuestListManager.tsx` | Integrated guest hub, individual spreadsheet RSVP matrix, 2000+ guest pagination, Core Family 1-click crown toggle |
| **4. Accommodations** | [`pillar-4-accommodations/`](./pillar-4-accommodations/README.md) | `src/components/pillar4/AccommodationsManager.tsx` | Multi-hotel properties, room category cards, individual guest name chips, interconnecting rooms, front desk rooming list |
| **5. Travel & Fleet** | [`pillar-5-travel-arrangements/`](./pillar-5-travel-arrangements/README.md) | `src/components/pillar5/TravelManager.tsx` | 15%–85% drag-and-drop fleet planner, chassis matrices (Sedans, SUVs, Vans 12/14/16), RHD/LHD steering toggle, boot luggage slots |
| **6. Seating Charts** | [`pillar-6-seating-charts/`](./pillar-6-seating-charts/README.md) | `src/components/pillar6/SeatingChartsManager.tsx` | React Flow 60fps floor plan, Royal Diwan, Round/Banquet tables, proximity auto-snap (<170px), 2x high-res PNG export |
| **7. Festive E-Invites** | [`pillar-7-e-invites/`](./pillar-7-e-invites/README.md) | `src/components/pillar7/EInvitesManager.tsx` | 3-column studio, 4 cohort types, RGBA watermark pattern engine, unclipped full-bleed PNG export, WhatsApp blast generator |

---

## 🧩 Cross-Cutting System Modules & Subsystems

| Module | Documentation Link | Source Files | Description |
|---|---|---|---|
| **Common UI Primitives** | [`modules/common-primitives.md`](./modules/common-primitives.md) | `src/components/common/` | Reusable primitives: `<NestedScreen>`, `<Tooltip>`, `<CustomSelect>`, `<CustomToggle>` |
| **Tagging System** | [`modules/tags-system.md`](./modules/tags-system.md) | `src/components/tags/`, `src/utils/tagUtils.ts` | 2-level drawer, Global vs Wedding scoped tags, Lucide icon binding, automatic bidirectional sync |
| **App Shell & Navigation** | [`modules/app-shell-navigation.md`](./modules/app-shell-navigation.md) | `src/components/Navbar.tsx`, `WeddingDashboard.tsx` | Unified top navigation bar, wedding switcher, offline indicator, PWA installer |
| **Offline Database** | [`modules/offline-database.md`](./modules/offline-database.md) | `src/db/` | Dexie.js IndexedDB schema, store indexing, atomic bulk transactions, JSON backup & restore |
| **Theming & Styling** | [`modules/theming-system.md`](./modules/theming-system.md) | `src/context/ThemeContext.tsx`, `src/index.css` | 5 curated cultural palettes, dynamic CSS custom properties, per-wedding custom colors |

---

## 🔄 Automated Documentation Updater & Git Hook

To prevent documentation drift as code evolves, Vivah Planner includes an automated documentation synchronization engine:

### 1. Update Docs Manually
Run the documentation updater script to scan modules, verify exports, and update the catalog:
```bash
npm run docs:update
```

### 2. Verify Docs in CI / Pre-Commit
Verify that documentation is fully synchronized with codebase structure:
```bash
npm run docs:check
```

### 3. Install Automatic Pre-Commit Hook
Install the Git pre-commit hook that automatically runs the docs updater and stages changes before any commit:
```bash
npm run hooks:install
```
