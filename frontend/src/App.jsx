import { useState, useEffect, useRef } from 'react';

export default function App() {
  // --- App navigation ---
  const [activeView, setActiveView] = useState('library');
  // ---  Podcast library ---
  const [podcasts, setPodcasts] = useState([]);
  const [selectedPodcastId, setSelectedPodcastId] = useState(null);
  // --- Podcast and episodes ---
  const [rssUrl, setRssUrl] = useState('');
  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  // --- Playback ---
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(null);
  const audioRef = useRef(null);

  // --- Podcast notes ---
  const [podcastNotes, setPodcastNotes] = useState([]);
  const [newPodcastNote, setNewPodcastNote] = useState('');

  // --- Episode notes ---
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [episodeNotes, setEpisodeNotes] = useState([]);
  const [newEpisodeNote, setNewEpisodeNote] = useState('');

  // --- Editing notes ---
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTimestamp, setEditingTimestamp] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadPodcast() {
    if (!rssUrl.trim()) {
      alert('Please enter an RSS feed URL');
      return;
    }

    setLoading(true);
    setError(null);
    setPodcast(null);
    setEpisodes([]);
    setPodcastNotes([]);
    setEpisodeNotes([]);
    setSelectedEpisodeId(null);

    try {
      const res = await fetch(`/api/podcast?rssUrl=${encodeURIComponent(rssUrl)}`);

      if (!res.ok) {
        throw new Error('Failed to load podcast');
      }

      const data = await res.json();
      setPodcast(data);
      setEpisodes(data.episodes);

      // Load podcast-wide notes
      const notesRes = await fetch(`/api/notes?podcastId=${data.id}`);
      setPodcastNotes(await notesRes.json());
    } catch (error) {
      console.error(error);
      setError('Failed to load podcast');
    } finally {
      setLoading(false);
    }
  }

  // Always start with the library view
  useEffect(() => {
    fetch('/api/podcasts')
      .then(res => res.json())
      .then(setPodcasts)
      .catch(error => console.error('Failed to load library', error));
  }, []);
  // Helper function to load a podcast by id
  async function loadPodcastById(podcastId) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/podcast?id=${podcastId}`);
      if (!res.ok) throw new Error('Failed to load podcast');

      const data = await res.json();

      setPodcast(data);
      setEpisodes(data.episodes);
      setSelectedPodcastId(podcastId);
      setActiveView('podcast');

      // Load podcast-wide notes
      const noteRes = await fetch(`/api/notes?podcastId=${podcastId}`);
      setPodcastNotes(await noteRes.json());
    } catch (error) {
      console.error(error);
      setError('Failed to load podcast');
    } finally {
      setLoading(false);
    }
  }
  // Load episode notes when dropdown selection changes
  useEffect(() => {
    if (!selectedEpisodeId) return;

    fetch(`/api/notes?episodeId=${selectedEpisodeId}`)
      .then(res => res.json())
      .then(setEpisodeNotes);
  }, [selectedEpisodeId]);

  async function addPodcastNote() {
    if (!newPodcastNote.trim()) return;

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        podcastId: podcast.id,
        content: newPodcastNote,
      }),
    });

    const note = await res.json();
    setPodcastNotes([...podcastNotes, note]);
    setNewPodcastNote('');
  }

  async function addEpisodeNote() {
    if (!newEpisodeNote.trim() || !selectedEpisodeId) return;

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId: selectedEpisodeId,
        content: newEpisodeNote,
        timestampSeconds: null,
      }),
    });

    const note = await res.json();
    setEpisodeNotes([...episodeNotes, note]);
    setNewEpisodeNote('');
  }
  async function addEpisodeNoteAtCurrentTime() {
    if (!newEpisodeNote.trim() || !selectedEpisodeId) return;
    if (!audioRef.current) return;

    const timestampSeconds = Math.floor(audioRef.current.currentTime);

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId: selectedEpisodeId,
        content: newEpisodeNote,
        timestampSeconds,
      }),
    });

    const note = await res.json();
    setEpisodeNotes([...episodeNotes, note]);
    setNewEpisodeNote('');
  }
  // Helper to format timestamp
  function formatTimestamp(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }
  async function saveEditedNote(noteId) {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editingContent, timestampSeconds: editingTimestamp }),
    });

    const updated = await res.json();

    // Update both lists
    setPodcastNotes(notes => notes.map(n => (n.id === updated.id ? updated : n)));
    setEpisodeNotes(notes => notes.map(n => (n.id === updated.id ? updated : n)));

    setEditingNoteId(null);
    setEditingContent('');
  }

  async function deleteNoteById(noteId) {
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });

    setPodcastNotes(notes => notes.filter(n => n.id !== noteId));
    setEpisodeNotes(notes => notes.filter(n => n.id !== noteId));
  }
  /**
   * Derive the currently plaiyng audio URL
   */
  const currentAudioUrl =
    currentEpisodeIndex !== null ? episodes[currentEpisodeIndex]?.audioUrl : null;
  return (
    <div className="pb-20">
      {/* Library View */}
      {activeView === 'library' && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Your Podcasts</h2>
          {podcasts.length === 0 && (
            <div className="text-gray-600">No podcasts yet. Add one using an RSS feed.</div>
          )}

          <ul className="grid gap-4">
            {podcasts.map(podcast => (
              <li
                key={podcast.id}
                onClick={() => loadPodcastById(podcast.id)}
                className="cursor-pointer rounded bg-white p-4 shadow hover:bg-gray-50"
              >
                <div className="text-lg font-semibold">{podcast.title || 'Untitled Podcast'}</div>

                {podcast.description && (
                  <div className="mt-1 text-sm text-gray-600">{podcast.description}</div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  {podcast.episodeCount} episodes - {podcast.noteCount} notes
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Podcast Detail View */}
      {activeView === 'podcast' && (
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <button
              onClick={() => {
                setSelectedPodcastId(null);
                setPodcast(null);
                setActiveView('library');
              }}
              className="mb-4 text-sm text-blue-600 cursor-pointer"
            >
              Back to Library
            </button>
            <h1 className="text-3xl font-bold">Podcast Player</h1>

            {/* RSS Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={rssUrl}
                onChange={e => setRssUrl(e.target.value)}
                placeholder="Podcast RSS URL"
                className="flex-1 rounded border p-2"
              />
              <button
                onClick={loadPodcast}
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load'}
              </button>
            </div>

            {error && <div className="text-red-600">{error}</div>}

            {/* Podcast notes */}
            {podcast && (
              <section className="rounded bg-white p-4 shadow">
                <h2 className="mb-2 text-xl font-semibold">Podcast Notes</h2>
                <ul className="mb-3 space-y-2 text-sm">
                  {podcastNotes.map(note => (
                    <li key={note.id} className="rounded bg-gray-100 p-2">
                      {editingNoteId === note.id ? (
                        <>
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            className="mb-2 w-full rounded border p-1"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditedNote(note.id)}
                              className="text-sm text-blue-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="text-sm text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>{note.content}</div>
                          <div className="mt-1 flex gap-3 text-xs text-gray-600">
                            <button
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingContent(note.content);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteNoteById(note.id)}
                              className="text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <textarea
                  value={newPodcastNote}
                  onChange={e => setNewPodcastNote(e.target.value)}
                  placeholder="Add a podcast-wide note..."
                  className="mb-2 w-full rounded border p-2"
                />
                <button
                  onClick={addPodcastNote}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Save Note
                </button>
              </section>
            )}

            {/* Episode notes */}
            {podcast && (
              <section className="rounded bg-white p-4 shadow">
                <h2 className="mb-2 text-xl font-semibold">Episode Notes</h2>

                <select
                  value={selectedEpisodeId ?? ''}
                  onChange={e => setSelectedEpisodeId(Number(e.target.value))}
                  className="mb-3 w-full rounded border p-2"
                >
                  <option value="">Select an episode</option>
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.title}
                    </option>
                  ))}
                </select>

                {selectedEpisodeId && (
                  <>
                    <ul className="mb-3 space-y-2 text-sm">
                      {episodeNotes.map(note => (
                        <li key={note.id} className="rounded bg-gray-100 p-2">
                          {editingNoteId === note.id ? (
                            <>
                              {note.timestampSeconds !== null && (
                                <input
                                  type="number"
                                  min="0"
                                  value={editingTimestamp}
                                  onChange={e => setEditingTimestamp(Number(e.target.value))}
                                  className="mb-1 w-24 rounded border p-1 text-xs"
                                  placeholder="Seconds"
                                />
                              )}
                              <textarea
                                value={editingContent}
                                onChange={e => setEditingContent(e.target.value)}
                                className="mb-2 w-full rounded border p-1"
                              />
                              <div className="flex gap-2 text-sm">
                                <button
                                  onClick={() => saveEditedNote(note.id)}
                                  className="text-sm text-blue-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className="text-sm text-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-start gap-2">
                                {note.timestampSeconds !== null && (
                                  <button
                                    onClick={() => {
                                      // Switch episode if needed
                                      const episodeIndex = episodes.findIndex(
                                        ep => ep.id === note.episodeId,
                                      );

                                      if (episodeIndex !== -1) {
                                        setCurrentEpisodeIndex(episodeIndex);

                                        // Wait for audio source to update
                                        setTimeout(() => {
                                          if (audioRef.current) {
                                            audioRef.current.currentTime = note.timestampSeconds;
                                            audioRef.current.play();
                                          }
                                        }, 200);
                                      }
                                    }}
                                    className="text-blue-600 text-xs font-mono"
                                  >
                                    [{formatTimestamp(note.timestampSeconds)}]
                                  </button>
                                )}
                              </div>
                              <div>{note.content}</div>
                              <div className="mt-1 flex gap-3 text-xs text-gray-600">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingContent(note.content);
                                    setEditingTimestamp(note.timestampSeconds ?? 0);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteNoteById(note.id)}
                                  className="text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="mb-2 flex gap-2">
                      <textarea
                        value={newEpisodeNote}
                        onChange={e => setNewEpisodeNote(e.target.value)}
                        placeholder="Add an episode note..."
                        className="flex-1 rounded border p-2"
                      />

                      <button
                        onClick={addEpisodeNote}
                        className="rounded bg-blue-600 px-3 py-2 text-white"
                      >
                        Add{' '}
                      </button>

                      <button
                        onClick={addEpisodeNoteAtCurrentTime}
                        className="rounded bg-green-600 px-3 py-2 text-white"
                        title="Add note at current playback time"
                        disabled={!audioRef.current}
                      >
                        Add Timed Note
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Audio Player */}
            {currentAudioUrl && (
              <audio ref={audioRef} controls autoPlay src={currentAudioUrl} className="w-full" />
            )}

            {/* Episode List */}
            <ul className="divide-y rounded bg-white shadow">
              {episodes.map((episode, index) => {
                const isPlaying = index === currentEpisodeIndex;

                return (
                  <li
                    key={episode.id}
                    onClick={() => {
                      if (!episode.audioUrl) {
                        alert('No audio available for this episode');
                        return;
                      }
                      // Start playback
                      setCurrentEpisodeIndex(index);
                      // Sync episode notes
                      setSelectedEpisodeId(episode.id);
                    }}
                    className={`cursor-pointer p-3 transition
                  ${isPlaying ? 'bg-blue-50 pointer-events-none' : 'hover:bg-gray-50'}
                `}
                  >
                    <div className={`font-semibold ${isPlaying ? 'text-blue-700' : ''}`}>
                      {episode.title}
                    </div>

                    <div className="text-sm text-gray-600">{episode.description}</div>

                    {isPlaying && (
                      <div className="mt-2 text-xs font-semibold text-blue-600">Now Playing</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* TODO: Recent Episodes View */}
      {activeView === 'recent' && <div className="text-gray-600">Recent Episodes</div>}
      {/* TODO: Add podcast via RSS view */}
      {activeView === 'add' && <div className="text-gray-600">Add podcast via RSS</div>}
      {/* TODO: All notes view*/}
      {activeView === 'notes' && <div className="text-gray-600">All notes</div>}
      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full bg-white px-3 py-2 shadow-lg">
        <button
          onClick={() => setActiveView('recent')}
          className={`rounded-full px-4 py-2 text-sm ${activeView === 'recent' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveView('add')}
          className={`rounded-full px-4 py-2 text-sm ${activeView === 'add' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
        >
          Add
        </button>
        <button
          onClick={() => setActiveView('notes')}
          className={`rounded-full px-4 py-2 text-sm ${activeView === 'notes' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
        >
          Notes
        </button>
      </nav>
    </div>
  );
}
