import type { FeatureDefinition } from '../types';

export const totalNotesFeature: FeatureDefinition = {
  id: 'total-notes',
  name: 'Total Notes',
  description: 'Count of all notes',
  type: 'rollup',
  category: 'analytics',
  icon: '📝',
  compute: (note, context) => context.allNotes.length
};

export const totalWordsFeature: FeatureDefinition = {
  id: 'total-words',
  name: 'Total Words',
  description: 'Sum of words across all notes',
  type: 'rollup',
  category: 'analytics',
  icon: '📈',
  compute: (note, context) => {
    return context.allNotes.reduce((sum, n) => {
      return sum + n.content.split(/\s+/).length;
    }, 0);
  }
};

export const tagStatsFeature: FeatureDefinition = {
  id: 'tag-stats',
  name: 'Tag Statistics',
  description: 'Most used tags',
  type: 'rollup',
  category: 'analytics',
  icon: '🏷️',
  compute: (note, context) => {
    const tagCounts = new Map<string, number>();
    context.allNotes.forEach(n => {
      n.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }
};

