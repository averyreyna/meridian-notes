import type { Note, NoteProperty } from '../db/database';

export type FeatureType = 
  | 'computed'
  | 'property'
  | 'rollup'
  | 'behavior';

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  type: FeatureType;
  icon?: string;
  category: 'productivity' | 'organization' | 'analytics' | 'automation';
  
  // Meridian integration
  attributeRole?: string;
  renderAs?: 'text' | 'number' | 'badge' | 'progress' | 'date';
  
  // Computation (client-side)
  compute?: (note: Note, context: ComputeContext) => any;
  
  // Configuration
  configSchema?: any;
  defaultConfig?: any;
}

export interface ComputeContext {
  allNotes: Note[];
  allProperties: NoteProperty[];
  userConfig: any;
  timestamp: number;
}

