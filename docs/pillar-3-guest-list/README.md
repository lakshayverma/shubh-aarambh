# Pillar 3: Guest List, Tabular Party Members & Multi-Event RSVP

## 1. Overview & Purpose
Indian wedding guest lists are structured around **family units / parties** (*Parivaar*) containing multiple individual members across generations. Pillar 3 allows wedding planners to manage guest parties, edit individual members in a full tabular spreadsheet view, mark primary contacts, set age tiers (*Adult, Elder, Child, Infant*), and track multi-ceremony RSVP matrix.

---

## 2. Key Features & Capabilities

### 2.1 Tabular Party Member Editor (`GuestListManager.tsx`)
When adding or editing a guest party, planners have access to a full tabular member editor with:
- **Primary Contact Radio**: Designates the primary family representative for WhatsApp invitations and phone contact.
- **Member Name**: Individual name for seating charts and place cards.
- **Age Tier Dropdown**:
  - `adult`: Adult (18+)
  - `elder`: Elder / Senior Citizen (60+)
  - `child`: Child (2–12 yrs)
  - `infant`: Infant / Toddler (<2 yrs)
- **Family Generation Tier**: Gen 1 (Elders), Gen 2 (Parents/Uncles), Gen 3 (Couple/Cousins/Peers), Gen 4 (Kids).
- **Relation to Bride & Groom Guides**: Standardized Indian kinship guide dropdown (*Father, Mother, Brother, Sister, Bhabi, Jiju, Dada, Dadi, Nana, Nani, Chacha, Chachi, Taya, Tayi, Mama, Mami, Bua, Fufa, Maasi, Mausa, Cousin, Friend, Colleague*).
- **Dietary Preference**: Pure Veg, Jain (no root vegetables), Non-Veg, Vegan.
- **Special Care & Assistance**: Input for wheelchair assistance, ground floor rooms, or diabetic meals.
- **Automatic Headcount Calculation**: Dynamically computes adult vs child numbers from valid member rows.

### 2.2 Flexible Party & Individual RSVP Matrix
- **Party-Level Master Toggle**: 1-click attendance toggle on the party row with live attendance counter badges (`X/Y attending`).
- **Individual Guest RSVP Matrix**: Expanding any party row reveals individual ceremony toggles for each member (e.g. Grandma attends Haldi and Wedding, but skips the late-night Cocktail).
- **Downstream Attendance Synchronization**:
  - **Pillar 1 (Ceremonies)**: Exact expected headcounts per ceremony dynamically reflect individual guest and party confirmations.
  - **Pillar 4 (Accommodations)**: Room allocation modal displays ceremony attendance badges (`✓ Attending`) and allows selecting specific confirmed members for each room.
  - **Pillar 5 (Travel & Fleet)**: Left guest tray features an "Attending" filter tab and green RSVP badges to prioritize confirmed travelers for vehicles.
  - **Pillar 6 (Seating Charts)**: Table seat assignment drawer provides an "Attending Guests Only" filter for the active ceremony.

### 2.3 Guest Metrics & Dietary Analytics
- Real-time KPI cards: Total Guests, Adults, Elders, Children, Infants, Pure Veg meals, Jain meals, Non-Veg meals, and Special Care needs.

### 2.4 CSV Import & Export
- Standalone CSV import and export with standard headers for quick bulk loading from Excel or Google Sheets.

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
  tagIds?: string[];
}
```
