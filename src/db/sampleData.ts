import { db } from './index';
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
  FamilyRelationLink,
} from './schema';

export async function seedSampleWedding(): Promise<string> {
  const weddingId = 'sample-wedding-aarav-ananya';

  // Check if already seeded
  const existing = await db.weddings.get(weddingId);
  if (existing) {
    return weddingId;
  }

  // Calculate realistic future dates for an Indian wedding
  const today = new Date();
  const d1 = new Date(today);
  d1.setDate(today.getDate() + 45); // Day 1
  const d2 = new Date(today);
  d2.setDate(today.getDate() + 46); // Day 2
  const d3 = new Date(today);
  d3.setDate(today.getDate() + 47); // Day 3

  const date1 = d1.toISOString().split('T')[0];
  const date2 = d2.toISOString().split('T')[0];
  const date3 = d3.toISOString().split('T')[0];

  const sampleWedding: Wedding = {
    id: weddingId,
    title: 'Aarav & Ananya — The Royal Udaipur Vivah',
    brideName: 'Ananya Sharma',
    groomName: 'Aarav Verma',
    brideSideName: 'Sharma Pariwaar',
    groomSideName: 'Verma Pariwaar',
    brideSideTerm: 'Bride’s Side (Ladkiwale)',
    groomSideTerm: 'Groom’s Side (Ladkewale)',
    startDate: date1,
    endDate: date3,
    primaryDate: date2,
    city: 'Udaipur, Rajasthan',
    venue: 'The Leela Palace Udaipur',
    theme: 'royal-festive',
    customColors: {
      primary: '#7B1113',
      secondary: '#D97706',
      accent: '#B45309',
      background: '#FCFBF7',
      card: '#FFFFFF',
      textMain: '#271E1D',
    },
    notes: 'Destination wedding with 250 guests across 3 days of grand celebrations.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Pillar 1: Ceremonies / Events
  const events: WeddingEvent[] = [
    {
      id: 'evt-mehendi',
      weddingId,
      name: 'Phoolon Ki Mehendi',
      type: 'mehendi',
      date: date1,
      startTime: '11:00',
      endTime: '15:00',
      venue: 'Guava Garden & Poolside',
      dressCode: 'Vibrant Floral / Shades of Green & Yellow',
      notes: 'Live bangle makers, chaat counters, and Rajasthani folk dholak.',
      orderIndex: 1,
      sideScope: 'bride_only',
    },
    {
      id: 'evt-sangeet',
      weddingId,
      name: 'Sur Taal Sangeet Night',
      type: 'sangeet',
      date: date1,
      startTime: '19:30',
      endTime: '01:00',
      venue: 'Grand Mewar Ballroom',
      dressCode: 'Glamorous Indo-Western / Sequins & Tuxedos',
      notes: 'Family dance performances, DJ night, cocktail bar.',
      orderIndex: 2,
      sideScope: 'common',
    },
    {
      id: 'evt-haldi',
      weddingId,
      name: 'Peeley Rang Haldi & Pool Party',
      type: 'haldi',
      date: date2,
      startTime: '10:00',
      endTime: '13:00',
      venue: 'Lake Terrace Lawn',
      dressCode: 'Sunshine Yellow / Kurta & Lehariya',
      notes: 'Organic flower petal haldi followed by dhol pool splash.',
      orderIndex: 3,
      sideScope: 'groom_only',
    },
    {
      id: 'evt-wedding',
      weddingId,
      name: 'Shubh Vivah & Royal Pheras',
      type: 'wedding',
      date: date2,
      startTime: '18:00',
      endTime: '22:30',
      venue: 'Sunset Courtyard & Lakeside Mandap',
      dressCode: 'Royal Traditional / Regal Sherwani & Bridal Red/Pastel',
      notes: 'Royal boat baraat entry, jaimala by the lake, sacred agni pheras.',
      orderIndex: 4,
      sideScope: 'common',
    },
    {
      id: 'evt-reception',
      weddingId,
      name: 'Grand Royal Reception Gala',
      type: 'reception',
      date: date3,
      startTime: '20:00',
      endTime: '23:30',
      venue: 'Palace Amphitheater & Gardens',
      dressCode: 'Black Tie Formal / Elegant Silks & Zari',
      notes: 'Formal couple dinner, live symphony, multi-course feast.',
      orderIndex: 5,
      sideScope: 'common',
    },
  ];

  // Tags (Unified with Core Family, Coordinators, and Dietary Preferences)
  const tags: Tag[] = [
    { id: 'tag-core-family', name: 'Core Family', icon: 'Crown', color: '#D97706', scope: 'global' },
    { id: 'tag-coordinator', name: 'Event Coordinator', icon: 'Briefcase', color: '#4F46E5', scope: 'global' },
    { id: 'tag-diet-veg', name: 'Pure Veg', icon: 'Utensils', color: '#16A34A', scope: 'global' },
    { id: 'tag-diet-jain', name: 'Jain Food', icon: 'Sparkles', color: '#059669', scope: 'global' },
    { id: 'tag-diet-nonveg', name: 'Non-Veg', icon: 'Flame', color: '#DC2626', scope: 'global' },
    { id: 'tag-diet-vegan', name: 'Vegan', icon: 'Leaf', color: '#65A30D', scope: 'global' },
    { id: 'tag-vip', name: 'VIP Guest', icon: 'Star', color: '#9333EA', scope: 'global' },
    { id: 'tag-elderly', name: 'Elderly Care', icon: 'HeartHandshake', color: '#BE185D', scope: 'global' },
    { id: 'tag-dancer', name: 'Sangeet Performer', icon: 'Sparkles', color: '#7C3AED', scope: 'wedding', weddingId },
    { id: 'tag-baraat-lead', name: 'Baraat Coordinator', icon: 'Flag', color: '#C2410C', scope: 'wedding', weddingId },
  ];

  // Pillar 2: Family Information
  const familyMembers: FamilyMember[] = [
    {
      id: 'fam-g-dad',
      weddingId,
      name: 'Rajesh Verma',
      side: 'ladkewale',
      relation: 'Father',
      generationLevel: 2,
      phone: '+91 98100 11223',
      roleTitle: 'Chief Host (Ladkewale)',
      tagIds: ['tag-vip'],
      notes: 'Supervises all vendor logistics and ceremonies.',
    },
    {
      id: 'fam-g-mom',
      weddingId,
      name: 'Sunita Verma',
      side: 'ladkewale',
      relation: 'Mother',
      generationLevel: 2,
      phone: '+91 98100 11224',
      roleTitle: 'Pooja & Rituals Lead',
      tagIds: ['tag-vip'],
      notes: 'Coordinates with Pandit ji for all muhurat items.',
    },
    {
      id: 'fam-g-bro',
      weddingId,
      name: 'Kabir Verma',
      side: 'ladkewale',
      relation: 'Brother',
      generationLevel: 3,
      phone: '+91 98100 11225',
      roleTitle: 'Baraat & Safa Coordinator',
      tagIds: ['tag-baraat-lead', 'tag-dancer'],
      notes: 'Managing vintage car entry and DJ setup.',
    },
    {
      id: 'fam-b-dad',
      weddingId,
      name: 'Deepak Sharma',
      side: 'ladkiwale',
      relation: 'Father',
      generationLevel: 2,
      phone: '+91 98200 22331',
      roleTitle: 'Chief Host (Ladkiwale)',
      tagIds: ['tag-vip'],
      notes: 'Oversees guest welcoming and room allocations.',
    },
    {
      id: 'fam-b-mom',
      weddingId,
      name: 'Meenakshi Sharma',
      side: 'ladkiwale',
      relation: 'Mother',
      generationLevel: 2,
      phone: '+91 98200 22332',
      roleTitle: 'Catering & Hospitality Lead',
      tagIds: ['tag-vip'],
      notes: 'Reviews all banquet menus and dietary needs.',
    },
    {
      id: 'fam-b-sis',
      weddingId,
      name: 'Rhea Sharma',
      side: 'ladkiwale',
      relation: 'Sister',
      generationLevel: 3,
      phone: '+91 98200 22333',
      roleTitle: 'Bride Squad & Joota Chupai Lead',
      tagIds: ['tag-dancer'],
      notes: 'Bride makeup artist point of contact.',
    },
    {
      id: 'fam-b-nana',
      weddingId,
      name: 'O.P. Sharma',
      side: 'ladkiwale',
      relation: 'Nana (Grandfather)',
      generationLevel: 1,
      phone: '+91 98200 22334',
      roleTitle: 'Family Elder',
      tagIds: ['tag-vip', 'tag-elderly'],
      notes: 'Requires ground floor accommodation and golf cart transit.',
    },
  ];

  // Pillar 3: Guest List
  const guestParties: GuestParty[] = [
    {
      id: 'pty-verma-core',
      weddingId,
      partyName: 'Verma Core Family (Groom)',
      primaryContactName: 'Rajesh Verma',
      phone: '+91 98111 22233',
      email: 'rajesh.verma@example.com',
      side: 'ladkewale',
      adultsCount: 4,
      childrenCount: 0,
      tagIds: ['tag-vip'],
      notes: 'Immediate Core Family of Groom Aarav.',
    },
    {
      id: 'pty-sharma-core',
      weddingId,
      partyName: 'Sharma Core Family (Bride)',
      primaryContactName: 'Ramesh Sharma',
      phone: '+91 98222 33344',
      email: 'ramesh.sharma@example.com',
      side: 'ladkiwale',
      adultsCount: 3,
      childrenCount: 0,
      tagIds: ['tag-vip'],
      notes: 'Immediate Core Family of Bride Ananya.',
    },
    {
      id: 'pty-malhotra',
      weddingId,
      partyName: 'Malhotra Family',
      primaryContactName: 'Vikram Malhotra',
      phone: '+91 98765 43210',
      email: 'vikram.malhotra@example.com',
      side: 'ladkewale',
      adultsCount: 2,
      childrenCount: 1,
      tagIds: ['tag-vip'],
      notes: 'Close family friends from Mumbai.',
    },
    {
      id: 'pty-gupta',
      weddingId,
      partyName: 'Gupta Family',
      primaryContactName: 'Dr. Alok Gupta',
      phone: '+91 98765 43211',
      email: 'alok.gupta@example.com',
      side: 'ladkiwale',
      adultsCount: 2,
      childrenCount: 0,
      tagIds: ['tag-elderly'],
      notes: 'Maternal uncle family from Jaipur.',
    },
    {
      id: 'pty-kapoor',
      weddingId,
      partyName: 'Rohan & Friends',
      primaryContactName: 'Rohan Kapoor',
      phone: '+91 98765 43212',
      email: 'rohan.k@example.com',
      side: 'mutual',
      adultsCount: 3,
      childrenCount: 0,
      tagIds: ['tag-dancer'],
      notes: 'College friends group.',
    },
  ];

  const guests: Guest[] = [
    // Groom's Core Family
    { id: 'gst-core-1', partyId: 'pty-verma-core', weddingId, name: 'Rajesh Verma', ageCategory: 'elder', dietaryPreference: 'pure_veg', isPrimaryContact: true, relationToGroom: 'Father', isCoreFamily: true, roleTitle: 'Chief Host (Ladkewale)', phone: '+91 98111 22233', email: 'rajesh.verma@example.com', generationLevel: 2, tagIds: ['tag-vip'] },
    { id: 'gst-core-2', partyId: 'pty-verma-core', weddingId, name: 'Sunita Verma', ageCategory: 'elder', dietaryPreference: 'pure_veg', relationToGroom: 'Mother', isCoreFamily: true, roleTitle: 'Pooja & Rituals Lead', phone: '+91 98111 22234', generationLevel: 2, tagIds: ['tag-vip'] },
    { id: 'gst-core-3', partyId: 'pty-verma-core', weddingId, name: 'Rohan Verma', ageCategory: 'adult', dietaryPreference: 'pure_veg', relationToGroom: 'Brother', isCoreFamily: true, roleTitle: 'Baraat & Safa Coordinator', phone: '+91 98111 22235', generationLevel: 3, tagIds: ['tag-dancer'] },
    { id: 'gst-core-4', partyId: 'pty-verma-core', weddingId, name: 'Shanti Devi', ageCategory: 'elder', dietaryPreference: 'pure_veg', relationToGroom: 'Dadi (Paternal Grandmother)', isCoreFamily: true, roleTitle: 'Family Elder & Blessings Lead', specialAssistance: 'Wheelchair assistance', generationLevel: 1, tagIds: ['tag-elderly'] },

    // Bride's Core Family
    { id: 'gst-core-5', partyId: 'pty-sharma-core', weddingId, name: 'Ramesh Sharma', ageCategory: 'elder', dietaryPreference: 'pure_veg', isPrimaryContact: true, relationToBride: 'Father', isCoreFamily: true, roleTitle: 'Chief Host (Ladkiwale)', phone: '+91 98222 33344', email: 'ramesh.sharma@example.com', generationLevel: 2, tagIds: ['tag-vip'] },
    { id: 'gst-core-6', partyId: 'pty-sharma-core', weddingId, name: 'Meena Sharma', ageCategory: 'elder', dietaryPreference: 'pure_veg', relationToBride: 'Mother', isCoreFamily: true, roleTitle: 'Catering & Hospitality Lead', phone: '+91 98222 33345', generationLevel: 2, tagIds: ['tag-vip'] },
    { id: 'gst-core-7', partyId: 'pty-sharma-core', weddingId, name: 'Priya Sharma', ageCategory: 'adult', dietaryPreference: 'pure_veg', relationToBride: 'Sister', isCoreFamily: true, roleTitle: 'Bride Squad & Joota Chupai Lead', phone: '+91 98222 33346', generationLevel: 3, tagIds: ['tag-dancer'] },

    // Other Guests
    { id: 'gst-1', partyId: 'pty-malhotra', weddingId, name: 'Vikram Malhotra', ageCategory: 'adult', dietaryPreference: 'pure_veg', isPrimaryContact: true, relationToGroom: 'Uncle (Chacha)', generationLevel: 2 },
    { id: 'gst-2', partyId: 'pty-malhotra', weddingId, name: 'Pooja Malhotra', ageCategory: 'adult', dietaryPreference: 'pure_veg', relationToGroom: 'Aunt (Chachi)', generationLevel: 2 },
    { id: 'gst-3', partyId: 'pty-malhotra', weddingId, name: 'Aarush Malhotra', ageCategory: 'child', dietaryPreference: 'pure_veg', relationToGroom: 'Cousin', generationLevel: 3 },
    { id: 'gst-4', partyId: 'pty-gupta', weddingId, name: 'Dr. Alok Gupta', ageCategory: 'elder', dietaryPreference: 'jain', isPrimaryContact: true, relationToBride: 'Grandfather / Nana', generationLevel: 1, specialAssistance: 'Ground floor room' },
    { id: 'gst-5', partyId: 'pty-gupta', weddingId, name: 'Neelam Gupta', ageCategory: 'elder', dietaryPreference: 'jain', relationToBride: 'Grandmother / Nani', generationLevel: 1 },
    { id: 'gst-6', partyId: 'pty-kapoor', weddingId, name: 'Rohan Kapoor', ageCategory: 'adult', dietaryPreference: 'non_veg', isPrimaryContact: true, relationToGroom: 'Best Friend', generationLevel: 3 },
    { id: 'gst-7', partyId: 'pty-kapoor', weddingId, name: 'Sameer Sen', ageCategory: 'adult', dietaryPreference: 'pure_veg', relationToGroom: 'College Friend', generationLevel: 3 },
    { id: 'gst-8', partyId: 'pty-kapoor', weddingId, name: 'Tanvi Mehra', ageCategory: 'adult', dietaryPreference: 'vegan', relationToBride: 'School Friend', generationLevel: 3 },
    { id: 'gst-9', partyId: 'pty-malhotra', weddingId, name: 'Baby Malhotra', ageCategory: 'infant', dietaryPreference: 'pure_veg', relationToGroom: 'Baby Niece', generationLevel: 4 },
  ];

  const eventRsvps: EventRsvp[] = [
    { id: 'rsvp-1', weddingId, partyId: 'pty-malhotra', eventId: 'evt-mehendi', status: 'confirmed' },
    { id: 'rsvp-2', weddingId, partyId: 'pty-malhotra', eventId: 'evt-sangeet', status: 'confirmed' },
    { id: 'rsvp-3', weddingId, partyId: 'pty-malhotra', eventId: 'evt-haldi', status: 'confirmed' },
    { id: 'rsvp-4', weddingId, partyId: 'pty-malhotra', eventId: 'evt-wedding', status: 'confirmed' },
    { id: 'rsvp-5', weddingId, partyId: 'pty-malhotra', eventId: 'evt-reception', status: 'confirmed' },
    { id: 'rsvp-6', weddingId, partyId: 'pty-gupta', eventId: 'evt-mehendi', status: 'confirmed' },
    { id: 'rsvp-7', weddingId, partyId: 'pty-gupta', eventId: 'evt-wedding', status: 'confirmed' },
    { id: 'rsvp-8', weddingId, partyId: 'pty-kapoor', eventId: 'evt-sangeet', status: 'confirmed' },
    { id: 'rsvp-9', weddingId, partyId: 'pty-kapoor', eventId: 'evt-wedding', status: 'confirmed' },
  ];

  // Pillar 4: Accommodations
  const hotel: Hotel = {
    id: 'htl-leela',
    weddingId,
    name: 'The Leela Palace Udaipur',
    address: 'Lake Pichola, Udaipur, Rajasthan 313001',
    contactPerson: 'Harsh Vardhan (Hospitality Manager)',
    contactPhone: '+91 294 670 1234',
  };

  const rooms: Room[] = [
    { id: 'rm-101', weddingId, hotelId: 'htl-leela', roomNumber: '101', roomType: 'Grand Heritage Lake View', capacityAdults: 2, capacityChildren: 1, floorWing: 'Ground Floor / East Wing', isInterconnecting: false, tagIds: ['tag-vip', 'tag-elderly'] },
    { id: 'rm-102', weddingId, hotelId: 'htl-leela', roomNumber: '102', roomType: 'Grand Heritage Lake View', capacityAdults: 2, capacityChildren: 1, floorWing: 'Ground Floor / East Wing', isInterconnecting: true, interconnectingWithRoomId: 'rm-103', tagIds: ['tag-vip'] },
    { id: 'rm-103', weddingId, hotelId: 'htl-leela', roomNumber: '103', roomType: 'Royal Suite', capacityAdults: 2, capacityChildren: 2, floorWing: 'Ground Floor / East Wing', isInterconnecting: true, interconnectingWithRoomId: 'rm-102', tagIds: ['tag-vip'] },
    { id: 'rm-201', weddingId, hotelId: 'htl-leela', roomNumber: '201', roomType: 'Luxury Villa', capacityAdults: 3, capacityChildren: 0, floorWing: 'First Floor / Poolside', isInterconnecting: false, tagIds: [] },
  ];

  const roomAllocations: RoomAllocation[] = [
    { id: 'alloc-1', weddingId, roomId: 'rm-101', partyId: 'pty-gupta', guestIds: ['gst-4', 'gst-5'], checkInDate: date1, checkOutDate: date3, welcomeHamperDelivered: true, specialRequests: 'Low floor preferred, quiet room.' },
    { id: 'alloc-2', weddingId, roomId: 'rm-102', partyId: 'pty-malhotra', guestIds: ['gst-1', 'gst-2', 'gst-3'], checkInDate: date1, checkOutDate: date3, welcomeHamperDelivered: true, specialRequests: 'Rollaway extra bed for child.' },
    { id: 'alloc-3', weddingId, roomId: 'rm-201', partyId: 'pty-kapoor', guestIds: ['gst-6', 'gst-7', 'gst-8'], checkInDate: date1, checkOutDate: date3, welcomeHamperDelivered: false },
  ];

  // Pillar 5: Travel Arrangements
  const travelItems: TravelItem[] = [
    { id: 'trv-1', weddingId, partyId: 'pty-malhotra', guestIds: ['gst-1', 'gst-2', 'gst-3'], direction: 'arrival', mode: 'flight', carrierNumber: '6E 2341 (IndiGo)', originCity: 'Mumbai (BOM)', destinationHub: 'Udaipur Airport (UDR)', dateTime: `${date1}T09:45`, pnr: 'WDNG4A', notes: 'Needs SUV pickup with car seat' },
    { id: 'trv-2', weddingId, partyId: 'pty-gupta', guestIds: ['gst-4', 'gst-5'], direction: 'arrival', mode: 'train', carrierNumber: '12992 (Intercity Exp)', originCity: 'Jaipur (JP)', destinationHub: 'Udaipur City Station', dateTime: `${date1}T10:15`, pnr: '2349182391' },
    { id: 'trv-3', weddingId, partyId: 'pty-kapoor', guestIds: ['gst-6', 'gst-7', 'gst-8'], direction: 'arrival', mode: 'personal_car', carrierNumber: 'DL 3C AB 9090', originCity: 'Delhi', destinationHub: 'The Leela Palace Driveway', dateTime: `${date1}T14:00`, notes: 'Self-driving in Rohan’s Fortuner' },
  ];

  const vehicles: Vehicle[] = [
    {
      id: 'veh-1',
      weddingId,
      name: 'Innova Crysta 1 (Airport Shuttle)',
      category: 'suv_7',
      plateNumber: 'RJ 27 TA 1102',
      isPersonalVehicle: false,
      driverName: 'Mukesh Singh',
      driverPhone: '+91 94140 33441',
      driveSide: 'RHD',
      luggageCapacityBags: 4,
      countryPreset: 'India',
      status: 'scheduled',
    },
    {
      id: 'veh-2',
      weddingId,
      name: 'Rohan’s Fortuner (Personal Car)',
      category: 'suv_7',
      plateNumber: 'DL 3C AB 9090',
      isPersonalVehicle: true,
      ownerGuestId: 'gst-6',
      driverName: 'Rohan Kapoor',
      driverPhone: '+91 98765 43212',
      driveSide: 'RHD',
      luggageCapacityBags: 5,
      countryPreset: 'India',
      status: 'scheduled',
    },
  ];

  const vehicleSeats: VehicleSeat[] = [
    { id: 'seat-veh-1-0', weddingId, vehicleId: 'veh-1', seatIndex: 0, seatRole: 'driver' },
    { id: 'seat-veh-1-1', weddingId, vehicleId: 'veh-1', seatIndex: 1, seatRole: 'co_driver', guestId: 'gst-1' },
    { id: 'seat-veh-1-2', weddingId, vehicleId: 'veh-1', seatIndex: 2, seatRole: 'passenger', guestId: 'gst-2' },
    { id: 'seat-veh-1-3', weddingId, vehicleId: 'veh-1', seatIndex: 3, seatRole: 'passenger', guestId: 'gst-3' },
    { id: 'seat-veh-2-0', weddingId, vehicleId: 'veh-2', seatIndex: 0, seatRole: 'driver', guestId: 'gst-6' },
    { id: 'seat-veh-2-1', weddingId, vehicleId: 'veh-2', seatIndex: 1, seatRole: 'co_driver', guestId: 'gst-7' },
    { id: 'seat-veh-2-2', weddingId, vehicleId: 'veh-2', seatIndex: 2, seatRole: 'passenger', guestId: 'gst-8' },
  ];

  // Pillar 6: Seating Charts
  const seatingPlan: SeatingPlan = {
    id: 'plan-sangeet',
    weddingId,
    eventId: 'evt-sangeet',
    name: 'Sangeet Ballroom Seating Layout',
    canvasWidth: 900,
    canvasHeight: 600,
  };

  const floorPlanElements: FloorPlanElement[] = [
    { id: 'elem-stage', seatingPlanId: 'plan-sangeet', type: 'stage', label: 'Main Performance Stage', x: 250, y: 30, rotation: 0, width: 400, height: 90, capacity: 0 },
    { id: 'elem-dance', seatingPlanId: 'plan-sangeet', type: 'dance_floor', label: 'LED Dance Floor', x: 300, y: 140, rotation: 0, width: 300, height: 110, capacity: 0 },
    { id: 'elem-tbl-1', seatingPlanId: 'plan-sangeet', type: 'round_table', label: 'VIP Table 1 (Ladkewale)', x: 120, y: 280, rotation: 0, width: 130, height: 130, capacity: 8 },
    { id: 'elem-tbl-2', seatingPlanId: 'plan-sangeet', type: 'round_table', label: 'VIP Table 2 (Ladkiwale)', x: 650, y: 280, rotation: 0, width: 130, height: 130, capacity: 8 },
    { id: 'elem-sofa-1', seatingPlanId: 'plan-sangeet', type: 'lounge_sofa', label: 'Couple Royal Diwan', x: 370, y: 270, rotation: 0, width: 160, height: 70, capacity: 4 },
  ];

  const tableSeatAssignments: TableSeatAssignment[] = [
    { id: 'ts-1', elementId: 'elem-tbl-1', seatNumber: 1, guestId: 'gst-1' },
    { id: 'ts-2', elementId: 'elem-tbl-1', seatNumber: 2, guestId: 'gst-2' },
    { id: 'ts-3', elementId: 'elem-tbl-2', seatNumber: 1, guestId: 'gst-4' },
    { id: 'ts-4', elementId: 'elem-tbl-2', seatNumber: 2, guestId: 'gst-5' },
  ];

  // Pillar 7: E-Invites (4 types)
  const sampleEInvites: EInvite[] = [
    {
      id: 'inv-aarav-ananya-full',
      weddingId,
      title: 'Grand Celebrations — All Functions Itinerary',
      slug: 'aarav-ananya-royal-vivah',
      inviteType: 'whole_wedding',
      templateStyle: 'royal_mandala',
      templateId: 'royal_palace',
      includedEventIds: ['evt-mehendi', 'evt-sangeet', 'evt-haldi', 'evt-wedding', 'evt-reception'],
      coverGreeting: 'Together with their families',
      hostFamilyNames: 'The Sharma & Verma Families',
      customMessage: 'Request the honor of your gracious presence as Aarav & Ananya unite in holy matrimony amidst the serene lakes of Udaipur.',
      themeColors: {
        primary: '#7B1113',
        secondary: '#D97706',
        background: '#FCFBF7',
        text: '#271E1D',
      },
      rsvpPhone: '+91 98100 11223',
      googleMapsUrl: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
      createdAt: Date.now(),
    },
    {
      id: 'inv-aarav-ananya-ceremony',
      weddingId,
      title: 'Shubh Vivah Ceremony — Auspicious Pheras',
      slug: 'aarav-ananya-pheras',
      inviteType: 'ceremony_only',
      templateStyle: 'palace_arch',
      templateId: 'regal_mandala',
      includedEventIds: ['evt-wedding'],
      coverGreeting: 'With the blessings of our elders',
      hostFamilyNames: 'The Sharma & Verma Families',
      customMessage: 'Cordially invite you to witness the sacred nuptials and Vedic pheras of Aarav & Ananya.',
      themeColors: {
        primary: '#9A3412',
        secondary: '#D97706',
        background: '#FFFDF9',
        text: '#382116',
      },
      rsvpPhone: '+91 98100 11223',
      googleMapsUrl: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
      createdAt: Date.now() + 1,
    },
    {
      id: 'inv-aarav-ananya-initial',
      weddingId,
      title: 'Pre-Wedding Celebrations — Mehendi & Sangeet',
      slug: 'aarav-ananya-sangeet-mehendi',
      inviteType: 'initial_events',
      templateStyle: 'floral_mughal',
      templateId: 'mughal_floral',
      includedEventIds: ['evt-mehendi', 'evt-sangeet', 'evt-haldi'],
      coverGreeting: 'Join us for music, joy & colors',
      hostFamilyNames: 'The Sharma & Verma Families',
      customMessage: 'Get ready for dhol beats, vibrant mehendi, and energetic dance performances!',
      themeColors: {
        primary: '#0F766E',
        secondary: '#CA8A04',
        background: '#F4FBFB',
        text: '#132D2B',
      },
      rsvpPhone: '+91 98100 11223',
      googleMapsUrl: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
      createdAt: Date.now() + 2,
    },
    {
      id: 'inv-aarav-ananya-party',
      weddingId,
      title: 'Grand Reception Gala & Cocktails',
      slug: 'aarav-ananya-reception',
      inviteType: 'party_only',
      templateStyle: 'modern_minimal',
      templateId: 'contemporary_ivory',
      includedEventIds: ['evt-reception'],
      coverGreeting: 'Celebrate the Newlyweds',
      hostFamilyNames: 'The Sharma & Verma Families',
      customMessage: 'Join us for an evening of celebratory cocktails, multi-course feast, and dancing.',
      themeColors: {
        primary: '#1E293B',
        secondary: '#4F46E5',
        background: '#F8FAFC',
        text: '#0F172A',
      },
      rsvpPhone: '+91 98100 11223',
      googleMapsUrl: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
      createdAt: Date.now() + 3,
    },
  ];

  // Pillar 2 Sample Relationships (Cross-family & Inter-family links)
  const familyRelations: FamilyRelationLink[] = [
    {
      id: 'rel-parents-g',
      weddingId,
      fromMemberId: 'fam-g-dad',
      toMemberId: 'fam-g-mom',
      relationType: 'spouse',
      label: 'Husband & Wife',
    },
    {
      id: 'rel-parents-b',
      weddingId,
      fromMemberId: 'fam-b-dad',
      toMemberId: 'fam-b-mom',
      relationType: 'spouse',
      label: 'Husband & Wife',
    },
    {
      id: 'rel-cross-samdhi',
      weddingId,
      fromMemberId: 'fam-g-dad',
      toMemberId: 'fam-b-dad',
      relationType: 'cross_family',
      label: 'Samdhi (Groom & Bride Fathers)',
    },
    {
      id: 'rel-cross-samdhan',
      weddingId,
      fromMemberId: 'fam-g-mom',
      toMemberId: 'fam-b-mom',
      relationType: 'cross_family',
      label: 'Samdhan (Groom & Bride Mothers)',
    },
    {
      id: 'rel-in-law-cousins',
      weddingId,
      fromMemberId: 'fam-g-bro',
      toMemberId: 'fam-b-sis',
      relationType: 'in_law',
      label: 'Future Brother-in-Law & Sister-in-Law',
    },
  ];

  // Bulk add to IndexedDB
  await db.transaction('rw', db.tables, async () => {
    await db.weddings.put(sampleWedding);
    await db.events.bulkPut(events);
    await db.tags.bulkPut(tags);
    await db.familyMembers.bulkPut(familyMembers);
    await db.guestParties.bulkPut(guestParties);
    await db.guests.bulkPut(guests);
    await db.eventRsvps.bulkPut(eventRsvps);
    await db.hotels.put(hotel);
    await db.rooms.bulkPut(rooms);
    await db.roomAllocations.bulkPut(roomAllocations);
    await db.travelItems.bulkPut(travelItems);
    await db.vehicles.bulkPut(vehicles);
    await db.vehicleSeats.bulkPut(vehicleSeats);
    await db.seatingPlans.put(seatingPlan);
    await db.floorPlanElements.bulkPut(floorPlanElements);
    await db.tableSeatAssignments.bulkPut(tableSeatAssignments);
    await db.eInvites.bulkPut(sampleEInvites);
    await db.familyRelations.bulkPut(familyRelations);
  });

  return weddingId;
}
