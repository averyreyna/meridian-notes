import { featureRegistry } from '@/lib/features/registry';
import { useNotesStore } from '@/store/notesStore';

interface PropertyEditorProps {
  noteId: string;
  featureId: string;
  currentValue: any;
}

export function PropertyEditor({ 
  noteId, 
  featureId, 
  currentValue 
}: PropertyEditorProps) {
  const { setNoteProperty } = useNotesStore();
  const feature = featureRegistry.get(featureId);

  if (!feature || feature.type !== 'property') return null;

  const options = feature.defaultConfig?.options || [];

  return (
    <div className="property-editor">
      <label className="property-label">{feature.name}:</label>
      <select
        value={currentValue || ''}
        onChange={(e) => setNoteProperty(noteId, featureId, e.target.value)}
        className="property-select"
      >
        <option value="">None</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

