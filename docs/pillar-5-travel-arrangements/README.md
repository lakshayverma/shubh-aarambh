# Pillar 5: Travel Arrangements, Fleet & Pictorial Vehicle Seating

## 1. Overview & Purpose
Destination Indian weddings require moving hundreds of guests between airports, railway stations, and heritage venues. Pillar 5 provides arrival tracking and a pictorial vehicle seating planner with drag-and-drop allocation.

---

## 2. Key Features & Capabilities

### 2.1 15–85% Split Drag-and-Drop Seating Planner (`TravelManager.tsx`)
- **Left 15–20% Sticky Guest Tray**:
  - Displays all guests with search and filtering by *All*, *Unseated*, and *Seated*.
  - Draggable HTML5 guest chips with age emojis (👴 Elder, 👤 Adult, 🧒 Child, 👶 Infant).
  - Status indicators showing current vehicle assignment.
- **Right 80–85% Fleet Grid**:
  - Displays automotive chassis cards for every commercial shuttle, rental van, or personal car.
  - Interactive droppable seat zones: drag any guest onto any seat to assign instantly.
  - Dedicated **Clear / Unassign button (`X`)** on each seat with immediate reactive database deletion.
  - Click-to-assign modal for non-drag touch devices.

### 2.2 Right-Hand Drive (RHD) vs Left-Hand Drive (LHD) Steering
- **RHD (India, UK, Australia)**: Front row places Co-Driver on Left, Driver on Right with steering wheel icon.
- **LHD (USA, Canada)**: Front row places Driver on Left with steering wheel icon, Co-Driver on Right.
- **Instant Flip Button**: 1-click toggle button on every car card to switch steering orientation on the fly.

### 2.3 Luggage Boot Capacity (Trunk Space)
- Visual rear boot zone on vehicle diagrams showing bag slots and suitcase icons (`🧳`).
- Planners configure bag capacity per vehicle (e.g. 4 check-in bags for Innova, 6 for Suburban).
- Aggregate fleet luggage capacity metrics.

### 2.4 Country Vehicle Presets Dropdown
Pre-configured vehicle models grouped by country:
- **India (🇮🇳)**: Toyota Innova Crysta, Innova Hycross, Maruti Ertiga, Mahindra Scorpio-N, Mahindra XUV700, Toyota Fortuner, Force Urbania/Traveller (14s), Mercedes-Benz E-Class, Honda City.
- **USA (🇺🇸)**: Cadillac Escalade ESV, Chevrolet Suburban/Tahoe, GMC Yukon XL, Chrysler Pacifica, Ford Transit Van (14s), Tesla Model X, Lincoln Navigator.
- **Canada (🇨🇦)**: Toyota Sienna AWD, Ford Expedition Max, Honda Odyssey, Subaru Ascent, Chevrolet Express Van.
- **Australia (🇦🇺)**: Toyota LandCruiser Prado, Kia Carnival, Toyota HiAce Commuter, Hyundai Staria, Mazda CX-90.
- **UK (🇬🇧)**: Mercedes-Benz V-Class, Range Rover LWB, VW Multivan, Ford Tourneo Custom.

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
