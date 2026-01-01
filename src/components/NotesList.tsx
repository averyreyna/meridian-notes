import { useEffect, useState } from 'react';
import { useNotesStore } from '@/store/notesStore';
import { useFeaturesStore } from '@/store/featuresStore';
import { useDynamicODI } from '@/hooks/useDynamicODI';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { CreateNoteForm } from './CreateNoteForm';

interface NotesListProps {
  onNoteSelect?: (noteId: string) => void;
}

export function NotesList({ onNoteSelect }: NotesListProps) {
  console.log('NotesList - Component rendering');
  // CRITICAL: Only subscribe to size, not the Map itself, to avoid infinite loops
  const enrichedNotesSize = useNotesStore((state) => state.enrichedNotes.size);
  const loading = useNotesStore((state) => state.loading);
  const loadNotes = useNotesStore((state) => state.loadNotes);
  console.log('NotesList - State:', { loading, enrichedNotesSize });
  const { enabledFeatures } = useFeaturesStore();
  const [displayedNotes, setDisplayedNotes] = useState<Array<any>>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Temporarily disabled to test if this is causing the freeze
  // useDynamicODI();

  // REMOVED: loadNotes is already called in App.tsx
  // Calling it here too was causing conflicts
  // useEffect(() => {
  //   loadNotes();
  // }, []);

  // REMOVED: This was causing infinite loop
  // The recomputeFeatures should be called from loadNotes, not here
  // useEffect(() => {
  //   // Recompute when features change
  //   useNotesStore.getState().recomputeFeatures();
  // }, [enabledFeatures]);

  useEffect(() => {
    // Update displayed notes when enriched notes change (if not searching)
    // CRITICAL: Use getState() to avoid subscribing to Map reference
    // Only depend on size to avoid infinite loops from Map reference changes
    if (!isSearching) {
      const enrichedNotes = useNotesStore.getState().enrichedNotes;
      const allNotes = Array.from(enrichedNotes.values());
      setDisplayedNotes(allNotes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichedNotesSize, isSearching]);

  const handleSearchResults = (results: any[] | null) => {
    // null means no active search - show all notes
    if (results === null) {
      // Use getState() to avoid subscribing to Map
      const enrichedNotes = useNotesStore.getState().enrichedNotes;
      const allNotes = Array.from(enrichedNotes.values());
      setDisplayedNotes(allNotes);
      setIsSearching(false);
    } else {
      setDisplayedNotes(results);
      setIsSearching(true);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notes-list-container">
      <div className="notes-list-header">
        <CreateNoteForm />
        <SearchBar onResultsChange={handleSearchResults} />
      </div>
      
      {displayedNotes.length === 0 ? (
        <div className="empty-state">
          <p>No notes found.</p>
          {isSearching && <p className="empty-state-hint">Try adjusting your search or filters.</p>}
        </div>
      ) : (
        <div className="notes-grid">
          {displayedNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onSelect={onNoteSelect ? () => onNoteSelect(note.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

