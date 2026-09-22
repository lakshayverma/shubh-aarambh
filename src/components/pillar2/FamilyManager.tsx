import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, FamilyMember, Tag } from '../../db/schema';
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
} from 'lucide-react';

interface FamilyManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

// Custom Node for React Flow
const FamilyMemberNode: React.FC<{ data: { member: FamilyMember; tags: Tag[] } }> = ({ data }) => {
  const { member, tags } = data;
  const isLadkiwale = member.side === 'ladkiwale';

  return (
    <div
      className={`p-3 rounded-2xl border-2 shadow-md min-w-[180px] bg-theme-card transition-all ${
        isLadkiwale
          ? 'border-rose-400 text-rose-950'
          : 'border-amber-500 text-amber-950'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-theme-primary" />
      
      <div className="flex items-center justify-between gap-1 mb-1">
        <span
          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
            isLadkiwale ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {member.relation}
        </span>
        <span className="text-[10px] font-medium text-theme-text-muted">
          Gen {member.generationLevel}
        </span>
      </div>

      <div className="font-bold text-sm text-theme-text-main truncate">
        {member.name}
      </div>

      {member.roleTitle && (
        <div className="text-[11px] font-medium text-theme-primary truncate mt-0.5">
          {member.roleTitle}
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
  const allTags = useLiveQuery(() => db.tags.toArray());

  const [viewMode, setViewMode] = useState<'directory' | 'graph'>('directory');
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

  // Convert family members into React Flow Nodes and Edges
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!members) return { flowNodes: [], flowEdges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const groomMembers = members.filter((m) => m.side === 'ladkewale');
    const brideMembers = members.filter((m) => m.side === 'ladkiwale');

    // Place Ladkewale on Left (x: 50 to 450), Ladkiwale on Right (x: 550 to 950)
    const positionGroup = (group: FamilyMember[], startX: number) => {
      // Group by generation level
      const gen1 = group.filter((m) => m.generationLevel === 1);
      const gen2 = group.filter((m) => m.generationLevel === 2);
      const gen3 = group.filter((m) => m.generationLevel === 3);

      gen1.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 210, y: 50 },
          data: { member: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });

      gen2.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 210, y: 220 },
          data: { member: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });

      gen3.forEach((m, idx) => {
        nodes.push({
          id: m.id,
          type: 'familyNode',
          position: { x: startX + idx * 210, y: 390 },
          data: { member: m, tags: allTags?.filter((t) => m.tagIds?.includes(t.id)) || [] },
        });
      });
    };

    positionGroup(groomMembers, 50);
    positionGroup(brideMembers, 600);

    return { flowNodes: nodes, flowEdges: edges };
  }, [members, allTags]);

  const ladkewaleMembers = members?.filter((m) => m.side === 'ladkewale') || [];
  const ladkiwaleMembers = members?.filter((m) => m.side === 'ladkiwale') || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Pillar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-theme-primary" />
            <h2 className="text-xl font-bold font-serif text-theme-text-main">
              Family Hierarchy & Roles
            </h2>
          </div>
          <p className="text-xs text-theme-text-muted mt-1">
            Pillar 2: Manage immediate and extended family units, roles & responsibilities, and visual genealogical tree.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Directory / Cards View */}
      {viewMode === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ladkewale Column */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="font-serif font-bold text-base text-theme-text-main">
                  {wedding.groomSideName || 'Ladkewale'}
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

            <div className="space-y-3">
              {ladkewaleMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  tags={allTags?.filter((t) => member.tagIds?.includes(t.id)) || []}
                  onEdit={() => openEditModal(member)}
                  onDelete={() => handleDelete(member.id)}
                />
              ))}
              {ladkewaleMembers.length === 0 && (
                <p className="text-xs text-theme-text-muted italic text-center py-6">
                  No family members added on Groom's side yet.
                </p>
              )}
            </div>
          </div>

          {/* Ladkiwale Column */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="font-serif font-bold text-base text-theme-text-main">
                  {wedding.brideSideName || 'Ladkiwale'}
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

            <div className="space-y-3">
              {ladkiwaleMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  tags={allTags?.filter((t) => member.tagIds?.includes(t.id)) || []}
                  onEdit={() => openEditModal(member)}
                  onDelete={() => handleDelete(member.id)}
                />
              ))}
              {ladkiwaleMembers.length === 0 && (
                <p className="text-xs text-theme-text-muted italic text-center py-6">
                  No family members added on Bride's side yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: React Flow Tree Graph */}
      {viewMode === 'graph' && (
        <div className="bg-theme-card border border-theme-border rounded-3xl p-4 shadow-md h-[600px] relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-theme-card/90 backdrop-blur-md border border-theme-border px-3 py-1.5 rounded-xl text-xs font-semibold text-theme-text-main flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Ladkewale (Left)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Ladkiwale (Right)</span>
            </span>
          </div>

          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            className="bg-theme-background"
          >
            <Background />
            <Controls />
            <MiniMap
              nodeStrokeColor="#7B1113"
              nodeColor="#FEF3C7"
              className="!bg-theme-card !border-theme-border !rounded-2xl shadow-md"
            />
          </ReactFlow>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Family Side</label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as 'ladkiwale' | 'ladkewale')}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value="ladkewale">Ladkewale (Groom)</option>
                    <option value="ladkiwale">Ladkiwale (Bride)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Generation Tier</label>
                  <select
                    value={generationLevel}
                    onChange={(e) => setGenerationLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  >
                    <option value={1}>Gen 1: Grandparents / Senior Elders</option>
                    <option value={2}>Gen 2: Parents, Uncles & Aunts</option>
                    <option value={3}>Gen 3: Siblings & Cousins</option>
                    <option value={4}>Gen 4: Children / Nephews / Nieces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Verma"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Relation</label>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Wedding Day Role / Lead</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Baraat Reception Lead, Room Key Coordinator"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
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

// Family Member Card
const FamilyMemberCard: React.FC<{
  member: FamilyMember;
  tags: Tag[];
  onEdit: () => void;
  onDelete: () => void;
}> = ({ member, tags, onEdit, onDelete }) => {
  const cleanPhone = member.phone?.replace(/[^0-9]/g, '');

  return (
    <div className="p-4 rounded-2xl border border-theme-border bg-theme-background hover:border-theme-primary/50 transition-all space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-theme-text-main">
              {member.name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-card border border-theme-border text-theme-secondary">
              {member.relation}
            </span>
          </div>

          {member.roleTitle && (
            <div className="flex items-center gap-1.5 text-xs text-theme-primary font-semibold mt-1">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{member.roleTitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {member.phone && (
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
          <button
            onClick={onEdit}
            className="p-1.5 text-theme-text-muted hover:text-theme-primary rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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

      {member.notes && (
        <p className="text-[11px] text-theme-text-muted italic border-t border-theme-border/40 pt-1.5">
          {member.notes}
        </p>
      )}
    </div>
  );
};
