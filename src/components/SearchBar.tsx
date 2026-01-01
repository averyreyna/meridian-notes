import { useState, useMemo } from 'react';
import { useNotesStore } from '@/store/notesStore';
import { useFeaturesStore } from '@/store/featuresStore';
import { featureRegistry } from '@/lib/features/registry';

interface SearchBarProps {
  onResultsChange: (results: (any)[] | null) => void;
}

export function SearchBar({ onResultsChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { searchNotes } = useNotesStore();
  const { enabledFeatures } = useFeaturesStore();

  const propertyFeatures = useMemo(() => {
    return featureRegistry
      .getEnabled(enabledFeatures)
      .filter(f => f.type === 'property' && f.attributeRole);
  }, [enabledFeatures]);

  const results = useMemo(() => {
    const hasActiveSearch = query.trim().length > 0 || Object.keys(filters).length > 0;
    if (!hasActiveSearch) {
      // Return null to indicate no active search
      onResultsChange(null);
      return [];
    }
    const searchResults = searchNotes(query, filters);
    onResultsChange(searchResults);
    return searchResults;
  }, [query, filters, searchNotes, onResultsChange]);

  const updateFilter = (featureId: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === '' || value === null) {
        delete newFilters[featureId];
      } else {
        newFilters[featureId] = value;
      }
      return newFilters;
    });
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="search-clear"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {propertyFeatures.length > 0 && (
        <div className="search-filters">
          {propertyFeatures.map(feature => {
            const options = feature.defaultConfig?.options || [];
            const currentValue = filters[feature.id] || '';

            return (
              <div key={feature.id} className="filter-group">
                <label className="filter-label">{feature.name}:</label>
                <select
                  value={currentValue}
                  onChange={(e) => updateFilter(feature.id, e.target.value)}
                  className="filter-select"
                >
                  <option value="">All</option>
                  {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results-count">
          Found {results.length} note{results.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

