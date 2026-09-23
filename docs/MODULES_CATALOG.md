# Vivah Planner — Live Module & Section Catalog

> **Generated**: `2026-09-23 17:32:47 UTC`  
> **Automated Hook**: `scripts/update-docs.cjs`  
> **Total Measured Modules**: `12` | **Total Source Files**: `32` | **Total Lines of Code**: `16,698`  

---

## 📋 Module Inventory & Documentation Mapping

| Module / Section | Tier | Files | LOC | Primary Exports / Interfaces | Documentation Link | Status |
|---|---|---|---|---|---|---|
| **Pillar 1: Dates & Ceremonies Calendar**<br><small>3-step wizard, Muhurat timer, week calendar view, ritual cards, ceremony auto-prefill, .ics export</small> | `Tier 3 (Domain Pillar)` | `2` | `1,528` | `EVENT_TYPE_DEFAULTS`, `EventsTimeline`, `CreateWeddingModal` | [View Documentation](./pillar-1-dates-and-events/README.md) | ✅ Documented |
| **Pillar 2: Family Hierarchy & Tree**<br><small>Genealogical tree graph via React Flow, 4 generation tiers, bilateral branching, PNG export</small> | `Tier 3 (Domain Pillar)` | `1` | `1,335` | `UnifiedRelativeItem`, `FamilyManager` | [View Documentation](./pillar-2-family-information/README.md) | ✅ Documented |
| **Pillar 3: Unified Guests & Multi-Event RSVPs**<br><small>Unified hub, spreadsheet-style member RSVP rows, ceremony tooltips, Core Family 1-click crown, 2000+ pagination</small> | `Tier 3 (Domain Pillar)` | `1` | `3,120` | `INDIAN_WEDDING_ROLE_PRESETS`, `RELATION_GUIDE_OPTIONS`, `GuestListManager` | [View Documentation](./pillar-3-guest-list/README.md) | ✅ Documented |
| **Pillar 4: Accommodations & Room Allocation**<br><small>Multi-hotel management, room category cards, individual guest name chips, interconnecting rooms, rooming list</small> | `Tier 3 (Domain Pillar)` | `1` | `953` | `AccommodationsManager` | [View Documentation](./pillar-4-accommodations/README.md) | ✅ Documented |
| **Pillar 5: Travel & Fleet Logistics**<br><small>15-85% drag-and-drop fleet planner, vehicle chassis matrices (Sedans, SUVs, Vans 12/14/16), RHD/LHD steering, boot slots</small> | `Tier 3 (Domain Pillar)` | `1` | `1,513` | `VehiclePreset`, `COUNTRY_VEHICLE_PRESETS`, `getVehiclePassengerRows`, `TravelManager` | [View Documentation](./pillar-5-travel-arrangements/README.md) | ✅ Documented |
| **Pillar 6: Seating Charts & Floor Plan Studio**<br><small>React Flow 60fps floor plan, Royal Diwan, Round/Banquet tables, proximity auto-snap (<170px), 2x PNG floor plan export</small> | `Tier 3 (Domain Pillar)` | `1` | `1,961` | `SeatingChartsManager` | [View Documentation](./pillar-6-seating-charts/README.md) | ✅ Documented |
| **Pillar 7: Festive E-Invites Studio**<br><small>3-column designer, 4 cohorts, RGBA watermark pattern engine, unclipped full-bleed PNG export, WhatsApp blast</small> | `Tier 3 (Domain Pillar)` | `2` | `1,920` | `COLOR_PALETTES`, `parseColorToRgba`, `hexAndOpacityToRgba`, `BACKGROUND_PATTERNS`, `INVITATION_ICONS`, `INVITE_TYPE_CONFIG` | [View Documentation](./pillar-7-e-invites/README.md) | ✅ Documented |
| **Common UI Primitives**<br><small>Universal primitives: <NestedScreen> (2-tier drawer/modal), <Tooltip>, <CustomSelect>, <CustomToggle></small> | `Tier 1 (Agnostic Primitives)` | `4` | `525` | `SelectOption`, `CustomSelectProps`, `CustomSelect`, `CustomToggle`, `NestedScreen`, `Tooltip` | [View Documentation](./modules/common-primitives.md) | ✅ Documented |
| **Tagging & Categorization System**<br><small>TagBadge, TagSelector, TagManagerModal (2-level drawer), syncMemberTags bidirectional sync</small> | `Tier 2 (Cross-Cutting Domain)` | `4` | `778` | `TagBadge`, `ICON_MAP`, `TagManagerModal`, `TagSelector`, `DEFAULT_SYSTEM_TAGS`, `syncMemberTags` | [View Documentation](./modules/tags-system.md) | ✅ Documented |
| **App Shell & Global Navigation**<br><small>Unified top navigation bar, wedding switcher dropdown, offline network indicator, PWA installer banner</small> | `Tier 4 (Global Shell)` | `8` | `1,634` | `Navbar`, `WeddingDashboard`, `UnifiedPillarId`, `WeddingCommandCenter`, `InstallPwaBanner`, `OfflineStatusIndicator` | [View Documentation](./modules/app-shell-navigation.md) | ✅ Documented |
| **Offline Database & Persistence**<br><small>VivahDatabase (Dexie.js v4), 17 indexed stores, canonical schema.ts, sampleData.ts, JSON backup & restore</small> | `Storage Layer (IndexedDB)` | `4` | `1,111` | `BackupData`, `VivahDatabase`, `db`, `WeddingCustomColors`, `Wedding`, `WeddingEvent` | [View Documentation](./modules/offline-database.md) | ✅ Documented |
| **Theming & Visual Styling**<br><small>5 curated cultural palettes, dynamic CSS custom properties (:root & [data-theme]), per-wedding custom colors</small> | `Global Styling Engine` | `3` | `320` | `ThemeName`, `ThemeConfig`, `THEMES`, `ThemeProvider`, `useTheme`, `WeddingProvider` | [View Documentation](./modules/theming-system.md) | ✅ Documented |

---

## 🛠️ Verification & Synchronization Commands

- **Update Catalog Manually**: `npm run docs:update`
- **Verify in CI/CD**: `npm run docs:check`
- **Re-install Git Pre-Commit Hook**: `npm run hooks:install`
