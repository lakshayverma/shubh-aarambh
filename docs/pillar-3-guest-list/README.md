# Pillar 3: Guest List & Multi-Event RSVP Matrix

## 1. Overview & Purpose
Indian wedding guest management is inherently complex:
- Guests are invited as **Family Units / Parties** (e.g., "The Kapoor Family" with primary contact, multiple adults, and children).
- Not every guest attends every ceremony: close relatives attend all 5 rituals, while colleagues or extended acquaintances may only be invited to the Sangeet or Reception.
- Strict **Dietary Preferences** (Pure Vegetarian, strict Jain food without root vegetables, Non-Vegetarian, Vegan) must be tracked for catering guarantees.

Pillar 3 provides:
- **Family Unit / Party Grouping** with adult and child headcounts.
- An interactive **Multi-Event RSVP Attendance Matrix**.
- Dietary preference tracking (Jain meals, pure veg, non-veg).
- Real-time **Headcount & Catering Analytics**.
- **CSV Bulk Import & Export** for easy synchronization with spreadsheets.

---

## 2. Key Features & Capabilities

### 2.1 Family Unit & Party Grouping (`GuestListManager.tsx`)
- Guests are grouped into parties (e.g. *Malhotra Family*, *Rohan & Friends*).
- Each party tracks:
  - Party Name & Primary Contact Name.
  - Contact Phone & Email.
  - Side Affiliation: *Ladkewale*, *Ladkiwale*, or *Mutual*.
  - Counts: Adults Count & Children Count.
  - Tag attachments (e.g. *VIP*, *Elderly Care*).

### 2.2 Multi-Event RSVP Attendance Matrix
- Displays an interactive matrix table where each column corresponds to a scheduled wedding ceremony (Mehendi, Sangeet, Haldi, Wedding, Reception).
- Planners can toggle attendance with a single click per ceremony per party.
- Visual state:
  - **Attending / Confirmed**: Green active check pill.
  - **Not Attending / Declined**: Muted toggle state.

### 2.3 Individual Guest Profiles & Dietary Preferences
Expanding any party row reveals individual profiles for each attendee:
- **Age Category**: Adult or Child.
- **Dietary Preference**:
  - **Pure Vegetarian**: Traditional Indian vegetarian cooking.
  - **Jain**: Strict vegetarian without garlic, onion, potatoes, or root vegetables.
  - **Non-Vegetarian**: Poultry/meat options.
  - **Vegan**: 100% plant-based.
- **Special Assistance Flags**: Wheelchair requirements, elderly mobility assistance, ground-floor accessibility needs.

### 2.4 Real-Time Headcount & Catering Analytics
The analytics banner at the top aggregates live numbers across the wedding:
- **Total Headcount**: Total invited guests, adults count, children count.
- **Pure Veg Meals**: Total confirmed vegetarian heads for banquet kitchen prep.
- **Jain Meals Count**: Crucial metric for specialized Jain banquet catering.
- **Non-Veg Meals Count**: Count for cocktail & reception banquets.
- **Total Parties**: Number of invitation envelopes / units.

### 2.5 Spreadsheet Integration (CSV Import & Export)
- **Export to CSV**: Generates a clean spreadsheet file with Party Name, Primary Contact, Phone, Email, Side, Adults, Children, and Notes.
- **Import from CSV**: Parses any standard CSV file, creates family units and primary guests, and automatically validates columns.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface GuestParty {
  id: string;
  weddingId: string;
  partyName: string; // e.g. "Kapoor Family"
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
  ageCategory: 'adult' | 'child';
  dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'vegan';
  allergies?: string;
  specialAssistance?: string; // e.g. "Wheelchair", "Ground Floor"
}

export interface EventRsvp {
  id: string;
  weddingId: string;
  partyId: string;
  guestId?: string;
  eventId: string;
  status: 'invited' | 'confirmed' | 'declined' | 'tentative';
}
```

IndexedDB Table Indexes:
- `guestParties`: `id, weddingId, side`
- `guests`: `id, partyId, weddingId`
- `eventRsvps`: `id, weddingId, partyId, guestId, eventId`
