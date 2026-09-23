# Pillar 7: Digital E-Invites & 16-Combination Template Engine

## 1. Overview & Purpose
Indian weddings feature distinct guest cohorts: close family attending all functions, ceremony-only attendees for sacred pheras, elders for pre-wedding poojas, and friends for cocktail parties. Pillar 7 provides a **16-combination E-Invite engine** (4 invite types &times; 4 royal design templates) with an embedded invite list.

---

## 2. Key Features & Capabilities

### 2.1 4 Invite Types (Cohort Audiences)
1. **Whole Wedding**: All celebrations & rituals (Mehendi, Sangeet, Haldi, Vivah, Reception).
2. **Just the Ceremony**: Exclusively the sacred Wedding Pheras & Muhurat.
3. **Initial Events**: Pre-wedding rituals (Haldi, Mehendi, Sangeet, Roka).
4. **Party Only**: Post-wedding celebrations (Cocktails, Sangeet After-Party, Grand Reception).

### 2.2 4 Royal & Contemporary Design Templates
1. **Royal Palace Arch (`royal_palace`)**: Rajputana heritage palace aesthetic with ornate gold foil arches, rich crimson tones, and royal serif typography.
2. **Mughal Floral Trellis (`mughal_floral`)**: Delicate Persian floral borders with emerald green, soft blush, and gold inlay motifs.
3. **Regal Sacred Mandala (`regal_mandala`)**: Auspicious Vedic mandala watermark with saffron, marigold, and warm ambient glow.
4. **Contemporary Ivory (`contemporary_ivory`)**: Modern champagne ivory minimalism with slate typography, clean micro-borders, and luxury monogram elegance.

### 2.3 3-Column Inline Designer Studio (`EInvitesManager.tsx`)
Instead of a modal popup, Pillar 7 provides an inline 3-column designer studio workbench configured with modern `<CustomSelect>` dropdowns:
- **Column 1 (Data & Cohort)**:
  - Cohort Audience `<CustomSelect>` (`whole_wedding`, `ceremony_only`, `initial_events`, `party_only`).
  - Included ceremonies & events grouped directly adjacent under the cohort with automatic preselection.
  - Title, URL slug, opening greetings, host family names, custom message, and RSVP contact.
- **Column 2 (Visuals & Aesthetics)**:
  - 4 Design Template `<CustomSelect>` with preview descriptions.
  - 6 Cultural Pre-defined Color Palettes `<CustomSelect>` featuring multi-dot color swatches (`colorSwatch`).
  - Custom Color Pickers (Primary, Accent, Card Background, Card Border).
  - **14 Background Watermark Patterns** (`<CustomSelect>`):
    1. Ornate Damask Arches (`damask`)
    2. Sacred Mandala Watermark (`mandala`)
    3. Mughal Trellis Vine (`floral`)
    4. Imperial Radial Aura (`imperial_gradient`)
    5. Clean Linen Minimal (`clean_linen`)
    6. Mughal Geometric Jaali (`jaali_lattice`)
    7. Royal Paisley & Kalka (`paisley_kalka`)
    8. Regal Peacock Plume (`peacock_feather`)
    9. Festive Marigold Garland (`marigold_garland`)
    10. Shubh Nakshatra Stars (`golden_stars`)
    11. Rajasthani Leheriya (`royal_stripes`)
    12. Temple Kanjeevaram Arch (`temple_border`)
    13. Tussar Raw Silk Weave (`ivory_silk`)
    14. Solid Pure Canvas (`none`)
  - **11 Auspicious Invitation Motif Icons** (`<CustomSelect>`):
    1. Royal Crown / Raj Tilak (`crown`)
    2. Shubh Sparkles / Auspicious Aura (`sparkles`)
    3. Sacred Lotus / Padma Bloom (`flower2`)
    4. Agni Kund / Sacred Pheras (`flame`)
    5. Prem Bandhan / Two Hearts (`heart`)
    6. Shehnai & Dhol / Sangeet Beats (`music`)
    7. Celebration Toast / Cocktail Night (`wine`)
    8. Surya Dev / Shubh Muhurat (`sun`)
    9. Sacred Directions / Vastu & Journey (`compass`)
    10. Ratna / Jewel / Eternal Bond (`gem`)
    11. Dhruva Tara / North Star (`star`)
  - **Independent Watermark Pattern Color & Opacity (RGBA)**: Dedicated color picker with interactive opacity slider (2% to 80%), opacity presets (10%, 20%, 35%, 50%), and direct RGBA string input for fine-tuned watermark subtlety.
- **Column 3 (Live Preview & Quick Export)**:
  - Real-time live card preview updating instantly as values or colors change.
  - Watermark pattern rendered directly on the card background with corner ornaments and chosen emblem icon using the dedicated RGBA pattern color.
  - **Full-Height Unclipped PNG Export**: Captures complete ceremony schedule with zero scrollbars or text clipping.
  - Standalone HTML export and formatted WhatsApp copy button.

### 2.4 Variants Overview & Management
- Gallery cards view of all created variants with quick edit in 3-col studio, PNG download, and delete.

---

## 3. Data Model & IndexedDB Schema

```typescript
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
    cardBg?: string;
    borderColor?: string;
    patternColor?: string;
  };
  backgroundTheme?:
    | 'damask'
    | 'mandala'
    | 'floral'
    | 'imperial_gradient'
    | 'clean_linen'
    | 'jaali_lattice'
    | 'paisley_kalka'
    | 'peacock_feather'
    | 'marigold_garland'
    | 'golden_stars'
    | 'royal_stripes'
    | 'temple_border'
    | 'ivory_silk'
    | 'none'
    | string;
  iconOption?: string;
  rsvpPhone?: string;
  googleMapsUrl?: string;
  createdAt: number;
}
```

