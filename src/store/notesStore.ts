import { create } from 'zustand';
import type { Note } from '@/lib/db/database';
import { db } from '@/lib/db/database';
import { FeatureEngine } from '@/lib/features/engine';
import { featureRegistry } from '@/lib/features/registry';
import { useFeaturesStore } from './featuresStore';

interface NotesState {
  notes: Note[];
  enrichedNotes: Map<string, Note & Record<string, any>>;
  loading: boolean;
  
  // Actions
  loadNotes: () => Promise<void>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Property management
  setNoteProperty: (noteId: string, featureId: string, value: any) => Promise<void>;
  
  // Recompute features
  recomputeFeatures: () => Promise<void>;
  
  // Search
  searchNotes: (query: string, filters: Record<string, any>) => (Note & Record<string, any>)[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  enrichedNotes: new Map(),
  loading: false,

  loadNotes: async () => {
    try {
      debugger;
      console.log('loadNotes - Starting');
      set({ loading: true });
      debugger;
      const notes = await db.notes.toArray();
      console.log('loadNotes - Loaded notes:', notes.length);
      set({ notes });
      debugger;
      await get().recomputeFeatures();
      console.log('loadNotes - Completed');
      set({ loading: false });
      debugger;
    } catch (error) {
      console.error('loadNotes - Error:', error);
      debugger;
      set({ loading: false });
    }
  },

  createNote: async (noteData) => {
    const note: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await db.notes.add(note);
    await get().loadNotes();
    return note;
  },

  updateNote: async (id, updates) => {
    await db.notes.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
    await get().loadNotes();
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    await db.properties.where('noteId').equals(id).delete();
    await get().loadNotes();
  },

  setNoteProperty: async (noteId, featureId, value) => {
    await db.properties.put({
      id: `${noteId}-${featureId}`,
      noteId,
      featureId,
      value
    });
    await get().recomputeFeatures();
  },

  recomputeFeatures: async () => {
    try {
      debugger;
      console.log('recomputeFeatures - Starting');
      const { notes } = get();
      const { enabledFeatures } = useFeaturesStore.getState();
      console.log('recomputeFeatures - Notes count:', notes.length, 'Enabled features:', enabledFeatures);
      
      // Don't clear if we have no notes - keep existing enriched notes
      if (notes.length === 0) {
        console.log('recomputeFeatures - No notes, skipping');
        return;
      }
      
      const engine = new FeatureEngine(enabledFeatures);
      const enriched = new Map<string, Note & Record<string, any>>();

      for (const note of notes) {
        try {
          const computed = await engine.computeForNote(note);
          enriched.set(note.id, { ...note, ...computed });
        } catch (noteError) {
          console.error(`recomputeFeatures - Error computing note ${note.id}:`, noteError);
          // Still add the note even if feature computation fails
          enriched.set(note.id, note);
        }
      }

      console.log('recomputeFeatures - Completed, enriched count:', enriched.size);
      debugger;
      
      // Only update if the Map contents actually changed (by comparing IDs)
      // This prevents infinite loops from Map reference changes
      const current = get().enrichedNotes;
      
      // Handle empty Maps - if both are empty, no need to update
      if (current.size === 0 && enriched.size === 0) {
        console.log('recomputeFeatures - Both Maps empty, skipping update');
        return;
      }
      
      // Compare IDs to detect actual changes
      const currentIds = Array.from(current.keys()).sort().join(',');
      const newIds = Array.from(enriched.keys()).sort().join(',');
      
      // CRITICAL: Only update if IDs or size actually changed
      // This prevents infinite loops by keeping the same Map reference when contents are identical
      const hasChanges = currentIds !== newIds || current.size !== enriched.size;
      
      if (hasChanges) {
        console.log('recomputeFeatures - Changes detected, updating Map', {
          currentSize: current.size,
          newSize: enriched.size,
          currentIds,
          newIds
        });
        set({ enrichedNotes: enriched });
      } else {
        console.log('recomputeFeatures - No changes detected, keeping existing Map reference');
        // CRITICAL: Don't call set() - keeping the existing Map reference prevents re-renders
        // This is the key to preventing infinite loops
        return;
      }
    } catch (error) {
      console.error('recomputeFeatures - Error:', error);
      debugger;
      // Don't clear enriched notes on error - keep what we have
      // set({ enrichedNotes: new Map() });
    }
  },

  searchNotes: (query: string, filters: Record<string, any>) => {
    const { enrichedNotes } = get();
    const notes = Array.from(enrichedNotes.values());

    return notes.filter(note => {
      // Text search
      const matchesText = !query || 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase());

      // Feature filters
      const matchesFilters = Object.entries(filters).every(([featureId, value]) => {
        const feature = featureRegistry.get(featureId);
        if (!feature?.attributeRole) return true;
        
        const noteValue = note[feature.attributeRole];
        return noteValue === value;
      });

      return matchesText && matchesFilters;
    });
  }
}));

