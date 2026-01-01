import { db } from './database';

export async function initializeDB() {
  // Check if DB is empty
  const noteCount = await db.notes.count();
  
  if (noteCount === 0) {
    // Seed with sample notes
    await db.notes.bulkAdd([
      {
        id: '1',
        title: 'Welcome to Notes',
        content: 'This is your first note!',
        tags: ['welcome'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]);
  }
}

