import type { FeatureDefinition } from '../types';

export const priorityFeature: FeatureDefinition = {
  id: 'priority',
  name: 'Priority',
  description: 'Set note priority level',
  type: 'property',
  category: 'organization',
  icon: '⚡',
  attributeRole: 'priority',
  renderAs: 'badge',
  defaultConfig: {
    options: ['High', 'Medium', 'Low'],
    colors: {
      'High': 'red',
      'Medium': 'yellow',
      'Low': 'green'
    }
  }
};

export const statusFeature: FeatureDefinition = {
  id: 'status',
  name: 'Status',
  description: 'Track note status',
  type: 'property',
  category: 'productivity',
  icon: '✅',
  attributeRole: 'status',
  renderAs: 'badge',
  defaultConfig: {
    options: ['Draft', 'In Progress', 'Complete', 'Archived']
  }
};

export const dueDateFeature: FeatureDefinition = {
  id: 'due-date',
  name: 'Due Date',
  description: 'Set a deadline',
  type: 'property',
  category: 'productivity',
  icon: '📅',
  attributeRole: 'due-date',
  renderAs: 'date'
};

