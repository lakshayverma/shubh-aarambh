# Pillar 2: Family Hierarchy & Merged Relations

## 1. Overview & Purpose
Indian weddings are family-centric milestones uniting two extensive family networks. Pillar 2 enables planners to organize key relatives, assign ceremonial responsibilities, and visualize kinship structures.

Crucially, **Pillar 2 is merged with Pillar 3 (Guest List)**: any guest designated with kinship relations (e.g. *Father, Mother, Mama, Chacha, Bua, Maasi, Cousin*) or age tiers (*Elder, Senior*) is automatically integrated into the Family Directory and the React Flow genealogical tree graph.

---

## 2. Key Features & Capabilities

### 2.1 Dual-View Architecture (`FamilyManager.tsx`)
1. **Directory / Cards View**:
   - Split side-by-side columns: **Groom's Side** on the left (Amber/Gold) and **Bride's Side** on the right (Rose/Crimson).
   - Source filter toggle: View **All Relatives**, **Core Family Members Only**, or **Guest List Relatives**.
   - Contact shortcuts: 1-click telephone calling and direct WhatsApp messaging (`wa.me`) with phone formatting.
   - Key responsibilities display (e.g. *Baraat Reception Lead*, *Safawala Coordinator*, *Kanyadaan POC*).
2. **Interactive Genealogical Tree Graph (`@xyflow/react`)**:
   - Renders a multi-generational visual hierarchy with **expanded node spacing (320px horizontal pitch, 200px vertical tier pitch)** to prevent node overlaps.
   - **Dynamic Side Separation**: Automatically calculates Groom side width and dynamically spaces the Bride's wing (minimum 450px clearance) ensuring zero overlap regardless of family size.
   - **Groom's Relatives on the Left** and **Bride's Relatives on the Right**.
   - Structured vertical tiers across **4 Generation Levels**:
     - **Gen 1 (Top)**: Grandparents & Elders (*Dada, Dadi, Nana, Nani*)
     - **Gen 2**: Parents, Uncles & Aunts (*Father, Mother, Chacha, Mama, Bua, Maasi*)
     - **Gen 3**: Couple, Siblings, Cousins & Peers (*Bride, Groom, Brother, Sister, Cousin*)
     - **Gen 4 (Bottom)**: Children & Grandchildren
   - **Automatic Hierarchical Edges**: Generates generational parent-child lineage connections within each family wing, plus a central animated golden bond (`💍 Sacred Vivah Union 💍`) connecting the Groom and Bride wings.
   - **Interactive Canvas Drag-and-Drop Linking (`onConnect` & `ConnectionMode.Loose`)**:
     - Connects any two relatives directly on the canvas by dragging between circular handles on node borders (top, bottom, left, right).
     - Zero modal obstruction: automatically detects cross-family alliance, generation level relationship, prompts for quick description, and persists immediately to IndexedDB.
     - **Click-to-Edit Connection**: Clicking any relationship edge opens a prompt to update the relation label or delete the bond.
     - Color-coded edge badges: Purple for Cross-Family, Pink for Spouses, Green for Parent-Child, Blue for Siblings, and Amber for In-Laws.
     - Interactive ribbon to view, inspect, and remove custom kinship links.
   - Interactive zoom (0.15x to 1.5x), pan, mini-map, and generation badges.

### 2.2 Dynamic Pair Terminology
- Reads `wedding.brideSideTerm` (e.g. *Team Ananya / Ladkiwale*) and `wedding.groomSideTerm` (e.g. *Team Aarav / Ladkewale*) throughout all labels, cards, and graph headers.

### 2.3 Tagging & Operational Role Engine
- Associates custom role badges (e.g. VIP, Ritual Lead, Airport Greeter) with wedding-scoped or global tag promotion.

---

## 3. Data Model & IndexedDB Schema

```typescript
export interface FamilyMember {
  id: string;
  weddingId: string;
  name: string;
  side: 'ladkiwale' | 'ladkewale';
  relation: string; // e.g. "Mother", "Father", "Sister", "Mama", "Chacha", "Bua"
  generationLevel: number; // 1: Grandparents, 2: Parents/Uncles, 3: Couple/Siblings, 4: Children
  phone?: string;
  email?: string;
  roleTitle?: string;
  tagIds: string[];
  notes?: string;
}
```
