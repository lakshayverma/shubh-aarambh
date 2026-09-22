import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, FamilyMember, Tag, Guest, GuestParty } from '../../db/schema';
import { TagBadge } from '../tags/TagBadge';
import { TagSelector } from '../tags/TagSelector';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Heart,
  Users,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MessageCircle,
  Briefcase,
  GitGraph,
  LayoutList,
  Sparkles,
  X,
  UserCheck,
  Star,
  Check,
} from 'lucide-react';

interface FamilyManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

export interface UnifiedRelativeItem {
  id: string;
  weddingId: string;
  name: string;
  side: 'ladkiwale' | 'ladkewale';
  relation: string;
  generationLevel: number;
  source: 'family_core' | 'guest_list';
  partyName?: string;
  ageCategory?: 'adult' | 'child' | 'infant' | 'elder';
  phone?: string;
  email?: string;
  roleTitle?: string;
  tagIds?: string[];
  notes?: string;
  isPrimaryContact?: boolean;
}

// Custom Node for React Flow
const FamilyMemberNode: React.FC<{
  data: { item: UnifiedRelativeItem; tags: Tag[] };
}> = ({ data }) => {
  const { item, tags } = data;
  const isLadkiwale = item.side === 'ladkiwale';

  return (
    <div
      className={`p-3.5 rounded-2xl border-2 shadow-md min-w-[200px] max-w-[240px] bg-theme-card transition-all ${
        isLadkiwale
          ? 'border-rose-400 text-rose-950 shadow-rose-100'
          : 'border-amber-500 text-amber-950 shadow-amber-100'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-theme-primary" />

      <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
        <span
          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
            isLadkiwale ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {item.relation}
        </span>
        <div className="flex items-center gap-1">
          {item.ageCategory && (
            <span className="text-[10px]" title={item.ageCategory}>
              {item.ageCategory === 'elder'
                ? '👴'
                : item.ageCategory === 'child'
                ? '🧒'
                : item.ageCategory === 'infant'
                ? '👶'
                : '👤'}
            </span>
          )}
          <span className="text-[10px] font-semibold text-theme-text-muted">
            Gen {item.generationLevel}
          </span>
        </div>
      </div>

      <div className="font-bold text-sm text-theme-text-main truncate flex items-center gap-1">
        <span>{item.name}</span>
        {item.isPrimaryContact && (
          <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
        )}
      </div>

      {item.partyName && (
        <div className="text-[10px] text-theme-text-muted truncate mt-0.5">
          Party: {item.partyName}
        </div>
      )}

      {item.roleTitle && (
        <div className="text-[11px] font-medium text-theme-primary truncate mt-0.5">
          {item.roleTitle}
        </div>
      )}

      {item.source === 'guest_list' && (
        <div className="mt-1">
          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
            From Guest List
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 2).map((t) => (
            <TagBadge key={t.id} tag={t} size="sm" showLabel={false} />
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-theme-primary" />
    </div>
  );
};

const nodeTypes = {
  familyNode: FamilyMemberNode,
};

export const FamilyManager: React.FC<FamilyManagerProps> = ({
  wedding,
  onOpenTagManager,
}) => {
  const members = useLiveQuery(
    () => db.familyMembers.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const guests = useLiveQuery(
    () => db.guests.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const guestParties = useLiveQuery(
    () => db.guestParties.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const allTags = useLiveQuery(() => db.tags.toArray());

  const brideTerm = wedding.brideSideTerm || "Bride's Side (Ladkiwale)";
  const groomTerm = wedding.groomSideTerm || "Groom's Side (Ladkewale)";

  const [viewMode, setViewMode] = useState<'directory' | 'graph'>('directory');
  const [filterSource, setFilterSource] = useState<'all' | 'family_core' | 'guest_list'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [side, setSide] = useState<'ladkiwale' | 'ladkewale'>('ladkewale');
  const [relation, setRelation] = useState('Father');
  const [generationLevel, setGenerationLevel] = useState<number>(2);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // MERGE Core Family Members with Related Guests from Guest List
  const { unifiedLadkewale, unifiedLadkiwale } = useMemo(() => {
    const partyMap = new Map<string, GuestParty>();
    if (guestParties) {
      for (const p of guestParties) partyMap.set(p.id, p);
    }

    const ladkewaleList: UnifiedRelativeItem[] = [];
    const ladkiwaleList: UnifiedRelativeItem[] = [];

    // 1. Add core family members
    if (members) {
      for (const m of members) {
        const item: UnifiedRelativeItem = {
          id: m.id,
          weddingId: m.weddingId,
          name: m.name,
          side: m.side,
          relation: m.relation,
          generationLevel: m.generationLevel,
          source: 'family_core',
          phone: m.phone,
          email: m.email,
          roleTitle: m.roleTitle,
          tagIds: m.tagIds,
          notes: m.notes,
        };
        if (m.side === 'ladkewale') {
          ladkewaleList.push(item);
        } else {
          ladkiwaleList.push(item);
        }
      }
    }

    // 2. Add relative guests from Guest List that have relationToGroom or relationToBride
    if (guests) {
      for (const g of guests) {
        // Skip if already in family members with identical name
        const existsInCore = members?.some(
          (m) => m.name.toLowerCase().trim() === g.name.toLowerCase().trim()
        );
        if (existsInCore) continue;

        const party = partyMap.get(g.partyId);

        // Check if related to Groom
        if (g.relationToGroom && g.relationToGroom !== 'None') {
          ladkewaleList.push({
            id: g.id,
            weddingId: g.weddingId,
            name: g.name,
            side: 'ladkewale',
            relation: g.relationToGroom,
            generationLevel:
              g.generationLevel || (g.ageCategory === 'elder' ? 1 : g.ageCategory === 'child' ? 4 : 3),
            source: 'guest_list',
            partyName: party?.partyName,
            ageCategory: g.ageCategory,
            phone: g.isPrimaryContact ? party?.phone : undefined,
            email: g.isPrimaryContact ? party?.email : undefined,
            tagIds: g.tagIds || party?.tagIds,
            notes: g.specialAssistance,
            isPrimaryContact: g.isPrimaryContact,
          });
        }

        // Check if related to Bride
        if (g.relationToBride && g.relationToBride !== 'None') {
          ladkiwaleList.push({
            id: g.id,
            weddingId: g.weddingId,
            name: g.name,
            side: 'ladkiwale',
            relation: g.relationToBride,
            generationLevel:
              g.generationLevel || (g.ageCategory === 'elder' ? 1 : g.ageCategory === 'child' ? 4 : 3),
            source: 'guest_list',
            partyName: party?.partyName,
            ageCategory: g.ageCategory,
            phone: g.isPrimaryContact ? party?.phone : undefined,
            email: g.isPrimaryContact ? party?.email : undefined,
            tagIds: g.tagIds || party?.tagIds,
            notes: g.specialAssistance,
            isPrimaryContact: g.isPrimaryContact,
          });
        }
      }
    }

    return { unifiedLadkewale: ladkewaleList, unifiedLadkiwale: ladkiwaleList };
  }, [members, guests, guestParties]);

  const openAddModal = (defaultSide: 'ladkiwale' | 'ladkewale' = 'ladkewale') => {
    setEditingMember(null);
    setName('');
    setSide(defaultSide);
    setRelation('Father');
    setGenerationLevel(2);
    setPhone('');
    setEmail('');
    setRoleTitle('');
    setNotes('');
    setSelectedTagIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setSide(member.side);
    setRelation(member.relation);
    setGenerationLevel(member.generationLevel);
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setRoleTitle(member.roleTitle || '');
    setNotes(member.notes || '');
    setSelectedTagIds(member.tagIds || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMember) {
      await db.familyMembers.update(editingMember.id, {
        name: name.trim(),
        side,
        relation,
        generationLevel: Number(generationLevel),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        roleTitle: roleTitle.trim() || undefined,
        notes: notes.trim() || undefined,
        tagIds: selectedTagIds,
      });
    } else {
      const newMember: FamilyMember = {
        id: `fam-${Date.now()}`,
        weddingId: wedding.id,
        name: name.trim(),
        side,
        relation,
        generationLevel: Number(generationLevel),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        roleTitle: roleTitle.trim() || undefined,
        notes: notes.trim() || undefined,
        tagIds: selectedTagIds,
      };
      await db.familyMembers.put(newMember);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this family member?')) {
      await db.familyMembers.delete(id);
    }
  };

  // Convert unified relatives into React Flow Nodes and Edges
  const { flowNodes, flowEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const activeGroom =
      filterSource === 'all'
        ? unifiedLadkewale
        : unifiedLadkewale.filter((m) => m.source === filterSource);

    const activeBride =
      filterSource === 'all'
        ? unifiedLadkiwale
        : unifiedLadkiwale.filter((m) => m.source === filterSource);

    // Position groups across generations
    const positionGroup = (group: UnifiedRelativeItem[], startX: number) => {
      const gen1 = group.filter((m) => m.generationLevel === 1);
      const gen2 = group.filter((m) => m.generationLevel === 2);
      const gen3 = group.filter((m) => m.generationLevel === 3);
      const gen4 = group.filter((m) => m.generationLevel >= 4);

      gen1.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 230, y: 50 },
          data: { item: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });

      gen2.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 230, y: 220 },
          data: { item: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });

      gen3.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 230, y: 390 },
          data: { item: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });

      gen4.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 230, y: 560 },
          data: { item: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });
    };

    // Groom relatives on Left (startX: 50), Bride relatives on Right (startX: 750)
    positionGroup(activeGroom, 50);
    positionGroup(activeBride, 750);

    return { flowNodes: nodes, flowEdges: edges };
  }, [unifiedLadkewale, unifiedLadkiwale, allTags, filterSource]);

  const displayedLadkewale =
    filterSource === 'all'
      ? unifiedLadkewale
      : unifiedLadkewale.filter((m) => m.source === filterSource);

  const displayedLadkiwale =
    filterSource === 'all'
      ? unifiedLadkiwale
      : unifiedLadkiwale.filter((m) => m.source === filterSource);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Pillar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-theme-primary" />
            <h2 className="text-xl font-bold font-serif text-theme-text-main">
              Family Hierarchy & Relations
            </h2>
          </div>
          <p className="text-xs text-theme-text-muted mt-1">
            Pillar 2: Unified family tree merging core wedding family units with guest list relatives, generation levels, and roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter */}
          <div className="flex items-center bg-theme-background border border-theme-border rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterSource === 'all'
                  ? 'bg-theme-card text-theme-primary shadow-2xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              All ({unifiedLadkewale.length + unifiedLadkiwale.length})
            </button>
            <button
              onClick={() => setFilterSource('family_core')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterSource === 'family_core'
                  ? 'bg-theme-card text-theme-primary shadow-2xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              Core Family ({members?.length || 0})
            </button>
            <button
              onClick={() => setFilterSource('guest_list')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterSource === 'guest_list'
                  ? 'bg-theme-card text-theme-primary shadow-2xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              Guest Relatives ({unifiedLadkewale.filter((m) => m.source === 'guest_list').length + unifiedLadkiwale.filter((m) => m.source === 'guest_list').length})
            </button>
          </div>

          {/* Dual View Toggle */}
          <div className="bg-theme-background border border-theme-border p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'directory'
                  ? 'bg-theme-card text-theme-primary shadow-xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'graph'
                  ? 'bg-theme-card text-theme-primary shadow-xs'
                  : 'text-theme-text-muted hover:text-theme-text-main'
              }`}
            >
              <GitGraph className="w-3.5 h-3.5" />
              <span>Tree Graph</span>
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Core Member</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Directory / Cards View */}
      {viewMode === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groom's Side Column */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="font-serif font-bold text-base text-theme-text-main">
                  {groomTerm} ({displayedLadkewale.length})
                </h3>
              </div>
              <button
                onClick={() => openAddModal('ladkewale')}
                className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Groom Side</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {displayedLadkewale.map((item) => (
                <UnifiedRelativeCard
                  key={item.id}
                  item={item}
                  tags={allTags?.filter((t) => item.tagIds?.includes(t.id)) || []}
                  onEdit={() => {
                    const original = members?.find((m) => m.id === item.id);
                    if (original) openEditModal(original);
                  }}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
              {displayedLadkewale.length === 0 && (
                <p className="text-xs text-theme-text-muted italic text-center py-6">
                  No relatives or family members found under this filter on Groom's side.
                </p>
              )}
            </div>
          </div>

          {/* Bride's Side Column */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="font-serif font-bold text-base text-theme-text-main">
                  {brideTerm} ({displayedLadkiwale.length})
                </h3>
              </div>
              <button
                onClick={() => openAddModal('ladkiwale')}
                className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Bride Side</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {displayedLadkiwale.map((item) => (
                <UnifiedRelativeCard
                  key={item.id}
                  item={item}
                  tags={allTags?.filter((t) => item.tagIds?.includes(t.id)) || []}
                  onEdit={() => {
                    const original = members?.find((m) => m.id === item.id);
                    if (original) openEditModal(original);
                  }}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
              {displayedLadkiwale.length === 0 && (
                <p className="text-xs text-theme-text-muted italic text-center py-6">
                  No relatives or family members found under this filter on Bride's side.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: React Flow Genealogical Graph View */}
      {viewMode === 'graph' && (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-theme-text-muted">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{groomTerm} (Left)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{brideTerm} (Right)</span>
              </div>
            </div>
            <div className="text-[11px]">
              Elders (Top) &rarr; Parents &rarr; Couple & Peers &rarr; Children (Bottom)
            </div>
          </div>

          <div className="w-full h-[650px] border border-theme-border/60 rounded-2xl overflow-hidden bg-theme-background">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={1.5}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeColor={(n) => (n.position.x < 500 ? '#f59e0b' : '#f43f5e')}
                style={{ height: 100, width: 140, borderRadius: 12 }}
              />
            </ReactFlow>
          </div>
        </div>
      )}

      {/* Add / Edit Core Family Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingMember ? 'Edit Family Member' : 'Add Core Family Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Verma"
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Wedding Side *</label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value="ladkewale">{groomTerm}</option>
                    <option value="ladkiwale">{brideTerm}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Relation / Kinship</label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    placeholder="e.g. Father, Mama, Bua, Sister"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Generation Tier</label>
                  <select
                    value={generationLevel}
                    onChange={(e) => setGenerationLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value={1}>Gen 1: Grandparents & Elders</option>
                    <option value={2}>Gen 2: Parents, Uncles & Aunts</option>
                    <option value={3}>Gen 3: Couple, Siblings, Cousins</option>
                    <option value={4}>Gen 4: Children & Grandchildren</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">
                    Key Role / Duty Title
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Baraat Lead, Safawala POC"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Tag Selector */}
              <TagSelector
                weddingId={wedding.id}
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
                onOpenManager={onOpenTagManager}
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Notes & Key Duties</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests, arrival notes, vendor contacts..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Unified Relative Card
const UnifiedRelativeCard: React.FC<{
  item: UnifiedRelativeItem;
  tags: Tag[];
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, tags, onEdit, onDelete }) => {
  const cleanPhone = item.phone?.replace(/[^0-9]/g, '');

  return (
    <div className="p-4 rounded-2xl border border-theme-border bg-theme-background hover:border-theme-primary/50 transition-all space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-sm text-theme-text-main">
              {item.name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-card border border-theme-border text-theme-secondary">
              {item.relation}
            </span>
            <span className="text-[9px] text-theme-text-muted font-medium">
              Gen {item.generationLevel}
            </span>
          </div>

          {item.partyName && (
            <div className="text-[11px] text-theme-text-muted mt-0.5">
              Party:{' '}
              <strong className="text-theme-text-main font-semibold">
                {item.partyName}
              </strong>
            </div>
          )}

          {item.roleTitle && (
            <div className="flex items-center gap-1.5 text-xs text-theme-primary font-semibold mt-1">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.roleTitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {item.phone && (
            <>
              <a
                href={`tel:${cleanPhone}`}
                className="p-1.5 text-theme-text-muted hover:text-theme-primary rounded-lg transition-colors"
                title="Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-theme-text-muted hover:text-emerald-600 rounded-lg transition-colors"
                title="Send WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </>
          )}

          {item.source === 'family_core' && (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 text-theme-text-muted hover:text-theme-primary rounded-lg transition-colors"
                title="Edit core family member"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
                title="Delete member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {item.source === 'guest_list' && (
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              Guest List
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} size="sm" />
          ))}
        </div>
      )}

      {item.notes && (
        <p className="text-[11px] text-theme-text-muted italic border-t border-theme-border/40 pt-1.5">
          {item.notes}
        </p>
      )}
    </div>
  );
};
