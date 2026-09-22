import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Tag } from '../../db/schema';
import { TagBadge } from './TagBadge';
import {
  Tag as TagIcon,
  Globe,
  Plus,
  ArrowUpRight,
  Trash2,
  X,
  Sparkles,
  Crown,
  Heart,
  Music,
  Shield,
  Star,
  Users,
  Smile,
  Zap,
} from 'lucide-react';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingId: string;
}

const AVAILABLE_ICONS = [
  'Tag',
  'Crown',
  'Heart',
  'Sparkles',
  'Music',
  'Shield',
  'Star',
  'Users',
  'Smile',
  'Zap',
  'HeartHandshake',
  'Flag',
];

const PRESET_COLORS = [
  '#7B1113', // Maroon
  '#D97706', // Gold / Amber
  '#BE185D', // Rose
  '#0F766E', // Teal
  '#C2410C', // Saffron
  '#4F46E5', // Indigo
  '#16A34A', // Emerald Green
  '#9333EA', // Purple
  '#475569', // Slate
];

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose,
  weddingId,
}) => {
  const allTags = useLiveQuery(() => db.tags.toArray());

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [scope, setScope] = useState<'wedding' | 'global'>('wedding');

  if (!isOpen) return null;

  const weddingTags = allTags?.filter((t) => t.scope === 'wedding' && t.weddingId === weddingId) || [];
  const globalTags = allTags?.filter((t) => t.scope === 'global') || [];

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      scope,
      weddingId: scope === 'wedding' ? weddingId : undefined,
    };

    await db.tags.put(newTag);
    setName('');
  };

  const handlePromoteToGlobal = async (tag: Tag) => {
    if (confirm(`Promote "${tag.name}" to a Global Tag? It will be accessible across all weddings.`)) {
      await db.tags.update(tag.id, {
        scope: 'global',
        weddingId: undefined,
      });
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('Delete this tag?')) {
      await db.tags.delete(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-theme-card border border-theme-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-primary-light text-theme-primary flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-theme-text-main">Tags & Badges Manager</h3>
              <p className="text-xs text-theme-text-muted">Manage tags for family members, guests, rooms, and vehicles.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Create Tag Form */}
          <form onSubmit={handleCreateTag} className="bg-theme-background/80 border border-theme-border p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">Create New Tag</span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-theme-text-muted flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'wedding'}
                    onChange={() => setScope('wedding')}
                    className="text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Wedding Scope</span>
                </label>
                <label className="text-xs font-semibold text-theme-text-muted flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'global'}
                    onChange={() => setScope('global')}
                    className="text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Global (All Weddings)</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tag name (e.g. Choreographer, VIP Elder, Baraat Lead)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-theme-border bg-theme-card text-theme-text-main text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                required
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-theme-text-muted">Select Badge Icon</label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVAILABLE_ICONS.map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <button
                      type="button"
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-theme-primary bg-theme-primary text-white shadow-xs'
                          : 'border-theme-border bg-theme-card text-theme-text-muted hover:text-theme-text-main'
                      }`}
                      title={iconName}
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-theme-text-muted">Select Badge Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedColor === c ? 'scale-125 border-theme-text-main shadow-xs' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Wedding Scoped Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-1.5">
              <h4 className="font-serif font-bold text-sm text-theme-text-main">
                Wedding-Scoped Tags ({weddingTags.length})
              </h4>
              <span className="text-[11px] text-theme-text-muted">Unique to this wedding</span>
            </div>

            {weddingTags.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {weddingTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1.5 p-1 rounded-2xl border border-theme-border bg-theme-background"
                  >
                    <TagBadge tag={tag} />
                    <button
                      onClick={() => handlePromoteToGlobal(tag)}
                      className="p-1 text-theme-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Promote to Global (make available across all weddings)"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1 text-theme-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-theme-text-muted italic">No wedding-scoped tags created yet.</p>
            )}
          </div>

          {/* Global Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-theme-secondary" />
                <h4 className="font-serif font-bold text-sm text-theme-text-main">
                  Global Library Tags ({globalTags.length})
                </h4>
              </div>
              <span className="text-[11px] text-theme-text-muted">Available in every wedding</span>
            </div>

            {globalTags.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {globalTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1.5 p-1 rounded-2xl border border-theme-border bg-theme-background"
                  >
                    <TagBadge tag={tag} />
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1 text-theme-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete global tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-theme-text-muted italic">No global tags available.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-theme-background/60 border-t border-theme-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
