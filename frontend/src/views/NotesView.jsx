/**
 * frontend/src/views/NotesView.jsx
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
export default function NotesView({ onOpenNote }) {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const url = query ? `/api/notes?q=${encodeURIComponent(query)}` : '/api/notes';
    apiFetch(url)
      // .then(res => res.json())
      .then(setNotes);
  }, [query]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">All Notes</h1>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search notes..."
        className="w-full rounded border p-2"
      />
      <ul className="space-y-3">
        {notes.map(note => (
          <li
            key={note.id}
            className="rounded bg-white p-3 shadow cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (!note.podcast || !note.episode) return;

              onOpenNote({
                podcastId: note.podcast.id,
                episodeId: note.episode.id,
              });
            }}
          >
            <div className="text-sm">{note.content}</div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              {note.timestampSeconds !== null && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenNote({
                      podcastId: note.podcast.id,
                      episodeId: note.episode.id,
                      timestampSeconds: note.timestampSeconds,
                    });
                  }}
                  className="font-mono text-blue-600"
                >
                  [{Math.floor(note.timestampSeconds / 60)}:
                  {(note.timestampSeconds % 60).toString().padStart(2, '0')}]
                </button>
              )}

              {note.episode && <span>{note.episode.title}</span>}
              {note.podcast && <span>{note.podcast.title}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
