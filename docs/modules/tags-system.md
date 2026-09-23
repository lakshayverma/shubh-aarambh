# Tagging & Categorization System Module

> **Path**: `src/components/tags/` & `src/utils/tagUtils.ts`  
> **Classification**: Tier 2 Cross-Cutting Domain Utilities  
> **Dependencies**: `db`, `lucide-react`, `src/components/common/NestedScreen.tsx`  
> **Parent Specification**: [`DESIGN.md` Section 4.4](../../DESIGN.md)

---

## 1. Module Overview

The Tagging System provides cross-cutting categorization across all 7 pillars of Vivah Planner. It enables wedding planners and family hosts to label, search, and filter entities (guests, rooms, family members, vehicles) based on dietary restrictions, VIP priority, ritual leads, and operational duties.

```
src/
├── components/tags/
│   ├── TagBadge.tsx         # Pill badge rendering tag name, Lucide icon, color dot, and dismiss button
│   ├── TagSelector.tsx      # Multi-select dropdown filtering by Wedding vs Global scope
│   └── TagManagerModal.tsx  # 2-level drawer for tag cataloging and authoring
└── utils/
    └── tagUtils.ts          # Default tag seeds, syncMemberTags bidirectional syncing, and helpers
```

---

## 2. Tag Data Model

Defined in `src/db/schema.ts`:

```typescript
export interface Tag {
  id: string;
  name: string;
  icon: string;         // Lucide icon identifier e.g. 'Star', 'Heart', 'Shield', 'Crown'
  color: string;        // Hex color code e.g. '#EF4444', '#10B981', '#6366F1'
  scope: 'wedding' | 'global';
  weddingId?: string;   // Present only if scope === 'wedding'
}
```

### 2.1 Scope Rules
- **`global` Tags**: Preserved across all weddings on the device (e.g., standard dietary tags: `Pure Veg`, `Jain`, `Non-Veg`, `Vegan`, `Gluten-Free`).
- **`wedding` Tags**: Bound to a specific `weddingId` (e.g., `Bride Squad`, `Groom College Friends`, `VIP Suite Allocation`).

---

## 3. Key Components

### 3.1 `<TagBadge>`
- Renders a compact, rounded pill badge displaying:
  - The tag's custom vector icon resolved dynamically from `lucide-react`.
  - The tag's text label.
  - A color dot or badge tint matching the tag's hex code.
  - An optional dismiss `X` button with an `onRemove` callback.

### 3.2 `<TagSelector>`
- Multi-select search dropdown used inside forms (guest editing, room categorization, vehicle tagging).
- Automatically groups tags into **Wedding Tags** and **Global Tags**.
- Includes a direct `+ Manage Tags` button triggering the Tag Manager drawer.

### 3.3 `<TagManagerModal>`
Implemented via `<NestedScreen level={2}>`:
- **Level 1 View**: A paginated, searchable grid of all active tags, displaying usage counts and scope chips.
- **Level 2 Sub-Drawer**: Form to create or update tags:
  - Scope toggle (`Wedding Scope` vs `Global Scope`).
  - Lucide Icon Picker with 30+ curated ceremonial and logistical icons.
  - Color Picker with cultural presets and raw hex color inputs.

---

## 4. Automatic Bidirectional Sync (`tagUtils.ts`)

### `syncMemberTags(guest, tags, weddingId)`
When a user toggles `isCoreFamily` or edits a guest's `roleTitle`, `syncMemberTags` automatically:
1. Locates or creates the corresponding `Core Family` tag in Dexie.
2. Locates or creates a role-specific tag matching `roleTitle` (e.g. `Baraat Coordinator`).
3. Appends the tag ID to the guest's `tagIds` array in Dexie, ensuring the guest appears in tag-filtered views across Accommodations, Travel, and Seating.
