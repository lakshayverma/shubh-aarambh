// TypeScript models for all 7 pillars of Indian Wedding Management

export interface WeddingCustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
  card?: string;
  textMain?: string;
}

export interface Wedding {
  id: string;
  title: string;
  brideName: string;
  groomName: string;
  brideSideName: string; // e.g. "Ladkiwale (Sharma Family)"
  groomSideName: string; // e.g. "Ladkewale (Verma Family)"
  brideSideTerm?: string; // e.g. "Bride's Side", "Ladkiwale", "Team Ananya"
  groomSideTerm?: string; // e.g. "Groom's Side", "Ladkewale", "Team Aarav"
  startDate: string;
  endDate: string;
  primaryDate: string; // Wedding day / Muhurat date
  city: string;
  venue: string;
  coverImage?: string;
  theme: string;
  customColors?: WeddingCustomColors;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  type: 'mehendi' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'roka' | 'cocktail' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  dressCode: string;
  notes?: string;
  orderIndex: number;
}

export interface Tag {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier e.g. 'Star', 'Heart', 'Shield', 'Music'
  color: string; // Hex color code or css color class
  scope: 'wedding' | 'global';
  weddingId?: string; // only present if scope === 'wedding'
}

export interface FamilyMember {
  id: string;
  weddingId: string;
  name: string;
  side: 'ladkiwale' | 'ladkewale';
  relation: string; // e.g. "Mother", "Father", "Sister", "Brother", "Mama", "Chacha", "Bua", "Nana", "Dada", "Cousin"
  generationLevel: number; // 1: Grandparents, 2: Parents/Uncles, 3: Couple/Siblings/Cousins, 4: Children
  phone?: string;
  email?: string;
  roleTitle?: string; // e.g. "Baraat Reception Lead", "Room Key Coordinator", "Safawala POC"
  tagIds: string[];
  notes?: string;
  parentId?: string; // for hierarchical family tree
}

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
  ageCategory: 'adult' | 'child' | 'infant' | 'elder';
  dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'vegan';
  isPrimaryContact?: boolean;
  relationToBride?: string;
  relationToGroom?: string;
  generationLevel?: number; // 1: Grandparent/Elder, 2: Parents/Uncles, 3: Couple/Siblings/Cousins, 4: Kids
  tagIds?: string[];
  allergies?: string;
  specialAssistance?: string; // e.g. "Wheelchair", "Ground Floor", "Elderly Care"
}

export interface EventRsvp {
  id: string;
  weddingId: string;
  partyId: string;
  guestId?: string;
  eventId: string;
  status: 'invited' | 'confirmed' | 'declined' | 'tentative';
}

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
  roomType: string; // e.g. "Deluxe Room", "Royal Suite", "Pool Villa"
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

export interface TravelItem {
  id: string;
  weddingId: string;
  partyId?: string;
  guestIds: string[];
  direction: 'arrival' | 'departure';
  mode: 'flight' | 'train' | 'personal_car' | 'bus';
  carrierNumber?: string; // Flight number / Train number
  originCity?: string;
  destinationHub?: string; // e.g. "Udaipur Airport (UDR)", "Railway Station"
  dateTime: string;
  pnr?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  weddingId: string;
  name: string; // e.g. "Innova Cresta 1", "Tempo Traveller A", "Groom's Brother Fortuner"
  category: 'sedan_4' | 'sedan_5' | 'suv_6' | 'suv_7' | 'tempo_12' | 'van_14' | 'bus_30' | 'personal_car';
  plateNumber?: string;
  isPersonalVehicle: boolean;
  ownerGuestId?: string;
  driverName?: string;
  driverPhone?: string;
  driveSide?: 'RHD' | 'LHD'; // RHD (Right Hand Drive - India/UK/Aus) vs LHD (Left Hand Drive - US/Canada)
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

export interface SeatingPlan {
  id: string;
  weddingId: string;
  eventId: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface FloorPlanElement {
  id: string;
  seatingPlanId: string;
  type: 'round_table' | 'rect_table' | 'lounge_sofa' | 'mandap' | 'stage' | 'dance_floor' | 'bar' | 'buffet' | 'custom';
  label: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  capacity: number;
}

export interface TableSeatAssignment {
  id: string;
  elementId: string;
  seatNumber: number;
  guestId: string;
}

export interface EInvite {
  id: string;
  weddingId: string;
  title: string;
  slug: string;
  inviteType: 'whole_wedding' | 'ceremony_only' | 'initial_events' | 'party_only';
  templateStyle: 'royal_mandala' | 'modern_minimal' | 'floral_mughal' | 'palace_arch';
  templateId?: 'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory';
  includedEventIds: string[];
  coverGreeting: string;
  hostFamilyNames: string;
  customMessage: string;
  themeColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  rsvpPhone?: string;
  googleMapsUrl?: string;
  createdAt: number;
}
