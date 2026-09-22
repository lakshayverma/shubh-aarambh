# Pillar 1: Wedding Dates & Functions Timeline & Calendar

## 1. Overview & Purpose
Indian weddings are multi-day celebrations comprising distinct cultural rituals, ceremonial timings (Shubh Muhurats), dress codes, and varied venue locations. Pillar 1 serves as the central timekeeper and scheduling backbone of **Vivah Planner**.

It provides:
- A guided **3-Step Indian Wedding Creation Wizard**.
- A live **Muhurat Countdown Timer** down to the second.
- **Calendar Week View** (default) with day-by-day columns, time slots, and responsive layout alongside a **Timeline List View**.
- **Side Filter Dropdown** supporting custom pair terminology (e.g. *Bride's Side (Team Ananya)* vs *Groom's Side (Team Aarav)*).
- **Ritual Icons & Emojis** (☀️ Haldi, 🎨 Mehendi, 🎵 Sangeet, 👑 Wedding/Pheras, 🥂 Reception, 💍 Roka, 🍸 Cocktail).
- **Live RSVP Expected Headcount Badges** calculating confirmed attendees per ceremony with Bride/Groom breakdown.
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

### 2.3 Calendar Week View (`EventsTimeline.tsx`)
- **Day-by-Day Columns**: Automatically maps all days across the wedding's duration into structured columns with formatted dates, day numbers (Day 1, Day 2, etc.), and prominent **Muhurat Day** highlighting.
- **Time Slots & Ritual Cards**: Each ceremony card displays:
  - Ritual icon & color badge (☀️ Haldi, 🎨 Mehendi, 🎵 Sangeet, 👑 Vivah, 🥂 Reception)
  - Start Time to End Time
  - Venue location
  - Dress code theme badge (e.g. *Sunshine Yellow*, *Indo-Western Glamour*)
  - **Live RSVP Expected Headcount Badge**: Real-time attendee counter calculated from Pillar 3 RSVPs (e.g. `185 Attending (110B / 75G)`).
- **Side Filter**: Filter ceremonies and headcount numbers by *Both Sides*, *Bride's Side*, or *Groom's Side* using dynamic pair terminology.
- **Switch to List View**: Toggle between the Day-by-Day Week View and the classic vertical chronological timeline with one click.
- **Add / Edit / Delete Modal**: Planners can add custom ceremonies or adjust timings with immediate IndexedDB reactivity.
- **Calendar (.ics) Export**: Generates a standard `.ics` iCalendar file that planners or couples can share with guests.

---

## 3. Data Model & IndexedDB Schema

```typescript
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
