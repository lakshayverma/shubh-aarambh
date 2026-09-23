# App Shell & Navigation Module

> **Path**: `src/components/Navbar.tsx`, `WeddingDashboard.tsx`, `WeddingCommandCenter.tsx`  
> **Classification**: Tier 4 Global Shell & Orchestration  
> **Dependencies**: `src/context/`, `src/db/`, `lucide-react`  
> **Parent Specification**: [`DESIGN.md` Section 4](../../DESIGN.md)

---

## 1. Module Overview

The App Shell governs the top-level viewport, global navigation, active wedding tenancy, and global system utilities (theme selection, network status, PWA installation, and backup/restore).

```
src/
├── components/
│   ├── Navbar.tsx                   # Unified Top Navigation Bar
│   ├── WeddingDashboard.tsx         # Primary Tab Switcher & View Container
│   ├── WeddingCommandCenter.tsx     # High-Level Metric & KPI Dashboard
│   ├── InstallPwaBanner.tsx         # PWA Installation Prompt Bar
│   ├── OfflineStatusIndicator.tsx   # Real-time navigator.onLine Network Badge
│   ├── ThemeSelectorModal.tsx       # Quick switcher for 5 cultural themes
│   ├── WeddingSettingsModal.tsx     # Backup/Restore and Wedding Settings
│   └── CreateWeddingModal.tsx       # 3-step wedding creation wizard
└── context/
    ├── WeddingContext.tsx           # Active wedding tenancy and switcher dispatcher
    └── ThemeContext.tsx             # Global dynamic CSS theme provider
```

---

## 2. Key Components

### 2.1 Unified Top Navigation Bar (`Navbar.tsx`)
Merges wedding branding, active dates, and system utilities into a unified bar:
- **Active Wedding Dropdown**: Displays the active wedding name with an arrow indicator. Clicking opens a list of all weddings stored in IndexedDB, plus a `+ New Wedding` button.
- **Wedding Metadata Badge**: Auspicious date and city badge (`e.g., Dec 12, 2026 • Udaipur`).
- **Offline Indicator**: Real-time indicator listening to `window.addEventListener('online' | 'offline')`.
- **Theme Palette Trigger**: Opens `ThemeSelectorModal`.
- **Settings Gear**: Opens `WeddingSettingsModal` to export full JSON backups or configure per-wedding custom colors.

### 2.2 Tab Orchestrator (`WeddingDashboard.tsx`)
- Orchestrates view rendering across the 7 foundational pillars:
  1. `dates`: `EventsTimeline.tsx`
  2. `guests`: `GuestListManager.tsx` (incorporates Family Hierarchy & Core Family Hub)
  3. `rooms`: `AccommodationsManager.tsx`
  4. `travel`: `TravelManager.tsx`
  5. `seating`: `SeatingChartsManager.tsx`
  6. `invites`: `EInvitesManager.tsx`
  7. `overview`: `WeddingCommandCenter.tsx`
- Enforces ultra-wide responsive viewport containment (`max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8`).

### 2.3 Wedding Command Center (`WeddingCommandCenter.tsx`)
- High-level executive dashboard showing:
  - Real-time Muhurat Countdown Timer (Days, Hours, Minutes, Seconds).
  - Quick KPI stats: Total Guests, Confirmed RSVPs, Rooms Allocated, Fleet Capacity, Seated Count.
  - Side-by-side headcount breakdown (*Ladkiwale* vs *Ladkewale*).
  - Immediate upcoming ceremonies with timing badges.
