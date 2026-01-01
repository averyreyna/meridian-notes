# Meridian Implementation Guide

## Overview

Meridian is a design framework for building **malleable Overview-Detail Interfaces (ODIs)**. It allows users to customize the content, composition, and layout of their interfaces at runtime without requiring code changes. Perfect for applications like notes apps where users need flexible, personalized views of their data.

## Core Concepts

### ODI (Overview-Detail Interface)
An ODI consists of:
- **Overview**: A view that displays multiple items (list, grid, table, map, etc.)
- **Detail**: A view that displays detailed information about a single selected item
- **Data Binding**: Maps your data structure to Meridian's attribute system

### Malleability
Meridian makes interfaces "malleable" by allowing users to:
- **Content**: Show/hide attributes (fields) dynamically
- **Composition**: Add/remove overviews and detail views
- **Layout**: Change how views are arranged (panels, tabs, side-by-side)

## Installation & Setup

### 1. Install Meridian Package

```bash
# In your project root
npm install meridian
# or if using a local link
npm link meridian
```

### 2. Import Required CSS

Import Meridian's styles in your app's main CSS file or layout:

```typescript
import 'meridian/src/index.css';
// or
import 'meridian/dist/meridian.css';
```

### 3. Install Peer Dependencies

Ensure you have React 18+ and Zustand installed (if not already):

```bash
npm install react react-dom zustand
```

## Basic Implementation

### Step 1: Define Your Data Structure

Create your data file (JSON or TypeScript):

```typescript
// notes-data.json
[
  {
    "id": "note-1",
    "title": "Meeting Notes",
    "content": "Discussed Q4 goals...",
    "createdAt": "2024-01-15",
    "tags": ["work", "meeting"]
  },
  {
    "id": "note-2",
    "title": "Shopping List",
    "content": "Milk, eggs, bread...",
    "createdAt": "2024-01-16",
    "tags": ["personal"]
  }
]
```

### Step 2: Create an ODI Specification

Create a `.meridian.ts` file that defines how your data maps to Meridian:

```typescript
// notes.meridian.ts
import { BindingItemType, DataBindingType, ODI } from "meridian/src/spec/spec";

// Define how your data items are mapped to Meridian attributes
export const notesBinding: BindingItemType = {
  itemId: '.id', // Path to unique identifier in your data
  attributes: [
    { value: '.title', roles: ['title'] },
    { value: '.content', roles: ['description'] },
    { value: '.createdAt', roles: ['subtitle'] },
    { value: '.tags', roles: ['tag'] },
  ],
}

const dataBinding: DataBindingType[] = [
  { id: 'notes', binding: notesBinding },
]

// Define the ODI structure
export const notesODI: ODI = {
  dataBinding: dataBinding,
  overviews: [
    {
      id: 'notes-overview',
      type: 'list', // or 'grid', 'table', 'map', 'area-chart'
      bindingId: 'notes', // References the dataBinding id
      itemView: { type: 'profile' }, // or 'vertical', 'compact', 'pin'
      shownAttributes: 'all', // Show all attributes by default
    },
  ],
  detailViews: [], // Optional: define detail views
}
```

### Step 3: Wrap Your App with MeridianWrapper

In your page component (e.g., Next.js page):

```typescript
// app/notes/page.tsx
'use client';

import { MeridianWrapper } from 'meridian/src/renderer/wrapper';
import { MeridianOverview } from 'meridian/src/renderer/renderer';
import { notesODI } from './notes.meridian';
import notesData from './notes-data.json';
import { useRouter } from 'next/navigation';
import { FetchedItemType } from 'meridian/src/spec/spec.internal';

export default function NotesPage() {
  const router = useRouter();

  return (
    <MeridianWrapper
      data={notesData}
      odi={notesODI}
      onOpenDetailNewPage={(item: FetchedItemType) => {
        router.push(`/notes/${item.itemId}`);
      }}
      onOpenOverviewNewPage={() => {
        router.push('/notes');
      }}
    >
      <MeridianOverview />
    </MeridianWrapper>
  );
}
```

### Step 4: Create Detail View Page (Optional)

For viewing individual notes:

```typescript
// app/notes/[id]/page.tsx
'use client';

import { MeridianWrapper } from 'meridian/src/renderer/wrapper';
import { MeridianDetail } from 'meridian/src/renderer/renderer';
import { notesODI } from '../notes.meridian';
import notesData from '../notes-data.json';
import { useParams } from 'next/navigation';

export default function NoteDetailPage() {
  const params = useParams();
  const itemId = params.id as string;

  return (
    <MeridianWrapper
      data={notesData}
      odi={notesODI}
      onOpenOverviewNewPage={() => {
        // Handle navigation back to overview
      }}
    >
      <MeridianDetail itemId={itemId} detailId="note-detail" />
    </MeridianWrapper>
  );
}
```

