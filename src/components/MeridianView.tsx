import { useMemo, useRef } from 'react';
// Temporarily disabled for testing
// import { MeridianWrapper } from 'meridian/src/renderer/wrapper';
// import { MeridianDetail, MeridianOverview } from 'meridian/src/renderer/renderer';
import { useNotesStore } from '@/store/notesStore';
import { useFeaturesStore } from '@/store/featuresStore';
import { generateNotesODI } from '@/lib/meridian/dynamicBinding';

interface MeridianViewProps {
  selectedNoteId?: string | null;
  onCloseDetail?: () => void;
  showOverview?: boolean;
}

export function MeridianView({ 
  selectedNoteId, 
  onCloseDetail,
  showOverview = false 
}: MeridianViewProps) {
  console.log('MeridianView - Component rendering', { selectedNoteId, showOverview });
  
  // Get loading state separately to avoid Map dependency
  const loading = useNotesStore((state) => state.loading);
  // Get Map size to track changes without depending on Map reference
  const enrichedNotesSize = useNotesStore((state) => state.enrichedNotes.size);
  
  const { enabledFeatures, viewType, hiddenAttributes, setViewType } = useFeaturesStore();
  const meridianViewRef = useRef<HTMLDivElement>(null);
  
  console.log('MeridianView - State:', { loading, notesCount: enrichedNotesSize, viewType });

  // Convert enriched notes to format that Meridian expects
  // Based on ODI dataBinding id='notes', Meridian expects { notes: [...] }
  // CRITICAL: Use getState() inside useMemo to avoid subscribing to Map reference
  // This prevents infinite loops by only reading the Map when size actually changes
  const notesData = useMemo(() => {
    // Get Map directly from store without subscribing to it
    const enrichedNotes = useNotesStore.getState().enrichedNotes;
    const notesArray = Array.from(enrichedNotes.values());
    console.log('MeridianView - Notes data:', {
      count: notesArray.length,
      sample: notesArray[0]
    });
    return { notes: notesArray };
  }, [enrichedNotesSize]); // Only depend on size - get Map inside without subscribing

  // Generate ODI based on enabled features and hidden attributes
  const odi = useMemo(() => {
    const generatedODI = generateNotesODI(enabledFeatures, hiddenAttributes);
    console.log('MeridianView - ODI:', {
      dataBinding: generatedODI.dataBinding,
      overviews: generatedODI.overviews.map(o => ({ id: o.id, type: o.type })),
      enabledFeatures,
      hiddenAttributes
    });
    return generatedODI;
  }, [enabledFeatures, hiddenAttributes]);

  // Map viewType to overview ID
  const overviewId = useMemo(() => {
    const mapping: Record<'list' | 'grid' | 'table' | 'map', string> = {
      'grid': 'notes-grid',
      'list': 'notes-list',
      'table': 'notes-table',
      'map': 'notes-map'
    };
    // Default to grid if viewType is not set
    const id = mapping[viewType] || 'notes-grid';
    console.log('MeridianView - Overview ID:', { viewType, overviewId: id });
    return id;
  }, [viewType]);

  // Note: Inline attribute hiding via clicks is temporarily disabled
  // The attribute hiding functionality still works via ODI filtering
  // We can re-enable click handlers once we understand how Meridian renders attributes

  // If no note is selected and we're not showing overview, return null
  if (!selectedNoteId && !showOverview) {
    return null;
  }

  // Show loading state
  if (loading) {
    console.log('MeridianView - Still loading...');
    return <div className="loading">Loading...</div>;
  }

  // Error boundary - if ODI or data is invalid, show error
  if (!odi || !notesData) {
    console.error('MeridianView - Invalid ODI or data:', { odi, notesData });
    return <div className="error">Error: Invalid data or ODI configuration</div>;
  }

  console.log('MeridianView - Rendering with:', {
    selectedNoteId,
    showOverview,
    overviewId,
    notesCount: notesData.notes.length
  });

  // TEMPORARILY DISABLED MeridianWrapper to test if it's causing the freeze
  console.log('MeridianView - Rendering simplified view (MeridianWrapper disabled for testing)');
  
  return (
    <div className="meridian-view" ref={meridianViewRef}>
      <div style={{ padding: '20px' }}>
        <h2>Meridian View (Testing Mode)</h2>
        <p>Notes count: {notesData.notes.length}</p>
        <p>View Type: {viewType || 'grid'}</p>
        <p>Overview ID: {overviewId}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Show Overview: {showOverview ? 'Yes' : 'No'}</p>
        <p>Selected Note ID: {selectedNoteId || 'None'}</p>
        
        {showOverview && (
          <div className="meridian-view-controls" style={{ 
            marginTop: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div className="view-selector" style={{ position: 'relative' }}>
              <label>View Type: </label>
              <select
                value={viewType || 'grid'}
                onChange={(e) => {
                  const newViewType = e.target.value as 'list' | 'grid' | 'table' | 'map';
                  console.log('Changing view type to:', newViewType);
                  setViewType(newViewType);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
                <option value="table">Table</option>
                <option value="map">Map</option>
              </select>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <h3>Sample Notes:</h3>
          {notesData.notes.slice(0, 3).map(note => (
            <div key={note.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
              <strong>{note.title}</strong>
              <p>{note.content?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* MeridianWrapper temporarily commented out for testing */}
      {/* 
      <MeridianWrapper
        data={notesData}
        odi={odi}
        onOpenOverviewNewPage={() => {
          console.log('onOpenOverviewNewPage called');
          if (onCloseDetail) {
            onCloseDetail();
          }
        }}
        onOpenDetailNewPage={() => {
          console.log('onOpenDetailNewPage called');
          if (onCloseDetail) {
            onCloseDetail();
          }
        }}
      >
        {selectedNoteId ? (
          <MeridianDetail itemId={selectedNoteId} detailId="note-detail" />
        ) : showOverview ? (
          <MeridianOverview overviewIdToShow={overviewId} />
        ) : null}
      </MeridianWrapper>
      */}
    </div>
  );
}

