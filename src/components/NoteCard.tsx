import type { Note } from '@/lib/db/database';
import { featureRegistry } from '@/lib/features/registry';
import { useFeaturesStore } from '@/store/featuresStore';
import { PropertyEditor } from './PropertyEditor';

interface NoteCardProps {
  note: Note & Record<string, any>;
  onSelect?: () => void;
}

export function NoteCard({ note, onSelect }: NoteCardProps) {
  const { enabledFeatures } = useFeaturesStore();
  const enabledFeatureDefs = featureRegistry.getEnabled(enabledFeatures);

  return (
    <div 
      className="note-card" 
      onClick={onSelect}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <h3>{note.title}</h3>
      <p className="note-content">{note.content}</p>
      
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag: string) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="note-features">
        {enabledFeatureDefs.map(feature => {
          if (!feature.attributeRole) return null;
          
          const value = note[feature.attributeRole];
          if (value === undefined || value === null) return null;

          return (
            <div key={feature.id} className="feature-attribute">
              {feature.type === 'property' ? (
                <PropertyEditor
                  noteId={note.id}
                  featureId={feature.id}
                  currentValue={value}
                />
              ) : (
                <div className="computed-feature">
                  <span className="feature-label">{feature.name}:</span>
                  <span className="feature-value">
                    {feature.renderAs === 'badge' ? (
                      <span className="badge">{value}</span>
                    ) : (
                      value
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="note-footer">
        <span className="note-date">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

