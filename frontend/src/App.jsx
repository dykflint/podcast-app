import { useState, useEffect } from 'react';

export default function App() {
  // --- Podcast and episodes ---
  const [rssUrl, setRssUrl] = useState('');
  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  // --- Playback ---
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(null);

  // --- Podcast notes ---
  const [podcastNotes, setPodcastNotes] = useState([]);
  const [newPodcastNote, setNewPodcastNote] = useState('');

  // --- Episode notes ---
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [episodeNotes, setEpisodeNotes] = useState([]);
  const [newEpisodeNote, setNewEpisodeNote] = useState('');

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
    } catch (err) {
      console.error(err);
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
      }),
    });

    const note = await res.json();
    setEpisodeNotes([...episodeNotes, note]);
    setNewEpisodeNote('');
  }

  /**
   * Derive the currently plaiyng audio URL
   */
  const currentAudioUrl =
    currentEpisodeIndex !== null ? episodes[currentEpisodeIndex]?.audioUrl : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
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
            <ul className="mb-3 space-y2 text-sm">
              {podcastNotes.map(note => (
                <li key={note.id} className="rounded bg-gray-100 p-2">
                  {note.content}
                </li>
              ))}
            </ul>

            <textarea
              value={newPodcastNote}
              onChange={e => setNewPodcastNote(e.target.value)}
              placeholder="Add a podcast-white note..."
              className="mb-2 w-full rounded border p-2"
            />
            <button onClick={addPodcastNote} className="rounded bg-blue-600 px-3 py-1 text-white">
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
                      {note.content}
                    </li>
                  ))}
                </ul>

                <textarea
                  value={newEpisodeNote}
                  onChange={e => setNewEpisodeNote(e.target.value)}
                  placeholder="Add an episode note..."
                  className="mb-2 w-full rounded border p-2"
                />
                <button
                  onClick={addEpisodeNote}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Save Note
                </button>
              </>
            )}
          </section>
        )}

        {/* Audio Player */}
        {currentAudioUrl && <audio controls autoPlay src={currentAudioUrl} className="w-full" />}

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
                  setCurrentEpisodeIndex(index);
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
  );
}
