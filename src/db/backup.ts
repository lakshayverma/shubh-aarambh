import { db } from './index';

export interface BackupData {
  version: number;
  exportedAt: string;
  weddings: any[];
  events: any[];
  tags: any[];
  familyMembers: any[];
  guestParties: any[];
  guests: any[];
  eventRsvps: any[];
  hotels: any[];
  rooms: any[];
  roomAllocations: any[];
  travelItems: any[];
  vehicles: any[];
  vehicleSeats: any[];
  seatingPlans: any[];
  floorPlanElements: any[];
  tableSeatAssignments: any[];
  eInvites: any[];
  familyRelations?: any[];
}

/**
 * Exports the entire IndexedDB database to a downloadable JSON file
 */
export async function exportDatabaseToJson(): Promise<string> {
  const [
    weddings,
    events,
    tags,
    familyMembers,
    guestParties,
    guests,
    eventRsvps,
    hotels,
    rooms,
    roomAllocations,
    travelItems,
    vehicles,
    vehicleSeats,
    seatingPlans,
    floorPlanElements,
    tableSeatAssignments,
    eInvites,
    familyRelations,
  ] = await Promise.all([
    db.weddings.toArray(),
    db.events.toArray(),
    db.tags.toArray(),
    db.familyMembers.toArray(),
    db.guestParties.toArray(),
    db.guests.toArray(),
    db.eventRsvps.toArray(),
    db.hotels.toArray(),
    db.rooms.toArray(),
    db.roomAllocations.toArray(),
    db.travelItems.toArray(),
    db.vehicles.toArray(),
    db.vehicleSeats.toArray(),
    db.seatingPlans.toArray(),
    db.floorPlanElements.toArray(),
    db.tableSeatAssignments.toArray(),
    db.eInvites.toArray(),
    db.familyRelations.toArray(),
  ]);

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    weddings,
    events,
    tags,
    familyMembers,
    guestParties,
    guests,
    eventRsvps,
    hotels,
    rooms,
    roomAllocations,
    travelItems,
    vehicles,
    vehicleSeats,
    seatingPlans,
    floorPlanElements,
    tableSeatAssignments,
    eInvites,
    familyRelations,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Triggers a browser file download of the JSON backup
 */
export async function downloadBackupFile() {
  const json = await exportDatabaseToJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `vivah-planner-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and restores database from a JSON backup string
 */
export async function importDatabaseFromJson(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data: BackupData = JSON.parse(jsonString);

    if (!data.weddings || !Array.isArray(data.weddings)) {
      throw new Error('Invalid backup file format: missing weddings collection');
    }

    await db.transaction('rw', db.tables, async () => {
      // Clear existing records
      await Promise.all(db.tables.map((table) => table.clear()));

      // Restore records
      if (data.weddings?.length) await db.weddings.bulkAdd(data.weddings);
      if (data.events?.length) await db.events.bulkAdd(data.events);
      if (data.tags?.length) await db.tags.bulkAdd(data.tags);
      if (data.familyMembers?.length) await db.familyMembers.bulkAdd(data.familyMembers);
      if (data.guestParties?.length) await db.guestParties.bulkAdd(data.guestParties);
      if (data.guests?.length) await db.guests.bulkAdd(data.guests);
      if (data.eventRsvps?.length) await db.eventRsvps.bulkAdd(data.eventRsvps);
      if (data.hotels?.length) await db.hotels.bulkAdd(data.hotels);
      if (data.rooms?.length) await db.rooms.bulkAdd(data.rooms);
      if (data.roomAllocations?.length) await db.roomAllocations.bulkAdd(data.roomAllocations);
      if (data.travelItems?.length) await db.travelItems.bulkAdd(data.travelItems);
      if (data.vehicles?.length) await db.vehicles.bulkAdd(data.vehicles);
      if (data.vehicleSeats?.length) await db.vehicleSeats.bulkAdd(data.vehicleSeats);
      if (data.seatingPlans?.length) await db.seatingPlans.bulkAdd(data.seatingPlans);
      if (data.floorPlanElements?.length) await db.floorPlanElements.bulkAdd(data.floorPlanElements);
      if (data.tableSeatAssignments?.length) await db.tableSeatAssignments.bulkAdd(data.tableSeatAssignments);
      if (data.eInvites?.length) await db.eInvites.bulkAdd(data.eInvites);
      if (data.familyRelations?.length) await db.familyRelations.bulkAdd(data.familyRelations);
    });

    return { success: true, message: `Successfully restored ${data.weddings.length} weddings and all related records.` };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to import backup.' };
  }
}
