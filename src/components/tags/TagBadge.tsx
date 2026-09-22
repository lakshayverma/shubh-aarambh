import React from 'react';
import { Tag as TagType } from '../../db/schema';
import * as Icons from 'lucide-react';
import { Globe } from 'lucide-react';

interface TagBadgeProps {
  tag: TagType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  showLabel = true,
  size = 'md',
  onRemove,
}) => {
  // Dynamically resolve icon from lucide-react or fallback
  const IconComponent = (Icons as Record<string, any>)[tag.icon] || Icons.Tag;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `${tag.color}15`,
        borderColor: `${tag.color}40`,
        color: tag.color,
      }}
      title={`${tag.name} (${tag.scope === 'global' ? 'Global Tag' : 'Wedding Tag'})`}
    >
      {/* Circular icon container */}
      <span
        className={`rounded-full flex items-center justify-center flex-shrink-0 text-white ${
          isSmall ? 'w-4 h-4' : 'w-4.5 h-4.5'
        }`}
        style={{ backgroundColor: tag.color }}
      >
        <IconComponent className={isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      </span>

      {showLabel && (
        <span className="font-semibold truncate max-w-[120px]">
          {tag.name}
        </span>
      )}

      {tag.scope === 'global' && (
        <span title="Global Tag (available across all weddings)" className="inline-flex">
          <Globe className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-80 rounded-full"
        >
          <Icons.X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
