/**
 * App.jsx
 *
 * Main react component for the podcast player.
 *
 * Responsibilities:
 * - Hold application state
 * - Fetch podcast data from backend
 * - Render episode list
 * - Controler audio playback
 */

import { useState } from 'react';

export default function App() {
  // --- State ---
  const [rssUrl, setRssUrl] = useState('');
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);

  /**
   * Fetch podcast data from the backend
   */
  async function loadPodcast() {
    if (!rssUrl.trim()) {
      alert('Please enter an RSS feed URL');
      return;
    }

    setLoading(true);
    setError(null);
    setEpisodes([]);

    try {
      const response = await fetch(`/api/podcast?rssUrl=${encodeURIComponent(rssUrl)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch podcast');
      }

      const podcast = await response.json();
      setEpisodes(podcast.episodes);
    } catch (error) {
      console.error(error);
      setError('Failed to load podcast');
    } finally {
      setLoading(false);
    }
  }

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
            {loading ? 'Loading...' : 'Load'}
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
          {episodes.map((episode, index) => (
            <li
              key={index}
              className="cursor-pointer p-4 hover:bg-gray-50"
              onClick={() => {
                console.log(episode.audioUrl);
                if (!episode.audioUrl) {
                  alert('No audio available for this episode');
                  return;
                }
                setCurrentAudioUrl(episode.audioUrl);
              }}
            >
              <div className="font-semibold">{episode.title}</div>
              <div className="text-sm text-gray-600">{episode.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
