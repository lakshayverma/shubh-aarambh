# Pillar 1: Wedding Dates & Functions Timeline

## 1. Overview & Purpose
Indian weddings are multi-day celebrations comprising distinct cultural rituals, ceremonial timings (Shubh Muhurats), dress codes, and varied venue locations. Pillar 1 serves as the central timekeeper and scheduling backbone of **Vivah Planner**.

It provides:
- A guided **3-Step Indian Wedding Creation Wizard**.
- A live **Muhurat Countdown Timer** down to the second.
- An interactive **Ceremonies & Functions Timeline**.
- One-click **Calendar Sync (.ics export)** for calendar apps (Google Calendar, Apple Calendar, Outlook).

---

## 2. Key Features & Capabilities

### 2.1 Guided 3-Step Indian Wedding Wizard (`CreateWeddingModal.tsx`)
When a planner creates a wedding, the wizard walks them through:
1. **The Couple & Families**:
   - Bride's Full Name & Groom's Full Name.
   - Side Titles: Custom titles for *Ladkiwale* (Bride's family) and *Ladkewale* (Groom's family).
2. **Dates & Destination**:
   - Celebration Start & End dates.
   - Sacred Muhurat (Primary Wedding Ceremony) date.
   - Destination City (e.g. Udaipur, Jaipur, Delhi NCR, Goa) & Primary Venue (e.g. The Leela Palace).
   - Optional custom wedding title.
3. **Pre-Populated Indian Functions**:
   - Toggles pre-configured ceremonial rituals with sensible Indian wedding timing offsets:
     - **Mehendi Ki Raat** (Day 1 Afternoon, Green/Floral theme)
     - **Sangeet & Cocktail Night** (Day 1 Evening, Indo-Western Glamour)
     - **Haldi & Phoolon Ki Holi** (Day 2 Morning, Sunshine Yellow theme)
     - **Shubh Vivah & Royal Pheras** (Day 2 Evening, Traditional Sherwani & Bridal Red)
     - **Grand Royal Reception** (Day 3 Evening, Black Tie & Silks)
   - On completion, fires a celebratory confetti animation (`canvas-confetti`) and immediately navigates into the Wedding Command Center.

### 2.2 Live Muhurat Countdown Timer (`WeddingCommandCenter.tsx`)
- Renders an auspicious real-time countdown card showing **Days, Hours, Minutes, and Seconds** remaining until the sacred wedding ceremony.
- Updates dynamically every second with zero cloud overhead.

### 2.3 Interactive Itinerary Timeline (`EventsTimeline.tsx`)
- **Chronological Flow**: Renders ceremonial cards along a vertical visual timeline.
- **Color-Coded Ritual Badges**:
  - *Haldi*: Saffron/Amber
  - *Mehendi*: Emerald Green
  - *Sangeet*: Royal Purple
  - *Wedding / Pheras*: Crimson Red
  - *Reception*: Sapphire Blue
- **Ceremony Details**: Tracks Start Time, End Time, Venue/Hall, Dress Code theme, and Planner notes (e.g. vendor instructions, dholak arrival).
- **Add / Edit / Delete Modal**: Planners can add custom functions (e.g. Roka, Chooda ceremony, Baraat assembly, Cocktail party) or adjust timings at any point.
- **Calendar (.ics) Export**: Generates a standard `.ics` iCalendar file that planners or couples can share with guests to import the multi-day itinerary directly into their phone calendars.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface Wedding {
  id: string;
  title: string;
  brideName: string;
  groomName: string;
  brideSideName: string;
  groomSideName: string;
  startDate: string;
  endDate: string;
  primaryDate: string; // Wedding ceremony date
  city: string;
  venue: string;
  coverImage?: string;
  theme: string;
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
```

IndexedDB Table Indexes:
- `weddings`: `id, primaryDate, createdAt, updatedAt`
- `events`: `id, weddingId, date, orderIndex`
