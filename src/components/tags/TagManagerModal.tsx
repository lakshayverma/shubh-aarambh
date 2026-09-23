import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Tag } from '../../db/schema';
import { TagBadge } from './TagBadge';
import { NestedScreen } from '../common/NestedScreen';
import { CustomToggle } from '../common/CustomToggle';
import {
  Tag as TagIcon,
  Globe,
  Plus,
  ArrowUpRight,
  Trash2,
  Edit2,
  Search,
  Crown,
  Heart,
  Sparkles,
  Music,
  Shield,
  Star,
  Users,
  Smile,
  Utensils,
  Car,
  Hotel,
  Gem,
  Award,
  Flag,
  Baby,
  Coffee,
  Flower2,
  Bell,
  Bookmark,
  Camera,
  Flame,
  Gift,
  Compass,
  Sun,
  MapPin,
  Save,
} from 'lucide-react';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingId: string;
}

// Map of distinct Lucide icons
export const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Tag: TagIcon,
  Crown: Crown,
  Heart: Heart,
  Sparkles: Sparkles,
  Music: Music,
  Shield: Shield,
  Star: Star,
  Users: Users,
  Smile: Smile,
  Utensils: Utensils,
  Car: Car,
  Hotel: Hotel,
  Gem: Gem,
  Award: Award,
  Flag: Flag,
  Baby: Baby,
  Coffee: Coffee,
  Flower2: Flower2,
  Bell: Bell,
  Bookmark: Bookmark,
  Camera: Camera,
  Flame: Flame,
  Gift: Gift,
  Compass: Compass,
  Sun: Sun,
  MapPin: MapPin,
};

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

