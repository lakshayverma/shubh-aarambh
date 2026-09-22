# Pillar 2: Family Hierarchy & Roles

## 1. Overview & Purpose
In Indian weddings, family coordination is critical. Responsibilities such as greeting the Baraat, managing jewelry safes, distributing room keys, or coordinating Pandit rituals are handled by specific aunts, uncles, siblings, and elders. 

Pillar 2 provides:
- A **Dual-View System**:
  1. Structured **Directory / Card View** organized by side (*Ladkiwale* & *Ladkewale*) and generation tiers.
  2. Interactive **Graphical Family Tree Graph** powered by `@xyflow/react` (React Flow).
- **Wedding Roles & POC Assignments** (e.g. "Baraat Reception Lead", "Catering & Hospitality POC").
- Direct **WhatsApp & Phone Call Integration** for instant one-click communication.
- Comprehensive **Tagging Engine** with circular icon badges and global promotion support.

---

## 2. Key Features & Capabilities

### 2.1 Dual-View System (`FamilyManager.tsx`)
Planners can toggle between two modes:
1. **Directory / Cards View**:
   - Split side-by-side: **Ladkewale (Groom's Family)** on the left, **Ladkiwale (Bride's Family)** on the right.
   - Grouped by hierarchical generation levels:
     - **Gen 1**: Grandparents & Senior Family Elders (e.g. *Dada/Dadi*, *Nana/Nani*).
     - **Gen 2**: Parents, Aunts & Uncles (e.g. *Chacha/Chachi*, *Mama/Mami*, *Bua/Fufa*, *Massi/Masa*).
     - **Gen 3**: The Couple, Siblings & Cousins.
     - **Gen 4**: Children, Nieces & Nephews.
   - Each card displays relationship, contact details, wedding day duties, and tags.
2. **Graphical Family Tree Graph (`@xyflow/react`)**:
   - Interactive canvas with pan, zoom, and MiniMap navigation.
   - Custom styled nodes (`FamilyMemberNode`) color-coded by side:
     - *Ladkewale* nodes: Warm amber/gold borders.
     - *Ladkiwale* nodes: Festive rose/crimson borders.
   - Displays generation tier, member name, assigned role, and visual tag badges directly inside each node.

### 2.2 Wedding Day Roles & Point-of-Contact (POC)
Planners can assign operational titles directly to family members, such as:
- *Chief Host (Ladkewale)*
- *Pooja & Rituals Lead (coordinates muhurat items with Pandit ji)*
- *Baraat & Safa Coordinator*
- *Hospitality & Room Key Coordinator*
- *Bride Squad & Joota Chupai Lead*

### 2.3 Instant Calling & WhatsApp Shortcuts
Family cards feature quick-action buttons:
- Call button (`tel:+91...`)
- WhatsApp deep-link (`https://wa.me/...`) for instant communication with leads.

### 2.4 Tagging System Integration
- Supports assigning both **Wedding-Scoped Tags** (e.g. *Baraat Coordinator*, *Sangeet Dancer*) and **Global Tags** (e.g. *VIP Guest*, *Elderly Care*).
- Tags render as circular icon pills with configurable colors.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface FamilyMember {
  id: string;
  weddingId: string;
  name: string;
  side: 'ladkiwale' | 'ladkewale';
  relation: string; // e.g. "Father", "Mother", "Sister", "Mama", "Chacha", "Bua"
  generationLevel: number; // 1 to 4
  phone?: string;
  email?: string;
  roleTitle?: string; // Designated wedding duty
  tagIds: string[];
  notes?: string;
  parentId?: string; // Optional ancestor linkage for tree graph
}
```

IndexedDB Table Indexes:
- `familyMembers`: `id, weddingId, side, relation, generationLevel`
