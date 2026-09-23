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

A custom-rendered interactive dropdown component replacing native browser `<select>` elements across all pillars. It provides:
- **Instant Search Filtering**: Optional search query input with auto-focus for fast typing in long lists (automatically enabled if >6 options or via `searchable={true}`).
- **Rich Visual Options**: Supports Lucide icons, badges, descriptions, and multi-dot color swatches (`colorSwatch`).
- **Prefix Icon Support**: Supports a leading `icon` prop inside the trigger button for compact action bars and filters.
- **Sizing Flexibility**: Supports both standard `md` (drawers and forms) and compact `sm` (table rows, pagination controls, inline editing).
- **Light Theme Harmony**: Styled with warm, crisp light cultural aesthetics (`bg-white`, `border-stone-200`, `text-stone-800`, `shadow-2xl` menu), avoiding unreadable OS dark theme overrides.

#### Component Signature
```typescript
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  colorSwatch?: string | string[];
  group?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  size?: 'sm' | 'md';
  error?: string;
  icon?: React.ReactNode;
}
```

---

## 3. Design Guidelines & Usage Rules
1. **Never create ad-hoc slide-in panels or backdrop divs** in pillar components. Always import `<NestedScreen>`.
2. **Always specify `level={2}`** if opening a drawer or modal from inside an existing drawer.
3. **Always use `<CustomSelect>`** instead of native `<select>` tags for all dropdowns, filters, and selectors.
4. **Light Theme Modal Standard**: Modals, drawers, and popovers maintain crisp light cultural aesthetics; Tailwind `darkMode: 'class'` is enforced so system `prefers-color-scheme: dark` cannot distort form readability.
5. **Do not embed business logic** inside `src/components/common/`.