## Enabling Malleability

To make your interface malleable, add the `malleability` property to your ODI:

```typescript
export const notesODI: ODI = {
  dataBinding: dataBinding,
  overviews: [...],
  detailViews: [...],
  malleability: {
    disabled: false,
    content: {
      disabled: false,
      types: ['toggle'], // Allows users to show/hide attributes
    },
    composition: {
      disabled: false,
      types: ['tabs'], // Allows adding/removing views via tabs
    },
    layout: {
      disabled: false,
      types: ['menus'], // Allows changing layout arrangement
    },
  },
}
```

**Malleability Features:**
- **Content**: Users can right-click attributes to show/hide them
- **Composition**: Users can add multiple overviews/details (configured via UI)
- **Layout**: Users can arrange views in different layouts (panels, tabs, etc.)

## Data Binding Deep Dive

### Attribute Roles

Roles define the semantic purpose of attributes. Common roles:
- `'title'` - Main heading
- `'subtitle'` - Secondary heading
- `'description'` - Main content/body
- `'key-attribute'` - Important distinguishing attribute
- `'thumbnail'` - Image/preview
- `'tag'` - Tags/labels
- `'badge'` - Status indicators
- `'action'` - Buttons/links
- Custom roles: Any string you define

### Transform Operations

Transform data during binding:

```typescript
{
  value: '.tags',
  transform: [
    { map: '.' }, // Map over array
    { filter: { exists: '.name' } }, // Filter items
    { slice: { start: 0, end: 5 } }, // Limit items
  ],
  roles: ['tag'],
}
```

### Conditional Attributes

Show different attributes based on data:

```typescript
attributes: [
  {
    condition: {
      comparison: {
        field: '.type',
        operator: '==',
        value: 'note'
      }
    },
    attributes: [
      { value: '.title', roles: ['title'] },
      { value: '.content', roles: ['description'] },
    ]
  },
  {
    condition: {
      comparison: {
        field: '.type',
        operator: '==',
        value: 'task'
      }
    },
    attributes: [
      { value: '.title', roles: ['title'] },
      { value: '.completed', roles: ['badge'] },
    ]
  },
]
```

## Custom Components

### Custom Item Views

Create custom components for how items appear in overviews:

```typescript
// item-view-note.tsx
import { getAttributesByRole } from 'meridian/src/helpers/attribute.helper';
import { Role } from 'meridian/src/spec/spec';
import { FetchedItemType, ViewOptions } from 'meridian/src/spec/spec.internal';
import { Attribute } from 'meridian/src/renderer/attribute';

export const ItemViewNote = ({
  options,
  item,
  index,
}: {
  options: ViewOptions;
  item: FetchedItemType;
  index: number;
}) => {
  if (!item) return <></>;

  return (
    <div className="note-item">
      <Attribute
        className="title"
        options={options}
        attribute={getAttributesByRole(item, 'title' as Role)}
      />
      <Attribute
        className="content"
        options={options}
        attribute={getAttributesByRole(item, 'description' as Role)}
      />
    </div>
  );
};
```

Register in config:

```typescript
// notes-config.tsx
import { ItemViewNote } from './item-view-note';

export const notesConfig = {
  customItemViewTypes: [
    { type: 'note', view: ItemViewNote },
  ],
};
```

### Custom Detail Views

Create custom detail view components:

```typescript
// detail-view-note.tsx
import { getAttributesByRole } from 'meridian/src/helpers/attribute.helper';
import { DetailViewConfig } from 'meridian/src/spec/spec';
import { FetchedItemType } from 'meridian/src/spec/spec.internal';
import { Attribute } from 'meridian/src/renderer/attribute';
import { useODI } from 'meridian/src/store/odi.store';

export interface DetailViewNoteType extends DetailViewConfig {
  type: 'note';
}

export const DetailViewNote = ({ item }: { item: FetchedItemType | undefined }) => {
  const { selectedItemEntity } = useODI();

  if (!selectedItemEntity || !item) {
    return <div></div>;
  }

  return (
    <div className="detail-view-note">
      <Attribute
        className="title"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'title')}
      />
      <Attribute
        className="content-editor"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'description')}
      />
    </div>
  );
};
```

### Custom Attribute Types

Create custom renderers for specific attribute types:

```typescript
// attribute-rich-text.tsx
import { AttributeProps } from 'meridian/src/renderer/renderer.props';

export const AttributeRichText = ({ attribute }: AttributeProps) => {
  const value = attribute?.value;
  
  return (
    <div 
      className="rich-text"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};
```

Register in config:

```typescript
export const notesConfig = {
  customAttributeTypes: [
    { type: 'rich-text', view: AttributeRichText },
  ],
};
```

## Complete Notes App Example

