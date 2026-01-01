import { create } from 'zustand';
import { loadFeaturePreferences, saveFeaturePreferences } from '@/lib/storage/features';
import { featureRegistry } from '@/lib/features/registry';

interface FeaturesState {
  enabledFeatures: string[];
  featureConfigs: Record<string, any>;
  featureOrder: string[];
  zoomLevel: number;
  viewType: 'list' | 'grid' | 'table' | 'map';
  hiddenAttributes: string[];
  _isLoading?: boolean; // Internal: prevent load() loops
  
  // Actions
  enableFeature: (featureId: string, config?: any) => void;
  disableFeature: (featureId: string) => void;
  updateFeatureConfig: (featureId: string, config: any) => void;
  reorderFeatures: (newOrder: string[]) => void;
  setZoomLevel: (level: number) => void;
  setViewType: (type: 'list' | 'grid' | 'table' | 'map') => void;
  toggleAttributeVisibility: (attributeRole: string) => void;
  
  // Persistence
  save: () => void;
  load: () => void;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  enabledFeatures: [],
  featureConfigs: {},
  featureOrder: [],
  zoomLevel: 3,
  viewType: 'grid',
  hiddenAttributes: [],
  _isLoading: false, // Internal flag to prevent load() loops

  enableFeature: (featureId, config) => {
    const feature = featureRegistry.get(featureId);
    set(state => ({
      enabledFeatures: [...state.enabledFeatures, featureId],
      featureConfigs: {
        ...state.featureConfigs,
        [featureId]: config || feature?.defaultConfig
      },
      featureOrder: [...state.featureOrder, featureId]
    }));
    get().save();
  },

  disableFeature: (featureId) => {
    set(state => ({
      enabledFeatures: state.enabledFeatures.filter(id => id !== featureId),
      featureOrder: state.featureOrder.filter(id => id !== featureId)
    }));
    get().save();
  },

  updateFeatureConfig: (featureId, config) => {
    set(state => ({
      featureConfigs: {
        ...state.featureConfigs,
        [featureId]: config
      }
    }));
    get().save();
  },

  reorderFeatures: (newOrder) => {
    set({ featureOrder: newOrder });
    get().save();
  },

  setZoomLevel: (level) => {
    set({ zoomLevel: level });
    get().save();
  },

  setViewType: (type) => {
    set({ viewType: type });
    get().save();
  },

  toggleAttributeVisibility: (attributeRole) => {
    set(state => {
      const isHidden = state.hiddenAttributes.includes(attributeRole);
      return {
        hiddenAttributes: isHidden
          ? state.hiddenAttributes.filter(role => role !== attributeRole)
          : [...state.hiddenAttributes, attributeRole]
      };
    });
    get().save();
  },

  save: () => {
    try {
      const state = get();
      // Use a closure variable to throttle saves, not state
      const now = Date.now();
      if (!(save as any)._lastSave || now - (save as any)._lastSave > 500) {
        (save as any)._lastSave = now;
        saveFeaturePreferences({
          enabledFeatures: state.enabledFeatures,
          featureConfigs: state.featureConfigs,
          featureOrder: state.featureOrder,
          zoomLevel: state.zoomLevel,
          visibilitySettings: {},
          viewType: state.viewType,
          hiddenAttributes: state.hiddenAttributes
        });
      }
    } catch (error) {
      console.error('featuresStore.save() error:', error);
    }
  },

  load: () => {
    const state = get();
    // Prevent multiple simultaneous loads
    if (state._isLoading) {
      console.log('featuresStore.load() - already loading, skipping');
      return;
    }
    
    try {
      set({ _isLoading: true });
      console.log('featuresStore.load() called');
      const prefs = loadFeaturePreferences();
      console.log('featuresStore.load() - loaded prefs:', prefs);
      // Merge with defaults to ensure all fields are present
      const newState = {
        enabledFeatures: prefs.enabledFeatures || [],
        featureConfigs: prefs.featureConfigs || {},
        featureOrder: prefs.featureOrder || [],
        zoomLevel: prefs.zoomLevel ?? 3,
        viewType: prefs.viewType || 'grid',
        hiddenAttributes: prefs.hiddenAttributes || [],
        _isLoading: false
      };
      // Only update if state actually changed to prevent loops
      const current = get();
      const hasChanges = 
        JSON.stringify(current.enabledFeatures) !== JSON.stringify(newState.enabledFeatures) ||
        current.viewType !== newState.viewType ||
        JSON.stringify(current.hiddenAttributes) !== JSON.stringify(newState.hiddenAttributes) ||
        current.zoomLevel !== newState.zoomLevel;
      
      if (hasChanges) {
        console.log('featuresStore.load() - state changed, updating');
        set(newState);
      } else {
        console.log('featuresStore.load() - no changes, skipping update');
        set({ _isLoading: false });
      }
      // Don't call save() here - it would create a loop
    } catch (error) {
      console.error('featuresStore.load() error:', error);
      set({ _isLoading: false });
    }
  }
}));

