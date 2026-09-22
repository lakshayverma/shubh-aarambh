import Dexie, { Table } from 'dexie';
import {
  Wedding,
  WeddingEvent,
  Tag,
  FamilyMember,
  GuestParty,
  Guest,
  EventRsvp,
  Hotel,
  Room,
  RoomAllocation,
  TravelItem,
  Vehicle,
  VehicleSeat,
  SeatingPlan,
  FloorPlanElement,
  TableSeatAssignment,
  EInvite,
} from './schema';

export class VivahDatabase extends Dexie {
  weddings!: Table<Wedding, string>;
  events!: Table<WeddingEvent, string>;
  tags!: Table<Tag, string>;
  familyMembers!: Table<FamilyMember, string>;
  guestParties!: Table<GuestParty, string>;
  guests!: Table<Guest, string>;
  eventRsvps!: Table<EventRsvp, string>;
  hotels!: Table<Hotel, string>;
  rooms!: Table<Room, string>;
  roomAllocations!: Table<RoomAllocation, string>;
  travelItems!: Table<TravelItem, string>;
  vehicles!: Table<Vehicle, string>;
  vehicleSeats!: Table<VehicleSeat, string>;
  seatingPlans!: Table<SeatingPlan, string>;
  floorPlanElements!: Table<FloorPlanElement, string>;
  tableSeatAssignments!: Table<TableSeatAssignment, string>;
  eInvites!: Table<EInvite, string>;

  constructor() {
    super('VivahPlannerDB');

    this.version(1).stores({
      weddings: 'id, primaryDate, createdAt, updatedAt',
      events: 'id, weddingId, date, orderIndex',
      tags: 'id, scope, weddingId',
      familyMembers: 'id, weddingId, side, relation, generationLevel',
      guestParties: 'id, weddingId, side',
      guests: 'id, partyId, weddingId',
      eventRsvps: 'id, weddingId, partyId, guestId, eventId',
      hotels: 'id, weddingId',
      rooms: 'id, weddingId, hotelId, roomNumber',
      roomAllocations: 'id, weddingId, roomId, partyId',
      travelItems: 'id, weddingId, partyId, direction, dateTime',
      vehicles: 'id, weddingId, category, isPersonalVehicle',
      vehicleSeats: 'id, weddingId, vehicleId, seatIndex, guestId',
      seatingPlans: 'id, weddingId, eventId',
      floorPlanElements: 'id, seatingPlanId, type',
      tableSeatAssignments: 'id, elementId, guestId',
      eInvites: 'id, weddingId, slug',
    });
  }
}

export const db = new VivahDatabase();
