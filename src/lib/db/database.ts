import Dexie, { Table } from 'dexie';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NoteProperty {
  id: string;
  noteId: string;
  featureId: string;
  value: any;
}

export interface UserFeature {
  featureId: string;
  enabled: boolean;
  config: any;
  order: number;
}

class NotesDatabase extends Dexie {
  notes!: Table<Note, string>;
  properties!: Table<NoteProperty, string>;
  features!: Table<UserFeature, string>;

  constructor() {
    super('NotesApp');
    
    this.version(1).stores({
      notes: 'id, title, createdAt, updatedAt, *tags',
      properties: 'id, noteId, featureId, [noteId+featureId]',
      features: 'featureId, order'
    });
  }
}

export const db = new NotesDatabase();

