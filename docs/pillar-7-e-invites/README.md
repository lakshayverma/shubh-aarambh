# Pillar 7: Festive E-Invites & Multi-Cohort Exporter

## 1. Overview & Purpose
In modern Indian weddings, digital invitations (E-Invites) are the primary vehicle for sharing itineraries, dress codes, Google Map directions, and host greetings. Crucially, wedding planners often need **multiple distinct e-invites per wedding** based on the cohort of guests (e.g., an all-inclusive 3-day invite for close relatives vs. an evening-only Reception invite for business colleagues).

Pillar 7 provides:
- **Multi-Cohort E-Invite Management** with unique URL slugs per variant.
- Live **Festive Indian Wedding Card Designer** with ornate gold borders, mandalas, and royal arch motifs.
- **High-Resolution PNG Graphic Card Downloader** via `html-to-image`.
- **Standalone Single-File Interactive HTML Exporter** ready to be hosted, shared via Google Drive, or attached to emails.
- Dedicated **In-App Fullscreen Public View Route** (`#/invite/:slug`).
- **1-Click Personalized WhatsApp Share Message Generator**.

---

## 2. Key Features & Capabilities

### 2.1 Multi-Cohort Invites (`EInvitesManager.tsx`)
- Planners can create distinct invite variants for different guest groups:
  - *Full 3-Day Celebrations* (Mehendi, Sangeet, Haldi, Vivah, Reception)
  - *Reception Only Gala*
  - *VIP Family & Rituals Itinerary*
- Each cohort has:
  - Custom Title and URL Slug (e.g. `aarav-ananya-royal-vivah`).
  - Checkboxes to select which specific ceremonies from Pillar 1 are displayed on this card.
  - Custom Greeting (e.g. *Together with their families*).
  - Host Family Names (*The Sharma & Verma Pariwaar*).
  - Personalized Inviting Message.
  - RSVP phone contact and Google Maps destination URL.

### 2.2 Festive Visual Card Canvas
- The invitation card renders:
  - Dual-tone borders with Indian architectural corner arches and gold-foil motifs.
  - Auspicious central crest emblem.
  - Elegant serif typography (`Playfair Display` & `Cinzel`).
  - Chronological schedule cards for included ceremonies with date, timings, venue, and dress codes.
  - Venue map link and RSVP contacts.

### 2.3 Multiple Export & Distribution Channels
1. **Download High-Resolution PNG Graphic**:
   - Uses `html-to-image` at high pixel ratio (`2x`) to render and save a crisp, high-resolution `.png` card suitable for sharing as an image on social media and messaging apps.
2. **Export Standalone Interactive HTML Package**:
   - Generates a self-contained `.html` file with embedded styles, responsive layout, Google Fonts, and functional links.
   - Requires zero build tools or server dependencies—openable directly in any web browser.
3. **Dedicated In-App Public Slug Route (`#/invite/:slug`)**:
   - Supports opening invites in the PWA itself via hash routing.
   - When a guest or planner opens `vivahplanner.app/#/invite/:slug`, the app displays the standalone invitation in a clean fullscreen mobile view without planner navigation chrome.
4. **1-Click WhatsApp Message Generator**:
   - Generates a formatted message with invitation text, dates, venue, and RSVP number directly to the clipboard, ready to send via WhatsApp.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface EInvite {
  id: string;
  weddingId: string;
  title: string;
  slug: string; // Unique URL identifier
  templateStyle: 'royal_mandala' | 'modern_minimal' | 'floral_mughal' | 'palace_arch';
  includedEventIds: string[]; // IDs of ceremonies displayed on this invite
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
```

IndexedDB Table Indexes:
- `eInvites`: `id, weddingId, slug`
