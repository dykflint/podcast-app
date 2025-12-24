/**
 * frontend/src/views/RecentEpisodesView.jsx
 */
export default function RecentEpisodesView({ episodes, onSelectEpisode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Episodes</h2>

      {episodes.map(ep => (
        <div
          key={ep.id}
          onClick={() => onSelectEpisode(ep)}
          className="flex gap-3 cursor-pointer rounded bg-white p-3 shadow hover:bg-gray-50"
        >
          {ep.podcast.imageUrl ? (
            <img
              src={ep.podcast.imageUrl}
              alt={ep.podcast.title}
              className="h-14 w-14 rounded object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded bg-gray-200" />
          )}

          <div className="flex-1">
            <div className="text-sm font-semibold">{ep.title}</div>
            <div className="text-xs text-gray-600">{ep.podcast.title}</div>

            {ep.publishedAt && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(ep.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
