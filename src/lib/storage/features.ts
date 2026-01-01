const STORAGE_KEY = 'notes-app-features';

export interface FeaturePreferences {
  enabledFeatures: string[];
  featureConfigs: Record<string, any>;
  featureOrder: string[];
  zoomLevel: number;
  visibilitySettings: Record<string, number>; // min zoom level per feature
  viewType: 'list' | 'grid' | 'table' | 'map';
  hiddenAttributes: string[];
}

export function loadFeaturePreferences(): FeaturePreferences {
  const stored = localStorage.getItem(STORAGE_KEY);
  const defaults: FeaturePreferences = {
    enabledFeatures: ['word-count', 'last-edited'], // defaults
    featureConfigs: {},
    featureOrder: [],
    zoomLevel: 3,
    visibilitySettings: {},
    viewType: 'grid',
    hiddenAttributes: []
  };
  
  if (!stored) {
    return defaults;
  }
  
  try {
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle missing new fields
    return {
      ...defaults,
      ...parsed,
      viewType: parsed.viewType || defaults.viewType,
      hiddenAttributes: parsed.hiddenAttributes || defaults.hiddenAttributes
    };
  } catch (e) {
    console.error('Error loading feature preferences:', e);
    return defaults;
  }
}

export function saveFeaturePreferences(prefs: FeaturePreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

