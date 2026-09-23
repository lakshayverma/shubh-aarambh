# Common UI Primitives Module

> **Path**: `src/components/common/`  
> **Classification**: Tier 1 Agnostic UI Primitives  
> **Dependencies**: `react`, `lucide-react`, Tailwind CSS  
> **Parent Specification**: [`DESIGN.md` Section 4 & 5](../../DESIGN.md)

---

## 1. Module Overview

The `src/components/common/` module contains foundational, reusable UI components that have **zero domain or wedding-specific business logic**. They provide standard visual treatments, accessibility affordances, and interaction patterns across all 7 pillars of Vivah Planner.

```
src/components/common/
├── NestedScreen.tsx     # Slide-in right drawer and modal container with stacked Esc handling
├── Tooltip.tsx          # Portal-rendered contextual hover bubble with z-index resilience
├── CustomSelect.tsx     # Themed dropdown component compatible with CSS custom properties
└── CustomToggle.tsx     # Accessible switch toggle for bilateral configurations
```

---

## 2. Component Specifications

### 2.1 `<NestedScreen>`

The universal slide-in right drawer and modal engine used for all entity creation, detail views, and edit workflows.

#### Component Signature
```typescript
interface NestedScreenProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  mode?: 'drawer' | 'modal';
  width?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  level?: 1 | 2;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Key Mechanics & Invariants
- **Stack-Aware Escape Key Listener**:
  - Automatically captures the `Escape` key via a window listener.
  - When mounted at `level={1}`, it inspects the DOM for `[data-nested-level="2"]`. If a Level 2 drawer is active, Level 1 ignores the event, allowing the top-most drawer to dismiss first.
  - Preserves underlying form drafts when sub-modals (e.g., Tag Manager) close.
- **Visual Backdrop Layering**:
  - `level={1}`: `z-[50]`, `bg-black/50 backdrop-blur-sm`.
  - `level={2}`: `z-[70]`, `bg-black/60 backdrop-blur-sm`.
- **Layout Architecture**:
  - Fixed-height flex layout with a sticky header, independently scrollable content body (`flex-1 overflow-y-auto p-6`), and a sticky action footer.

---

### 2.2 `<Tooltip>`

A lightweight, portal-safe tooltip component designed to prevent cutoffs inside scrollable table containers and high z-index elements.

#### Component Signature
```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
```

#### Usage in the Codebase
- **Ceremony RSVP Headers** (`GuestListManager.tsx`): Displays ceremony name, date, timings, venue, and dress code on hover.
- **Seat Slot Badges** (`TravelManager.tsx`, `SeatingChartsManager.tsx`): Shows passenger details, dietary flags, and contact numbers.

---

### 2.3 `<CustomToggle>`

An accessible bilateral switch component supporting smooth sliding animations and dynamic theme coloring.

#### Component Signature
```typescript
interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}
```

#### Usage in the Codebase
- Steering toggle in `TravelManager.tsx` (RHD vs LHD).
- Attendance filters in `SeatingChartsManager.tsx` (All vs Attending Only).
- Core Family 1-click flags in `GuestListManager.tsx`.

---

### 2.4 `<CustomSelect>`

A styled HTML select wrapper ensuring consistent typography, border radius, and color harmony with the dynamic CSS theme variables (`--theme-border`, `--theme-card`, `--theme-text-main`).

---

## 3. Design Guidelines & Usage Rules
1. **Never create ad-hoc slide-in panels or backdrop divs** in pillar components. Always import `<NestedScreen>`.
2. **Always specify `level={2}`** if opening a drawer or modal from inside an existing drawer.
3. **Do not embed business logic** inside `src/components/common/`.
