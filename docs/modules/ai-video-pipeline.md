# AI Video Generation Pipeline & Quick Wedding Wizard Module

> **Path**: `src/services/` & `src/components/wizard/` & `src/components/pillar7/`  
> **Classification**: Intelligence & Onboarding Subsystem  
> **Dependencies**: `react`, `lucide-react`, Dexie IndexedDB, Canvas Confetti  
> **Parent Specification**: [`DESIGN.md`](../../DESIGN.md) & [`AGENTS.md`](../../AGENTS.md)

---

## 1. Module Overview

This module provides two foundational workflows:
1. **Quick Wedding Setup Wizard (`QuickWeddingWizard.tsx`)**: An interactive 5-step onboarding wizard enabling users to initialize a wedding workspace with Auspicious Dates, Bride & Groom info, Bilateral Immediate Family hierarchy (parents and siblings), and Ceremonies with specific lawn/hall allocations.
2. **Multi-Pass AI Video Generation Engine (`videoPromptPipeline.ts` & `EInviteVideoStudio.tsx`)**: A multi-pass prompt synthesis pipeline that ingests E-Invite ceremony records, cultural themes, and color palettes to generate cinematic video prompts and storyboards formatted for modern generative video engines.

---

## 2. Multi-Pass Video Generation Architecture

### 2.1 The 3-Pass Synthesis Pipeline

Generating convincing, culturally authentic Indian wedding videos with AI models (Sora, Runway, Luma, Veo, Pika) requires multi-layered prompt synthesis rather than a single keyword dump. The pipeline executes 3 distinct passes:

```
E-Invite Data (Couple, Ceremonies, Venues, Dates, Palette, Message)
   │
   ▼
[Pass 1: Narrative Storyboard Arc]
   ├─ Chronological 5-scene beat progression
   ├─ Ritual context (Haldi yellow shower, Sangeet dance, Mandap Agni Kund, Royal RSVP)
   ▼
[Pass 2: Visual Style & Camera Physics]
   ├─ Engine-specific syntax (Sora 35mm prose, Runway camera tags, Luma natural flow)
   ├─ Cultural textiles (Zari brocade, flowing silk dupattas, marigold petal physics)
   ├─ Lighting & Color Grading keyed to E-Invite hex codes
   ▼
[Pass 3: Voiceover Script & Classical Music Score]
   ├─ Trilingual voiceover narration (English, Hindi, Hinglish)
   ├─ Acoustic instrument cues (Shehnai, Santoor, Sitar, Dholak, Vedic Chants)
   ▼
Master AI Prompt Pack (Export Markdown / JSON / Direct Clipboard)
```

### 2.2 Target Video Engines Supported

| Engine | Prompting Paradigm | Optimizations |
| :--- | :--- | :--- |
| **OpenAI Sora** | Ultra-detailed cinematic prose | 35mm anamorphic lens, f/1.8 shallow depth of field, physical fabric physics, 24fps |
| **Runway Gen-3 Alpha** | Bracketed tag structure | `[Camera Move]`, `[Subject Action]`, `[Lighting]`, `[Aesthetics / 35mm]` |
| **Luma Dream Machine** | Fluid motion narrative | Natural prose describing continuous motion, lighting temperature, and slow-motion transitions |
| **Google Veo** | High-definition ritual realism | Cultural authenticity tags, high-fidelity Indian couture, architectural sandstone details |
| **Pika Labs** | Parameterized command format | Explicit camera and particle flags (`-camera zoom in -fps 24 -motion 4`) |

### 2.3 Contextual E-Invite Data, Per-Pass Tweaks & Tabbed Control Hierarchy

The video configurator (`EInviteVideoStudio.tsx`) deeply integrates active E-Invite metadata and provides a clean, sequential control architecture:

1. **Contextual E-Invite Banner & Persistent Storage (`EInvite.videoConfig`)**:
   - Displays cover greeting & sacred invocation (e.g. `|| Shree Ganeshay Namah ||`).
   - Host family names (`invite.hostFamilyNames`).
   - Personal emotional inviting message / blessing (`invite.customMessage`).
   - Theme color swatches (`primary`, `secondary`, `background`) and background motifs (`jaali_lattice`, `royal_mandala`, `peacock_feather`, etc.).
   - Badges for included ceremonies with dates, times, and sub-venues.
   - **Automatic Local Persistence**: All configured target video engines, tweak options, custom notes, and customized storyboards are saved to `EInvite.videoConfig` in IndexedDB, ensuring work is preserved across invite switches and reloads.

