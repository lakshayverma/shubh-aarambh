import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { TagBadge } from './TagBadge';
import { Tag as TagIcon, Plus } from 'lucide-react';

interface TagSelectorProps {
  weddingId: string;
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onOpenManager?: () => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  weddingId,
  selectedTagIds,
  onChange,
  onOpenManager,
}) => {
  const allTags = useLiveQuery(() => db.tags.toArray());

  const availableTags = allTags?.filter(
    (t) => t.scope === 'global' || (t.scope === 'wedding' && t.weddingId === weddingId)
  ) || [];

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((tId) => tId !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
          <TagIcon className="w-3.5 h-3.5 text-theme-secondary" />
          <span>Tags & Roles</span>
        </label>
        {onOpenManager && (
          <button
            type="button"
            onClick={onOpenManager}
            className="text-[11px] font-semibold text-theme-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Manage Tags</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-theme-border bg-theme-background min-h-[42px] items-center">
        {availableTags.length > 0 ? (
          availableTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`transition-all rounded-full ${
                  isSelected
                    ? 'ring-2 ring-theme-primary ring-offset-1 scale-105'
                    : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                }`}
              >
                <TagBadge tag={tag} size="sm" />
              </button>
            );
          })
        ) : (
          <span className="text-xs text-theme-text-muted italic px-2">
            No tags configured. Click Manage Tags to create.
          </span>
        )}
      </div>
    </div>
  );
};
