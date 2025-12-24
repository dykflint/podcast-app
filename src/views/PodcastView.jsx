/**
 * src/views/PodcastView.jsx
 *
 */
import { useRef } from 'react';

export default function PodcastView({
  podcast,
  episodes,
  podcastNotes,
  episodeNotes,
  selectedEpisodeId,
  setSelectedEpisodeId,
  currentEpisodeIndex,
  setCurrentEpisodeIndex,
  audioRef,
  currentAudioUrl,
  rssUrl,
  setRssUrl,
  loadPodcast,
  loading,
  error,
  onBack,
  onAddPodcastNote,
  onAddEpisodeNote,
  onAddEpisodeNoteAtCurrentTime,
  onSaveEditedNote,
  onDeleteNote,
  formatTimestamp,
  editingNoteId,
  setEditingNoteId,
  editingContent,
  setEditingContent,
  // editingTimestamp,
  // setEditingTimestamp,
  newPodcastNote,
  setNewPodcastNote,
  newEpisodeNote,
  setNewEpisodeNote,
}) {
  const timestampInputRef = useRef(null);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <button onClick={onBack} className="mb-4 cursor-pointer text-sm text-blue-600">
          {' '}
          Back to Library{' '}
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
                          onClick={() => onSaveEditedNote(note.id)}
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
                        <button onClick={() => deleteNoteById(note.id)} className="text-red-600">
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
            <button onClick={onAddPodcastNote} className="rounded bg-blue-600 px-3 py-1 text-white">
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
                          <input
                            ref={timestampInputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            defaultValue={
                              note.timestampSeconds !== null ? String(note.timestampSeconds) : ''
                            }
                            className="mb-1 w-24 rounded border p-1 text-xs"
                            placeholder="Seconds"
                          />
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            className="mb-2 w-full rounded border p-1"
                          />
                          <div className="flex gap-2 text-sm">
                            <button
                              onClick={() => {
                                const raw = timestampInputRef.current?.value ?? '';
                                const timestampSeconds = raw === '' ? null : Number(raw);

                                onSaveEditedNote(note.id, timestampSeconds);
                              }}
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
                              }}
                            >
                              Edit
                            </button>
                            <button onClick={() => onDeleteNote(note.id)} className="text-red-600">
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
                    onClick={onAddEpisodeNote}
                    className="rounded bg-blue-600 px-3 py-2 text-white"
                  >
                    Add{' '}
                  </button>

                  <button
                    onClick={onAddEpisodeNoteAtCurrentTime}
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
                className={`flex items-start gap-3 cursor-pointer p-3 transition
              ${isPlaying ? 'bg-blue-50 pointer-events-none' : 'hover:bg-gray-50'}
            `}
              >
                {/* Episode artwork (podcast-level) */}
                {podcast?.imageUrl ? (
                  <img
                    src={podcast.imageUrl}
                    alt={podcast.title}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded bg-gray-200" />
                )}

                {/* Episode info */}
                <div className="flex-1">
                  <div className={`font-semibold ${isPlaying ? 'text-blue-700' : ''}`}>
                    {episode.title}
                  </div>

                  <div className="text-sm text-gray-600 line-clamp-2">{episode.description}</div>

                  {isPlaying && (
                    <div className="mt-1 text-xs font-semibold text-blue-600">Now Playing</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
