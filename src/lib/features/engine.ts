import type { Note, NoteProperty } from '../db/database';
import { db } from '../db/database';
import { featureRegistry } from './registry';
import type { ComputeContext } from './types';

export class FeatureEngine {
  constructor(
    private enabledFeatureIds: string[]
  ) {}

  async computeForNote(note: Note): Promise<Record<string, any>> {
    const computed: Record<string, any> = {};
    
    // Get all notes for context (needed for rollups)
    const allNotes = await db.notes.toArray();
    const allProperties = await db.properties.toArray();
    
    const context: ComputeContext = {
      allNotes,
      allProperties,
      userConfig: {},
      timestamp: Date.now()
    };

    // Get enabled features
    const features = featureRegistry.getEnabled(this.enabledFeatureIds);

    for (const feature of features) {
      if (!feature.compute) continue;

      try {
        const value = feature.compute(note, context);
        
        if (feature.attributeRole) {
          computed[feature.attributeRole] = value;
        }
      } catch (error) {
        console.error(`Error computing feature ${feature.id}:`, error);
      }
    }

    // Add stored properties
    const noteProperties = allProperties.filter(p => p.noteId === note.id);
    for (const prop of noteProperties) {
      const feature = featureRegistry.get(prop.featureId);
      if (feature?.attributeRole) {
        computed[feature.attributeRole] = prop.value;
      }
    }

    return computed;
  }

  async computeForAllNotes(): Promise<Map<string, Record<string, any>>> {
    const notes = await db.notes.toArray();
    const results = new Map<string, Record<string, any>>();

    for (const note of notes) {
      const computed = await this.computeForNote(note);
      results.set(note.id, computed);
    }

    return results;
  }
}

