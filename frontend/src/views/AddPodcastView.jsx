/**
 * frontend/src/views/AddPodcastView.jsx
 *
 * RSS-only, search-ready Add Podcast view
 */
import { useState } from 'react';

export default function AddPodcastView({ onSubscribeByRss, loading, error }) {
  const [rssUrl, setRssUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!rssUrl.trim()) return;
    onSubscribeByRss(rssUrl.trim());
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Add a Podcast</h1>

        {/* TODO: SEARCH */}
        <div className="rounded bg-white p-4 shadow opacity-60">
          <label className="block text-sm font-semibold mb-1">Search Podcasts</label>
          <input
            type="text"
            disabled
            placeholder="TODO: search"
            className="w-full rounded border p-2 bg-gray-100 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Podcast search is still WIP.</p>
        </div>

        <div className="text-center text-sm text-gray-500"> - OR -</div>

        {/* RSS SUBSCRIBE */}
        <form onSubmit={handleSubmit} className="rounded bg-white p-4 shadow space-y-3">
          <label className="block text-sm font-semibold">Add via RSS feed</label>

          <input
            type="url"
            value={rssUrl}
            onChange={e => setRssUrl(e.target.value)}
            placeholder="https://example.com/podcast/rss"
            className="w-full rounded border p-2"
          />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
}