### 1. Data Structure
```json
// notes-data.json
[
  {
    "id": "1",
    "title": "Meeting Notes",
    "content": "Discussed project goals...",
    "createdAt": "2024-01-15T10:00:00Z",
    "tags": ["work", "meeting"],
    "pinned": false
  }
]
```

### 2. ODI Specification
```typescript
// notes.meridian.ts
import { BindingItemType, DataBindingType, ODI } from "meridian/src/spec/spec";

export const notesBinding: BindingItemType = {
  itemId: '.id',
  attributes: [
    { value: '.title', roles: ['title'] },
    { value: '.content', roles: ['description'] },
    { value: '.createdAt', roles: ['subtitle'] },
    { value: '.tags', roles: ['tag'] },
    { value: '.pinned', roles: ['badge'] },
  ],
}

const dataBinding: DataBindingType[] = [
  { id: 'notes', binding: notesBinding },
]

export const notesODI: ODI = {
  dataBinding: dataBinding,
  overviews: [
    {
      id: 'notes-overview',
      type: 'list',
      bindingId: 'notes',
      itemView: { type: 'profile' },
      shownAttributes: 'all',
      detailViews: [
        {
          id: 'note-detail',
          type: 'basic',
          openFrom: ['title', 'item'],
          openIn: 'new-page',
        },
      ],
    },
  ],
  malleability: {
    disabled: false,
    content: {
      disabled: false,
      types: ['toggle'],
    },
  },
}
```

### 3. Page Implementation
```typescript
// app/notes/page.tsx
'use client';

import { MeridianWrapper } from 'meridian/src/renderer/wrapper';
import { MeridianOverview } from 'meridian/src/renderer/renderer';
import { notesODI } from './notes.meridian';
import notesData from './notes-data.json';
import { useRouter } from 'next/navigation';
import { FetchedItemType } from 'meridian/src/spec/spec.internal';

export default function NotesPage() {
  const router = useRouter();

  return (
    <MeridianWrapper
      data={notesData}
      odi={notesODI}
      onOpenDetailNewPage={(item: FetchedItemType) => {
        router.push(`/notes/${item.itemId}`);
      }}
      onOpenOverviewNewPage={() => {
        router.push('/notes');
      }}
    >
      <MeridianOverview />
    </MeridianWrapper>
  );
}
```

## Advanced Features

### Nested Overviews (Recursive ODIs)

Create overviews within detail views:

```typescript
detailViews: [
  {
    id: 'note-detail',
    type: 'basic',
    overviews: [
      {
        id: 'related-notes',
        type: 'grid',
        bindingId: 'notes',
        itemView: { type: 'compact' },
      },
    ],
  },
]
```

### Multiple Data Bindings

Handle multiple data sources:

```typescript
const dataBinding: DataBindingType[] = [
  { id: 'notes', binding: notesBinding },
  { id: 'tasks', binding: tasksBinding },
];

overviews: [
  {
    bindingId: 'notes',
    // ...
  },
  {
    bindingId: 'tasks',
    // ...
  },
]
```

### View Layout Configuration

Control how multiple views are arranged:

```typescript
export const notesODI: ODI = {
  // ...
  viewLayout: [
    {
      viewId: 'notes-overview',
      type: 'panels',
      placement: 'left',
    },
    {
      viewId: 'note-detail',
      type: 'panels',
      placement: 'right',
    },
  ],
}
```

## Tips & Best Practices

1. **Start Simple**: Begin with basic list/grid overviews and basic detail views
2. **Use Roles Effectively**: Leverage semantic roles (`title`, `description`, etc.) for automatic layout
3. **Enable Malleability Gradually**: Start with content malleability, then add composition/layout
4. **Custom Components When Needed**: Use custom views/attributes only when built-in ones don't suffice
5. **Data Binding**: Keep data binding logic in your `.meridian.ts` file, separate from components
6. **Navigation**: Always provide `onOpenDetailNewPage` and `onOpenOverviewNewPage` handlers

## Key Files Reference

- **ODI Specification**: `src/spec/spec.ts` - Type definitions for ODI structure
- **Renderer**: `src/renderer/renderer.tsx` - Core rendering components (`MeridianOverview`, `MeridianDetail`)
- **Wrapper**: `src/renderer/wrapper.tsx` - `MeridianWrapper` component
- **Defaults**: `src/renderer/renderer.defaults.ts` - Built-in view/attribute types
- **Store**: `src/store/odi.store.ts` - Zustand store for ODI state

## Example References

Check these examples in the codebase:
- **Simple Notes App**: `examples/gallery/src/views/d2-5/notes.meridian.ts`
- **Complex Product Catalog**: `examples/gallery/src/views/d2-1/att.meridian.ts`
- **Thesaurus with Nested Views**: `examples/gallery/src/views/d2-3/thesaurus.meridian.ts`

