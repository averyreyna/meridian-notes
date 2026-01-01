import type { FeatureDefinition } from '../types';

export const wordCountFeature: FeatureDefinition = {
  id: 'word-count',
  name: 'Word Count',
  description: 'Number of words in the note',
  type: 'computed',
  category: 'analytics',
  icon: '📊',
  attributeRole: 'word-count',
  renderAs: 'number',
  compute: (note) => {
    return note.content.split(/\s+/).filter(w => w.length > 0).length;
  }
};

export const readingTimeFeature: FeatureDefinition = {
  id: 'reading-time',
  name: 'Reading Time',
  description: 'Estimated reading time',
  type: 'computed',
  category: 'analytics',
  icon: '⏱️',
  attributeRole: 'reading-time',
  renderAs: 'text',
  compute: (note) => {
    const words = note.content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  }
};

export const characterCountFeature: FeatureDefinition = {
  id: 'char-count',
  name: 'Character Count',
  description: 'Total characters including spaces',
  type: 'computed',
  category: 'analytics',
  icon: '🔤',
  attributeRole: 'char-count',
  renderAs: 'number',
  compute: (note) => note.content.length
};

export const lastEditedFeature: FeatureDefinition = {
  id: 'last-edited',
  name: 'Last Edited',
  description: 'Relative time since last edit',
  type: 'computed',
  category: 'organization',
  icon: '🕐',
  attributeRole: 'last-edited',
  renderAs: 'text',
  compute: (note, context) => {
    const now = context.timestamp;
    const diff = now - note.updatedAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }
};

