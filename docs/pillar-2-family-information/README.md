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
   - Renders a multi-generational visual hierarchy.
   - **Groom's Relatives on the Left** and **Bride's Relatives on the Right**.
   - Structured vertical tiers across **4 Generation Levels**:
     - **Gen 1 (Top)**: Grandparents & Elders (*Dada, Dadi, Nana, Nani*)
     - **Gen 2**: Parents, Uncles & Aunts (*Father, Mother, Chacha, Mama, Bua, Maasi*)
     - **Gen 3**: Couple, Siblings, Cousins & Peers (*Bride, Groom, Brother, Sister, Cousin*)
     - **Gen 4 (Bottom)**: Children & Grandchildren
   - Interactive zoom, pan, mini-map, and generation badges.

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
