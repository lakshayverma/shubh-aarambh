# Pillar 5: Travel Arrangements, Fleet & Pictorial Vehicle Seating

## 1. Overview & Purpose
Destination Indian weddings require moving hundreds of guests between airports, railway stations, and heritage venues. Pillar 5 provides arrival tracking and a pictorial vehicle seating planner with drag-and-drop allocation.

---

## 2. Key Features & Capabilities

### 2.1 15–85% Split Drag-and-Drop Seating Planner (`TravelManager.tsx`)
- **Left 15–20% Sticky Guest Tray**:
  - Displays all guests with search and filtering by *All*, *Attending*, *Unseated*, and *Seated*.
  - Draggable HTML5 guest chips with age emojis (👴 Elder, 👤 Adult, 🧒 Child, 👶 Infant).
  - Status indicators showing current vehicle assignment.
- **Right 80–85% Fleet Grid**:
  - Displays automotive chassis cards for every commercial shuttle, rental van, or personal car.
  - Interactive droppable seat zones: drag any guest onto any seat to assign instantly.
  - Dedicated **Clear / Unassign button (`X`)** on each seat with immediate reactive database deletion and thorough multi-ID cleanup.
  - Click-to-assign drawer for touch screens and mobile devices.
- **Multi-Row Seating Matrices for All Categories**:
  - Supports 5-seater Sedans, 7-seater SUVs, 12-seater Vans (`van_12`), 14-seater Vans (`van_14`), and 16-seater Vans (`van_16`).
  - Dynamic multi-row chassis rendering ensures all 12, 14, or 16 seats are fully rendered with proper cabin and passenger rows.
- **NestedScreen Drawers**: All modals (Add/Edit Vehicle, Log Travel Arrival, and Click-to-Assign Seat) utilize `NestedScreen` slide-in right drawers with global `Esc` key support.

### 2.2 Right-Hand Drive (RHD) vs Left-Hand Drive (LHD) Steering
- **RHD (India, UK, Australia)**: Front row places Co-Driver on Left, Driver on Right with steering wheel icon.
- **LHD (USA, Canada)**: Front row places Driver on Left with steering wheel icon, Co-Driver on Right.
- **Instant Flip Button**: 1-click toggle button on every car card to switch steering orientation on the fly.

### 2.3 Luggage Boot Capacity (Trunk Space)
- Visual rear boot zone on vehicle diagrams showing bag slots and suitcase icons (`🧳`).
- Planners configure bag capacity per vehicle (e.g. 4 check-in bags for Innova, 10-14 for Vans/Travellers, 6 for Suburban).
- Aggregate fleet luggage capacity metrics.

### 2.4 Country Vehicle Presets Dropdown
Pre-configured vehicle models grouped by country:
- **India (🇮🇳)**: Toyota Innova Crysta (7s), Innova Hycross (7s), Force Urbania Executive (12s), Force Urbania/Traveller (14s), Force Traveller Super Luxury (16s), Maruti Ertiga (7s), Mahindra Scorpio-N (7s), Toyota Fortuner (7s), Mercedes-Benz E-Class (5s), Honda City (5s).
- **USA (🇺🇸)**: Cadillac Escalade ESV (7s), Chevrolet Suburban/Tahoe (7s), Ford Transit Passenger Van (12s & 14s), Chevrolet Express Van (16s), GMC Yukon XL (8s), Chrysler Pacifica (7s), Tesla Model X (7s).
- **Canada (🇨🇦)**: Toyota Sienna AWD (7s), Ford Expedition Max (8s), Chevrolet Express Van (12s), Ford Transit Passenger Wagon (14s), GMC Savana Van (16s), Honda Odyssey (8s).
- **Australia (🇦🇺)**: Toyota LandCruiser Prado (7s), Toyota HiAce Commuter (12s & 14s), Mercedes-Benz Sprinter (16s), Kia Carnival (8s), Hyundai Staria (8s).
- **UK (🇬🇧)**: Mercedes-Benz V-Class (7s), Ford Transit Minibus (12s & 14s), Mercedes-Benz Sprinter Minibus (16s), Range Rover LWB (7s), VW Multivan (7s).

### 2.5 Flight & Train Arrival Tracker
- Chronological arrival logs with airport/station pickup batching, carrier flight numbers, and PNRs.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface Vehicle {
  id: string;
  weddingId: string;
  name: string;
  category: 'sedan_4' | 'sedan_5' | 'suv_6' | 'suv_7' | 'tempo_12' | 'van_14' | 'bus_30' | 'personal_car';
  plateNumber?: string;
  isPersonalVehicle: boolean;
  ownerGuestId?: string;
  driverName?: string;
  driverPhone?: string;
  driveSide?: 'RHD' | 'LHD';
  luggageCapacityBags?: number;
  countryPreset?: string;
  status: 'scheduled' | 'dispatched' | 'completed';
}

export interface VehicleSeat {
  id: string;
  weddingId: string;
  vehicleId: string;
  seatIndex: number;
  seatRole: 'driver' | 'co_driver' | 'passenger';
  guestId?: string;
}
```
