# Pillar 5: Travel Arrangements & Pictorial Vehicle Seating

## 1. Overview & Purpose
Transporting dozens or hundreds of wedding guests arriving via flights and trains requires tight coordination between airport pickup shuttles, hire cabs, and personal family vehicles. Planners need to know who is driving, who is riding where, and how to cluster arrivals arriving around the same time into shared Innovas or tempo travellers.

Pillar 5 provides:
- A **Chronological Arrivals & Departures Tracker** for flights and trains.
- **Vehicle Fleet Management** covering commercial shuttles, hire cabs, and personal family vehicles.
- An interactive **Pictorial Automotive Seating Chart** rendering vehicle seat layouts with designated roles (**Driver**, **Co-Driver / Front**, and **Rear Passengers**).
- Guest seating allocation directly from the Guest List.

---

## 2. Key Features & Capabilities

### 2.1 Arrivals & Departures Tracker (`TravelManager.tsx`)
- Tracks incoming and outgoing transit:
  - **Travel Modes**: Flight, Train, Personal Car, Bus.
  - **Carrier & PNR**: Flight number (e.g. *6E 2341*), Train number (*12992 Intercity*), or car registration number.
  - **Origin City & Destination Hub**: e.g., *Mumbai (BOM) &rarr; Udaipur Airport (UDR)*.
  - **Date & Time Stamp**: Helps planners cluster guests arriving in the same 60-minute window for airport fleet pickups.
  - **Direction Indicators**: Visual badge for Pickups (*Arrival*) vs Airport Drops (*Departure*).

### 2.2 Vehicle Fleet Setup
- Supports different automotive categories:
  - **SUV (7-Seater / Innova Crysta)**: 2 front + 3 middle + 2 rear seats.
  - **SUV (6-Seater Captain)**: 2 front + 2 captain chairs + 2 rear seats.
  - **Sedan (4-Seater)**: 2 front + 2 rear seats.
  - **Tempo Traveller (12-Seater)**: Group van for large family delegations.
  - **Personal Car vs. Commercial Cab**: Flag differentiating family-driven vehicles (where a family member accommodates other guests) from hired commercial chauffeurs.
- Driver information: Driver name, phone number, vehicle plate number.

### 2.3 Pictorial Automotive Seating Layout
- Each vehicle card renders an **overhead visual car chassis diagram**:
  - **Windshield Marker**: Clearly indicates the front of the vehicle.
  - **Driver Seat**: Marked with steering wheel badge `[D]` in warm amber.
  - **Co-Driver Seat**: Front passenger seat beside the driver.
  - **Middle Row**: Passenger seats.
  - **Rear Row**: Third-row passenger seats.
- **Click-to-Seat Interaction**: Clicking any seat opens a dialog to:
  - Designate role (*Driver*, *Co-Driver*, *Passenger*).
  - Pick the assigned guest from the Guest List.
  - Clear/unassign seat with 1 click.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface TravelItem {
  id: string;
  weddingId: string;
  partyId?: string;
  guestIds: string[];
  direction: 'arrival' | 'departure';
  mode: 'flight' | 'train' | 'personal_car' | 'bus';
  carrierNumber?: string;
  originCity?: string;
  destinationHub?: string;
  dateTime: string;
  pnr?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  weddingId: string;
  name: string; // e.g. "Innova Crysta 1", "Rohan's Fortuner"
  category: 'sedan_4' | 'suv_6' | 'suv_7' | 'tempo_12' | 'bus_30' | 'personal_car';
  plateNumber?: string;
  isPersonalVehicle: boolean;
  ownerGuestId?: string;
  driverName?: string;
  driverPhone?: string;
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

IndexedDB Table Indexes:
- `travelItems`: `id, weddingId, partyId, direction, dateTime`
- `vehicles`: `id, weddingId, category, isPersonalVehicle`
- `vehicleSeats`: `id, weddingId, vehicleId, seatIndex, guestId`