const ITEMS_PER_PAGE = 8;

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose,
  weddingId,
}) => {
  const allTags = useLiveQuery(() => db.tags.toArray());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'wedding' | 'global'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Level 2 Nested Drawer State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Form Fields
  const [tagName, setTagName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isGlobalScope, setIsGlobalScope] = useState(false);

  // Filtered Tags
  const filteredTags = useMemo(() => {
    if (!allTags) return [];
    return allTags.filter((tag) => {
      // Must belong to this wedding or be global
      if (tag.scope === 'wedding' && tag.weddingId !== weddingId) return false;

      // Scope filter
      if (scopeFilter === 'wedding' && tag.scope !== 'wedding') return false;
      if (scopeFilter === 'global' && tag.scope !== 'global') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return tag.name.toLowerCase().includes(q) || tag.icon.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allTags, weddingId, scopeFilter, searchQuery]);

  // Paginated tags
  const totalPages = Math.max(1, Math.ceil(filteredTags.length / ITEMS_PER_PAGE));
  const paginatedTags = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTags.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTags, currentPage]);

  const handleOpenCreate = () => {
    setEditingTagId(null);
    setTagName('');
    setSelectedIcon('Tag');
    setSelectedColor(PRESET_COLORS[0]);
    setIsGlobalScope(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setTagName(tag.name);
    setSelectedIcon(tag.icon);
    setSelectedColor(tag.color);
    setIsGlobalScope(tag.scope === 'global');
    setIsFormOpen(true);
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const scope = isGlobalScope ? 'global' : 'wedding';
    const tagData: Tag = {
      id: editingTagId || `tag-${Date.now()}`,
      name: tagName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      scope,
      weddingId: scope === 'wedding' ? weddingId : undefined,
    };

    await db.tags.put(tagData);
    setIsFormOpen(false);
    setEditingTagId(null);
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      await db.tags.delete(id);
    }
  };

  const handlePromoteToGlobal = async (tag: Tag) => {
    if (confirm(`Promote "${tag.name}" to a Global Tag? It will be accessible across all weddings.`)) {
      await db.tags.update(tag.id, {
        scope: 'global',
        weddingId: undefined,
      });
    }
  };

  return (
    <>
      {/* Level 1 Drawer: Structured List */}
      <NestedScreen
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Tags & Badges"
        subtitle="Organize guests, rooms, and family members with structured color badges"
        mode="drawer"
        width="2xl"
        level={1}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-stone-500">
              Total {filteredTags.length} tags
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover transition-all"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Top Actions: Search + Filter + Create CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search tags by name or icon..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-0.5 border border-stone-200 dark:border-stone-700 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setScopeFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    scopeFilter === 'all'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScopeFilter('wedding');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    scopeFilter === 'wedding'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Wedding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScopeFilter('global');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    scopeFilter === 'global'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Global
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Tag</span>
              </button>
            </div>
          </div>

          {/* Structured Tag List / Table */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-stone-100 dark:divide-stone-800/80 bg-white dark:bg-stone-900">
            {paginatedTags.length > 0 ? (
              paginatedTags.map((tag) => {
                const IconComponent = ICON_MAP[tag.icon] || TagIcon;
                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3.5 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                            {tag.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              tag.scope === 'global'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {tag.scope === 'global' ? 'Global Scope' : 'Wedding Only'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400">
                          <span className="font-mono">{tag.color}</span>
                          <span>&bull;</span>
                          <span>Icon: {tag.icon}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tag)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        title="Edit Tag"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {tag.scope === 'wedding' && (
                        <button
                          type="button"
                          onClick={() => handlePromoteToGlobal(tag)}
                          className="p-1.5 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                          title="Promote to Global (make available in all weddings)"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">
                No tags found matching your filters. Click <strong>+ Create Tag</strong> to add one.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </NestedScreen>

      {/* Level 2 Nested Drawer: Create / Edit Tag Form */}
      <NestedScreen
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTagId ? 'Edit Tag' : 'Create New Tag'}
        subtitle="Configure badge icon glyph, custom hex color, and scope"
        mode="drawer"
        width="lg"
        level={2}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTag}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingTagId ? 'Save Changes' : 'Create Tag'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTag} className="space-y-6">
          {/* Tag Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Tag Name
            </label>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="e.g. VIP Elder, Bride Squad, Safawala, Choreographer..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>

          {/* Scope Interactive Switch (Requirement 10) */}
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Tag Availability Scope
              </div>
              <div className="text-[11px] text-stone-400">
                {isGlobalScope
                  ? 'Global: Shared and reusable across all client weddings'
                  : 'Wedding Only: Unique and scoped to this wedding'}
              </div>
            </div>
            <CustomToggle
              checked={isGlobalScope}
              onChange={setIsGlobalScope}
              labelLeft="Wedding"
              labelRight="Global"
            />
          </div>

          {/* Badge Icon Picker (Requirement 7: Distinct Lucide Icons) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
              Select Distinct Badge Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-800 rounded-2xl max-h-48 overflow-y-auto">
              {Object.keys(ICON_MAP).map((iconKey) => {
                const IconComp = ICON_MAP[iconKey];
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setSelectedIcon(iconKey)}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500/30 scale-105'
                        : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-300 hover:text-stone-900'
                    }`}
                    title={iconKey}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Badge Color Palette & Custom Color Picker (Requirement 8) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Select or Custom Hex Color
            </label>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selectedColor.toLowerCase() === c.toLowerCase()
                      ? 'scale-125 border-stone-900 dark:border-white shadow-md'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="color"
                value={selectedColor.startsWith('#') && selectedColor.length === 7 ? selectedColor : '#7B1113'}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                placeholder="#RRGGBB"
                className="w-36 px-3 py-2 text-xs font-mono rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 uppercase"
              />
              <span className="text-[11px] text-stone-400">Custom hex or palette selection</span>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Live Badge Preview:</span>
            <TagBadge
              tag={{
                id: 'preview',
                name: tagName.trim() || 'Sample Badge',
                icon: selectedIcon,
                color: selectedColor,
                scope: isGlobalScope ? 'global' : 'wedding',
              }}
            />
          </div>
        </form>
      </NestedScreen>
    </>
  );
};
