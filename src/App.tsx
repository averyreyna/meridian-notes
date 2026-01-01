import { useEffect, useState } from 'react';
import { NotesList } from './components/NotesList';
import { FeatureBrowser } from './components/FeatureBrowser';
import { ExportImport } from './components/ExportImport';
import { MeridianView } from './components/MeridianView';
import { useNotesStore } from './store/notesStore';
import { useFeaturesStore } from './store/featuresStore';
import { initializeDB } from './lib/db/helpers';

function App() {
  const { loadNotes, loading } = useNotesStore();
  const { load } = useFeaturesStore();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'meridian'>('list');
  
  console.log('App - Render:', { viewMode, selectedNoteId, loading });

  useEffect(() => {
    // Initialize database and load data - only run once
    let isMounted = true;
    const init = async () => {
      console.log('App - init starting');
      await initializeDB();
      if (!isMounted) return;
      console.log('App - DB initialized');
      load(); // Load feature preferences
      if (!isMounted) return;
      console.log('App - Features loaded');
      await loadNotes(); // Load notes
      if (!isMounted) return;
      console.log('App - Notes loaded');
    };
    init().catch(err => {
      console.error('App - Init error:', err);
    });
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    setViewMode('meridian');
  };

  const handleCloseDetail = () => {
    setSelectedNoteId(null);
    setViewMode('list');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meridian Notes</h1>
        <div className="view-mode-toggle">
          <button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'active' : ''}
          >
            List View
          </button>
          <button
            onClick={() => {
              setViewMode('meridian');
              setSelectedNoteId(null);
            }}
            className={viewMode === 'meridian' ? 'active' : ''}
          >
            Meridian View
          </button>
        </div>
      </header>
      <main className="app-main">
        <div className="app-sidebar">
          <FeatureBrowser />
          <ExportImport />
        </div>
        <div className="app-content">
          {viewMode === 'list' ? (
            <NotesList onNoteSelect={handleNoteSelect} />
          ) : (
            <MeridianView
              selectedNoteId={selectedNoteId}
              onCloseDetail={handleCloseDetail}
              showOverview={!selectedNoteId}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

