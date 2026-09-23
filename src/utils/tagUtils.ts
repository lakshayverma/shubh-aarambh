import { db } from '../db';
import { Tag } from '../db/schema';

export const DEFAULT_SYSTEM_TAGS: Tag[] = [
  { id: 'tag-core-family', name: 'Core Family', icon: 'Crown', color: '#D97706', scope: 'global' },
  { id: 'tag-coordinator', name: 'Event Coordinator', icon: 'Briefcase', color: '#4F46E5', scope: 'global' },
  { id: 'tag-diet-veg', name: 'Pure Veg', icon: 'Utensils', color: '#16A34A', scope: 'global' },
  { id: 'tag-diet-jain', name: 'Jain Food', icon: 'Sparkles', color: '#059669', scope: 'global' },
  { id: 'tag-diet-nonveg', name: 'Non-Veg', icon: 'Flame', color: '#DC2626', scope: 'global' },
  { id: 'tag-diet-vegan', name: 'Vegan', icon: 'Leaf', color: '#65A30D', scope: 'global' },
  { id: 'tag-vip', name: 'VIP Guest', icon: 'Star', color: '#9333EA', scope: 'global' },
  { id: 'tag-elderly', name: 'Elderly Care', icon: 'HeartHandshake', color: '#BE185D', scope: 'global' },
];

export async function ensureDefaultTags(): Promise<void> {
  try {
    const existing = await db.tags.toArray();
    const existingIds = new Set(existing.map((t) => t.id));
    const toAdd = DEFAULT_SYSTEM_TAGS.filter((t) => !existingIds.has(t.id));
    if (toAdd.length > 0) {
      await db.tags.bulkPut(toAdd);
    }
  } catch (err) {
    console.error('Error ensuring default system tags:', err);
  }
}

/**
 * Synchronizes a member's tagIds with their Core Family, Operational Role,
 * and Dietary Preference attributes so all common data is queryable via the tag system.
 */
export function syncMemberTags(
  currentTagIds: string[] = [],
  isCoreFamily: boolean,
  roleTitle: string | undefined,
  dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'vegan'
): string[] {
  const tags = new Set<string>(currentTagIds);

  // Core Family tag sync
  if (isCoreFamily) {
    tags.add('tag-core-family');
  } else {
    tags.delete('tag-core-family');
  }

  // Event Coordinator tag sync
  if (roleTitle && roleTitle.trim().length > 0) {
    tags.add('tag-coordinator');
  } else {
    tags.delete('tag-coordinator');
  }

  // Dietary tags sync (clear old dietary tags, then assign new)
  tags.delete('tag-diet-veg');
  tags.delete('tag-diet-jain');
  tags.delete('tag-diet-nonveg');
  tags.delete('tag-diet-vegan');

  if (dietaryPreference === 'pure_veg') tags.add('tag-diet-veg');
  else if (dietaryPreference === 'jain') tags.add('tag-diet-jain');
  else if (dietaryPreference === 'non_veg') tags.add('tag-diet-nonveg');
  else if (dietaryPreference === 'vegan') tags.add('tag-diet-vegan');

  return Array.from(tags);
}
