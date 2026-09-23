# Offline Database & Persistence Module

> **Path**: `src/db/`  
> **Classification**: Offline Data Layer (IndexedDB via Dexie.js v4)  
> **Dependencies**: `dexie`, `dexie-react-hooks`  
> **Parent Specification**: [`DESIGN.md` Section 8](../../DESIGN.md) & [`AGENTS.md` Section 3](../../AGENTS.md)

---

## 1. Module Overview

Vivah Planner adheres strictly to a **100% client-side, zero-cloud offline-first** data architecture. All application data lives in the browser's IndexedDB instance (`VivahPlannerDB`), wrapped with `Dexie.js v4`.

```
src/db/
├── index.ts        # VivahDatabase class, table declarations, and indexed stores
├── schema.ts       # Canonical TypeScript models and interfaces for all 7 pillars
├── sampleData.ts   # Rich Indian wedding seed data generator for first-time onboarding
└── backup.ts       # Full JSON export and atomic database restore pipeline
```

---

## 2. Store Definitions & Indexes

Configured in `src/db/index.ts`:

```typescript
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
  familyRelations: 'id, weddingId, fromMemberId, toMemberId',
});
```

---

## 3. Query Guidelines & Rules

### 3.1 Always Query by Indexed Keys
- **Permitted**:
  ```typescript
  const guests = await db.guests.where('weddingId').equals(weddingId).toArray();
  ```
- **Prohibited**:
  ```typescript
  // Scanning the entire table in memory is forbidden:
  const allGuests = await db.guests.toArray();
  const guests = allGuests.filter(g => g.weddingId === weddingId);
  ```

### 3.2 Reactive UI with `useLiveQuery`
- Always wrap table subscriptions with `useLiveQuery` from `dexie-react-hooks`.
- Ensure all query dependencies (e.g. `wedding.id`, `activeEventId`) are declared in the dependency array.

### 3.3 Atomic Bulk Transactions
- When modifying multiple related tables (e.g., updating a guest, their RSVPs, and assigned seat), wrap operations inside a Dexie transaction:
  ```typescript
  await db.transaction('rw', [db.guests, db.eventRsvps, db.tableSeatAssignments], async () => {
    await db.guests.bulkPut(updatedGuests);
    await db.eventRsvps.bulkPut(updatedRsvps);
  });
  ```

---

## 4. Backup & Disaster Recovery (`backup.ts`)

- **JSON Backup Generation**: Serializes all IndexedDB tables into a single timestamped JSON file (`vivah-planner-backup-[date].json`).
- **Atomic Database Restore**: Clears existing tables and batch-inserts the backup records within an atomic transaction. If any record fails validation, the entire transaction rolls back, preserving data integrity.
