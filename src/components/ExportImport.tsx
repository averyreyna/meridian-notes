import { useRef } from 'react';
import { exportAllData, importData } from '@/lib/export';

export function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportAllData();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('This will replace all your current notes. Are you sure?')) {
      return;
    }

    try {
      await importData(file);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  return (
    <div className="export-import">
      <h3>Backup & Restore</h3>
      <div className="export-import-buttons">
        <button onClick={handleExport} className="export-button">
          Export All Data
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="import-button"
        >
          Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

