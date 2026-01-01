import { db } from '@/lib/db/database';
import { loadFeaturePreferences, saveFeaturePreferences } from '@/lib/storage/features';

export async function exportAllData() {
  const notes = await db.notes.toArray();
  const properties = await db.properties.toArray();
  const features = await db.features.toArray();
  const prefs = loadFeaturePreferences();

  const data = {
    version: '1.0',
    exportedAt: Date.now(),
    notes,
    properties,
    features,
    preferences: prefs
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File) {
  const text = await file.text();
  const data = JSON.parse(text);

  // Clear existing data
  await db.notes.clear();
  await db.properties.clear();
  await db.features.clear();

  // Import
  await db.notes.bulkAdd(data.notes);
  await db.properties.bulkAdd(data.properties);
  if (data.features) await db.features.bulkAdd(data.features);
  if (data.preferences) saveFeaturePreferences(data.preferences);

  // Reload
  window.location.reload();
}

