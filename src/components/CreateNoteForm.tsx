import { useState } from 'react';
import { useNotesStore } from '@/store/notesStore';

export function CreateNoteForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const { createNote } = useNotesStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await createNote({
      title: title.trim(),
      content: content.trim(),
      tags: tagsArray
    });

    // Reset form
    setTitle('');
    setContent('');
    setTags('');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setTags('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="create-note-button"
      >
        + New Note
      </button>
    );
  }

  return (
    <div className="create-note-form">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>Create New Note</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="close-button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="note-title">Title *</label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            required
            autoFocus
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="note-content">Content</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter note content..."
            rows={6}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="note-tags">Tags (comma-separated)</label>
          <input
            id="note-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Note
          </button>
        </div>
      </form>
    </div>
  );
}

