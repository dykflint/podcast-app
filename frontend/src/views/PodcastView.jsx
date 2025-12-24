/**
 * frontend/src/views/PodcastView.jsx
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
  setCurrentEpisodeIndex,
  // Audio playback
  playEpisode,
  nowPlaying,
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
  secondsToMMSS,
  editingNoteId,
  setEditingNoteId,
  editingContent,
  setEditingContent,
  editingTimestampText,
  setEditingTimestampText,
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

        {/* PODCAST NOTES */}
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
                        <button onClick={() => onDeleteNote(note.id)} className="text-red-600">
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

        {/* EPISODE NOTES */}
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
                            type="text"
                            value={editingTimestampText}
                            onChange={e => {
                              const value = e.target.value;
                              // allow only digits + colon
                              if (/^[0-9:]*$/.test(value)) {
                                setEditingTimestampText(value);
                              }
                            }}
                            className="mb-1 w-24 rounded border p-1 text-xs font-mono"
                            placeholder="Seconds"
                          />
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            className="mb-2 w-full rounded border p-1"
                          />
                          <div className="flex gap-2 text-sm">
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
                                setEditingTimestampText(
                                  note.timestampSeconds !== null
                                    ? secondsToMMSS(note.timestampSeconds)
                                    : '',
                                );
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
                  >
                    Add Timed Note
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Episode List */}
        <ul className="divide-y rounded bg-white shadow">
          {episodes.map((episode, index) => {
            const isActive = nowPlaying?.episodeId === episode.id;

            return (
              <li
                key={episode.id}
                onClick={() => {
                  playEpisode(episode, podcast);
                  setSelectedEpisodeId(episode.id);
                }}
                className={`flex items-start gap-3 cursor-pointer p-3 transition
              ${isActive ? 'bg-blue-50 pointer-events-none' : 'hover:bg-gray-50'}
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
                  <div className={`font-semibold ${isActive ? 'text-blue-700' : ''}`}>
                    {episode.title}
                  </div>

                  <div className="text-sm text-gray-600 line-clamp-2">{episode.description}</div>

                  {isActive && (
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
