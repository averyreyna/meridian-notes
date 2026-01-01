import type { BindingItemType, ODI } from 'meridian/src/spec/spec';
import { featureRegistry } from '@/lib/features/registry';

export function generateNotesODI(
  enabledFeatureIds: string[],
  hiddenAttributes: string[] = []
): ODI {
  const features = featureRegistry.getEnabled(enabledFeatureIds);
  
  // Base attributes
  const baseAttributes = [
    { value: '.title', roles: ['title'] },
    { value: '.content', roles: ['definition'] },
    { value: '.tags', roles: ['tag'] },
    { value: '.createdAt', roles: ['footer'] },
  ];

  // Add feature attributes, filtering out hidden ones
  const featureAttributes = features
    .filter(f => f.attributeRole && !hiddenAttributes.includes(f.attributeRole))
    .map(f => ({
      value: `.${f.attributeRole!}`,
      roles: [f.attributeRole!],
      label: f.name
    }));

  // Get visible attribute roles for shownAttributes
  const visibleAttributeRoles = features
    .filter(f => f.attributeRole && !hiddenAttributes.includes(f.attributeRole))
    .map(f => f.attributeRole!);

  const noteBinding: BindingItemType = {
    itemId: '.id',
    attributes: [...baseAttributes, ...featureAttributes]
  };

  // Generate multiple overview definitions for different view types
  const overviews = [
    {
      id: 'notes-grid',
      type: 'grid',
      itemView: { type: 'card' },
      shownAttributes: ['title', 'tag', ...visibleAttributeRoles.slice(0, 2)],
      detailViews: ['note-detail']
    },
    {
      id: 'notes-list',
      type: 'list',
      itemView: { type: 'card' },
      shownAttributes: ['title', 'tag', ...visibleAttributeRoles.slice(0, 2)],
      detailViews: ['note-detail']
    },
    {
      id: 'notes-table',
      type: 'table',
      itemView: { type: 'row' },
      shownAttributes: ['title', 'tag', ...visibleAttributeRoles],
      detailViews: ['note-detail']
    },
    {
      id: 'notes-map',
      type: 'map',
      itemView: { type: 'marker' },
      shownAttributes: ['title', 'tag'],
      detailViews: ['note-detail']
    }
  ];

  return {
    dataBinding: [{ id: 'notes', binding: noteBinding }],
    overviews,
    detailViews: [
      {
        id: 'note-detail',
        type: 'basic',
        openFrom: 'all',
        overviews: []
      }
    ]
  };
}

