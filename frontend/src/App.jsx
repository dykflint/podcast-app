import { useState } from 'react';

export default function App() {
  // --- State ---
  const [rssUrl, setRssUrl] = useState('');
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Index of the currently playing episode
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(null);

  async function loadPodcast() {
    if (!rssUrl.trim()) {
      alert('Please enter an RSS feed URL');
      return;
    }

    setLoading(true);
    setError(null);
    setEpisodes([]);
    setCurrentEpisodeIndex(null);

    try {
      const response = await fetch(`/api/podcast?rssUrl=${encodeURIComponent(rssUrl)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch podcast');
      }

      const podcast = await response.json();
      setEpisodes(podcast.episodes);
    } catch (err) {
      console.error(err);
      setError('Failed to load podcast');
    } finally {
      setLoading(false);
    }
  }

  const currentAudioUrl =
    currentEpisodeIndex !== null ? episodes[currentEpisodeIndex]?.audioUrl : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Podcast Player</h1>

        {/* RSS Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={rssUrl}
            onChange={e => setRssUrl(e.target.value)}
            placeholder="Enter podcast RSS feed URL"
            className="flex-1 rounded border border-gray-300 p-2"
          />

          <button
            onClick={loadPodcast}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load'}
          </button>
        </div>

        {/* Audio Player */}
        {currentAudioUrl && (
          <audio controls autoPlay src={currentAudioUrl} className="mb-6 w-full" />
        )}

        {/* Error */}
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

        {/* Episode List */}
        <ul className="divide-y divide-gray-200 rounded bg-white shadow">
          {episodes.map((episode, index) => {
            const isPlaying = index === currentEpisodeIndex;

            return (
              <li
                key={index}
                onClick={() => {
                  if (!episode.audioUrl) {
                    alert('No audio available for this episode');
                    return;
                  }
                  setCurrentEpisodeIndex(index);
                }}
                className={`cursor-pointer p-4 transition
                  ${isPlaying ? 'bg-blue-50 pointer-events-none' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`font-semibold ${isPlaying ? 'text-blue-700' : ''}`}>
                  {episode.title}
                </div>

                <div className="text-sm text-gray-600">{episode.description}</div>

                {isPlaying && (
                  <div className="mt-2 text-xs font-semibold text-blue-600">▶ Now Playing</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
