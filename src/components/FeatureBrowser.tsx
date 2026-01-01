import { featureRegistry } from '@/lib/features/registry';
import { useFeaturesStore } from '@/store/featuresStore';

export function FeatureBrowser() {
  const { enabledFeatures, enableFeature, disableFeature } = useFeaturesStore();
  const allFeatures = featureRegistry.getAll();

  const categories = ['productivity', 'organization', 'analytics', 'automation'] as const;

  return (
    <div className="feature-browser">
      <h2>Add Features</h2>
      
      {categories.map(category => (
        <div key={category} className="category-section">
          <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
          <div className="features-grid">
            {allFeatures
              .filter(f => f.category === category)
              .map(feature => {
                const isEnabled = enabledFeatures.includes(feature.id);
                
                return (
                  <div key={feature.id} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h4>{feature.name}</h4>
                    <p>{feature.description}</p>
                    <button
                      onClick={() => {
                        if (isEnabled) {
                          disableFeature(feature.id);
                        } else {
                          enableFeature(feature.id);
                        }
                      }}
                    >
                      {isEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

