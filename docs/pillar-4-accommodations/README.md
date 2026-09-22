# Pillar 4: Accommodations & Hotel Room Grid

## 1. Overview & Purpose
Indian weddings (especially destination weddings in cities like Udaipur, Jaipur, Goa, or Delhi NCR) often involve complete hotel buyouts or multi-property room blocks. Managing hotel inventory, check-in dates, interconnecting rooms for families with toddlers, and delivering welcome hampers is a major logistical undertaking.

Pillar 4 provides:
- **Multi-Hotel / Property Setup** (e.g. Primary Venue Palace + overflow hotel blocks).
- **Hotel Floor & Room Grid Layout** categorized by room types.
- Real-time **Room Occupancy Badges** (Vacant vs. Occupied).
- Guest allocation drawer from the Pillar 3 Guest List.
- **Welcome Hamper Delivery Tracker** with gift box toggle.
- **Printable Front Desk Rooming List** for hotel check-in desks.

---

## 2. Key Features & Capabilities

### 2.1 Hotel Room Grid Layout (`AccommodationsManager.tsx`)
- Renders visual room cards organized by hotel property and room category (e.g. *Royal Suite*, *Grand Heritage Lake View*, *Pool Villa*).
- Visual Status Indicator:
  - **Vacant Room**: Dashed border with emerald status badge and "+ Assign Guests" trigger.
  - **Occupied Room**: Solid card border with blue badge, allocated party name, side tag, check-in date range, and notes.

### 2.2 Room Attributes & Accessibility Markers
- **Room Number & Floor/Wing**: Displays location details (e.g. *Ground Floor / East Wing*).
- **Interconnecting Rooms Flag**: Renders a link icon indicating rooms that share an internal connecting door—ideal for parents with teenage children or large family units.
- **Capacity Limits**: Tracks adult capacity (e.g. 2 adults) and child capacity (e.g. 1 extra bed/rollaway).

### 2.3 Guest Room Allocation Drawer
- Clicking "+ Assign Guests to Room" opens an allocation drawer.
- Planners select a family party from Pillar 3.
- Sets specific Check-In and Check-Out dates.
- Records hospitality instructions (e.g. *Low floor requested for elder*, *Extra rollaway bed required*).

### 2.4 Welcome Hamper Delivery Tracking
- In Indian hospitality, traditional welcome gift baskets (dry fruits, wedding itinerary booklets, savories, and keycards) are placed in guest rooms prior to arrival.
- Each occupied room card features a 1-click **Welcome Hamper Delivered / Pending** toggle with gift box icon.
- The metrics bar tracks total hampers delivered vs pending across the entire hotel.

### 2.5 Printable Front Desk Rooming List
- Clicking "Print Rooming List" formats all room inventory, guest names, dates, hamper status, and special notes into a clean, printable HTML document.
- Ready to hand over to hotel duty managers and front desk teams for seamless arrival check-in.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface Hotel {
  id: string;
  weddingId: string;
  name: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface Room {
  id: string;
  weddingId: string;
  hotelId: string;
  roomNumber: string;
  roomType: string; // e.g. "Royal Suite", "Deluxe Lake View"
  capacityAdults: number;
  capacityChildren: number;
  floorWing?: string;
  isInterconnecting?: boolean;
  interconnectingWithRoomId?: string;
  tagIds: string[];
}

export interface RoomAllocation {
  id: string;
  weddingId: string;
  roomId: string;
  partyId?: string;
  guestIds: string[];
  checkInDate: string;
  checkInTime?: string;
  checkOutDate: string;
  checkOutTime?: string;
  welcomeHamperDelivered: boolean;
  specialRequests?: string;
}
```

IndexedDB Table Indexes:
- `hotels`: `id, weddingId`
- `rooms`: `id, weddingId, hotelId, roomNumber`
- `roomAllocations`: `id, weddingId, roomId, partyId`
