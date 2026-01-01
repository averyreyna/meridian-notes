import type { FeatureDefinition } from './types';

class FeatureRegistry {
  private features: Map<string, FeatureDefinition> = new Map();

  register(feature: FeatureDefinition) {
    this.features.set(feature.id, feature);
  }

  get(id: string): FeatureDefinition | undefined {
    return this.features.get(id);
  }

  getAll(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  getByCategory(category: string): FeatureDefinition[] {
    return this.getAll().filter(f => f.category === category);
  }

  getEnabled(enabledIds: string[]): FeatureDefinition[] {
    return enabledIds
      .map(id => this.get(id))
      .filter(Boolean) as FeatureDefinition[];
  }
}

export const featureRegistry = new FeatureRegistry();

