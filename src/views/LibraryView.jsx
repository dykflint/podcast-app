/**
 * src/views/LibraryView.jsx
 *
 */
export default function LibraryView({ podcasts, onSelectPodcast }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Your Podcasts</h2>

      {podcasts.length === 0 && (
        <div className="text-gray-600">No podcasts yet. Add one using an RSS feed.</div>
      )}

      <ul className="grid gap-4">
        {podcasts.map(podcast => (
          <li
            key={podcast.id}
            onClick={() => onSelectPodcast(podcast.id)}
            className="flex cursor-pointer items-start gap-4 rounded bg-white p-4 shadow hover:bg-gray-50"
          >
            {podcast.imageUrl ? (
              <img
                src={podcast.imageUrl}
                alt={podcast.title}
                className="h-16 w-16 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded bg-gray-200" />
            )}

            <div className="flex-1">
              <div className="text-lg font-semibold">{podcast.title || 'Untitled Podcast'}</div>

              {podcast.description && (
                <div className="mt-1 line-clamp-2 text-sm text-gray-600">{podcast.description}</div>
              )}

              <div className="mt-2 text-xs text-gray-500">
                {podcast.episodeCount} episodes - {podcast.noteCount} notes
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
