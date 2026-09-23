# Pillar 3: Guest List, Core Family & Roles Hub, and Multi-Event RSVP

## 1. Overview & Purpose
Indian wedding guest lists are structured around **family units / parties** (*Parivaar*) containing multiple individual members across generations. Importantly, **Core Family members of the Bride and Groom are also guests** who must be tracked for room allocations, travel transfers, table seating, and ceremonial RSVPs.

Pillar 3 provides:
- A unified **Guests & Family Hub** with sub-tabs for Guest Directory, Family Tree Graph, and Core Family & Roles.
- **Core Family & Roles Hub**: Direct query and filtering of all guests who are flagged as `isCoreFamily`, assigned an operational role (`roleTitle`), or tagged with Core tags.
- Side-by-side partitioning: **Bride's Core Family & Roles (Ladkiwale)** vs **Groom's Core Family & Roles (Ladkewale)**.
- **1-Click Core Family Toggle**: Crown button to instantly mark or unmark any guest as Core Family across the spreadsheet and the hub.
- **Operational Role Management**: Assign and edit responsibilities (e.g. *Chief Host*, *Baraat & Safa Coordinator*, *Pooja & Rituals Lead*, *Bride Squad & Joota Chupai Lead*) inline or via drawer.
- Tabular member editor with individual phone, email, and address.
- Multi-ceremony RSVP matrix with ceremony tooltips.

---

## 2. Key Features & Capabilities

### 2.1 Core Family & Operational Roles Hub (`GuestListManager.tsx`)
- Filters directly from `db.guests`:
  - `g.isCoreFamily === true` OR `!!g.roleTitle` OR `hasCoreTag(g.tagIds)`.
- **Bride's Side (Ladkiwale)** and **Groom's Side (Ladkewale)** columns with custom side styling, count badges, and role summaries.
- Fast category filters: *All Core & Roles*, *Has Assigned Role*, *Core Flagged*, *Parents & Elders*, *Youth & Squad*.
- **Role Assignment Drawer**: Assign roles with suggested Indian wedding presets:
  - *Chief Host (Ladkewale / Ladkiwale)*
  - *Baraat & Safa Coordinator*
  - *Varmala & Stage Coordinator*
  - *Pooja & Rituals Lead*
  - *Bride Squad & Joota Chupai Lead*
  - *Catering & Food Hospitality Lead*
  - *Room Key & Welcome Kit Lead*
  - *Transport & Airport Pickup POC*
  - *Shagun & Cash Gifts In-charge*
  - *Panditji & Samagri Coordinator*
  - *DJ & Sangeet Performance Lead*
  - *Family Elder & Blessings Lead*
- Direct action buttons on cards: Phone (`tel:`), Email (`mailto:`), WhatsApp, and special care badges (wheelchair assistance).

### 2.2 Tabular Party Member Editor
When adding or editing a guest party, planners have access to a full tabular member editor with:
- **Primary Contact Star**: Designates the primary family representative for WhatsApp invitations and phone contact.
- **Member Name**: Individual name for seating charts and place cards.
- **Age Tier Dropdown**: `adult`, `elder`, `child`, `infant`.
- **Family Generation Tier**: Gen 1 (Elders), Gen 2 (Parents/Uncles), Gen 3 (Couple/Cousins/Peers), Gen 4 (Kids).
- **Kinship Guides**: Kinship dropdown (*Father, Mother, Brother, Sister, Bhabi, Jiju, Dada, Dadi, Nana, Nani, Chacha, Chachi, Taya, Tayi, Mama, Mami, Bua, Fufa, Maasi, Mausa, Cousin, Friend, Colleague*).
- **Core Family Toggle**: 1-click Crown toggle.
- **Operational Role**: Direct role input per attendee.
- **Dietary Preference**: Pure Veg, Jain, Non-Veg, Vegan.
- **Individual Contact Info**: Dedicated Phone, Email, and Address per attendee.

### 2.3 Flexible Party & Individual RSVP Matrix
- **Party-Level Master Toggle**: 1-click attendance toggle on the party row with live attendance counter badges (`X/Y attending`).
- **Individual Guest RSVP Matrix**: Sub-row checkboxes for each individual attendee across all ceremonies.
- **Downstream Attendance Synchronization**:
  - **Pillar 1 (Ceremonies)**: Expected headcounts reflect individual confirmations.
  - **Pillar 4 (Accommodations)**: Room allocations show guest names and ceremony attendance badges.
  - **Pillar 5 (Travel & Fleet)**: Left guest tray filters by confirmed travelers.
  - **Pillar 6 (Seating Charts)**: Left tray filters by attending guests for active ceremony.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface GuestParty {
  id: string;
  weddingId: string;
  partyName: string;
  primaryContactName: string;
  phone?: string;
  email?: string;
  side: 'ladkiwale' | 'ladkewale' | 'mutual';
  adultsCount: number;
  childrenCount: number;
  tagIds: string[];
  notes?: string;
}

export interface Guest {
  id: string;
  partyId: string;
  weddingId: string;
  name: string;
  ageCategory: 'adult' | 'child' | 'infant' | 'elder';
  dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'vegan';
  isPrimaryContact?: boolean;
  relationToBride?: string;
  relationToGroom?: string;
  generationLevel?: number;
  specialAssistance?: string;
  phone?: string;
  email?: string;
  address?: string;
  isCoreFamily?: boolean;
  roleTitle?: string;
  assignedEventRoles?: { eventId: string; roleTitle: string }[];
  tagIds?: string[];
}
```