2. **Sequential Multi-Pass Navigation (Strict 1 → 2 → 3 Order)**:
   - **Pass 1: Storyboard Narrative**: Thematic style presets (Heritage Royal, Bollywood Glam, etc.), story pacing (Slow-Mo, Speed-Ramped), cultural accent pills, and storyboard narrative arc guidance notes.
   - **Pass 2: Visual & Camera Prompts**: Lens signature presets (35mm Anamorphic, 50mm Prime f/1.2, etc.), lighting physics presets (Golden Hour, Agni Firelight, etc.), color grading palettes, and engine formatting guidelines.
   - **Pass 3: Voiceover & Audio Score**: Multilingual language selector (English, Shuddh Hindi, Hinglish), primary acoustic score cues (Shehnai, Dholak, Vedic Chants), and ambient foley presets (Temple Bells, Agni Crackle).
   - **Master AI Prompt Pack**: Unified multi-engine prompt compiler, 1-click clipboard actions, and markdown/JSON exports.

3. **Tabbed Level-2 Scene Tweak Drawer (`<NestedScreen level={2}>`)**:
   - Organized into 4 focused tabs for distraction-free scene direction:
     - **Pass 1 (Narrative & Duration)**: Scene title, ceremony tag, editable visual action textarea, and 3s–15s duration slider.
     - **Pass 2 (Cinematography & Rig)**: Shot framing scale cards, 7-button camera movement grid, 6 lighting gradient cards, motion pacing buttons, 8 atmospheric FX toggle chips, and color grading swatches.
     - **Pass 3 (Audio & Scripts)**: Acoustic musical score cards and tabbed multilingual voiceover narration scripts (English, Hindi, Hinglish).
     - **Compiled Prompt Inspector**: Live synchronized model prompt with real-time updates as visual cards change, copy prompt button, and parameter summary table.
   - Built-in root document scroll lock (`document.body.style.overflow = 'hidden'`) with reference counting for seamless nested drawer navigation.

---

## 3. Client-Side Security & Zero-Cloud Standard

In strict compliance with Vivah Planner's **Invariant 1 (Zero-Cloud Standard)**:
- **No Third-Party Intermediary**: API keys for OpenAI, Google Gemini, and Anthropic Claude are stored exclusively in the client's local storage (`localStorage` & IndexedDB `wedding.aiSettings`).
- **Direct HTTPS Requests**: All AI requests are dispatched directly from the browser thread to official provider endpoints:
  - Gemini: `https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`
  - OpenAI: `https://api.openai.com/v1/chat/completions`
  - Anthropic: `https://api.anthropic.com/v1/messages`
- **Algorithmic Fallback**: Users without API keys can still generate full, structured multi-pass prompt packs and storyboards instantly with zero external network requests.

---

## 4. Quick Wedding Setup Wizard (`QuickWeddingWizard.tsx`)

A 5-step wizard that seeds the multi-pillar database in a single atomic Dexie transaction:

1. **Step 1: Auspicious Dates & Destination**:
   - Primary Wedding Date (Muhurat) with day-of-week calculation.
   - Celebration Start & End dates.
   - Destination City & Primary Palace/Resort Venue.
   - Auto-computed title generator.
2. **Step 2: Couple & Bilateral Terminology**:
   - Bride & Groom full names and calling nicknames.
   - Bilateral side terms (e.g., "Ladkiwale", "Team Ananya", "Ladkewale", "Team Aarav").
3. **Step 3: Immediate Family Hierarchy (Bilateral)**:
   - Structured dual-column cards for Bride's side and Groom's side.
   - Father and Mother (names, phone, honorary roles).
   - Add/Remove Siblings (brothers and sisters with honorary roles).
   - Automatically populates `db.familyMembers` (Gen 2 for parents, Gen 3 for siblings) and `db.guestParties` / `db.guests` marked with `isCoreFamily: true`.
4. **Step 4: Ceremonies & Sub-Venues**:
   - 6 ceremony presets (Haldi, Mehendi, Sangeet, Wedding/Pheras, Reception, Roka).
   - Specific lawn/hall assignments (e.g. "Sunken Poolside Lawn", "Grand Crystal Ballroom").
   - Timing and dress code recommendations.
5. **Step 5: Review & Workspace Kick-off**:
   - Visual summary card of the couple, celebration timeline, and immediate family count.
   - Confetti celebration and instant redirection into the active wedding workspace.
