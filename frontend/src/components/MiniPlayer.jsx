/**
 * MiniPlayer component
 *
 * Functionalities:
 * - Scrubbing
 * - Playbackrate (1x, 1.5x, 2x)
 * - TODO: note-taking
 */
export default function MiniPlayer({
  nowPlaying,
  isPlaying,
  setIsPlaying,
  currentTime,
  duration,
  onSeek,
  onJump,
  playbackRate,
  cyclePlaybackRate,
}) {
  if (!nowPlaying) return null;

  return (
    <div className="fixed bottom-20 left-0 rounded-full right-0 z-40 bg-white border-t shadow-md px-8 py-4">
      <div className="flex items-center gap-3">
        {/* Artwork */}
        {nowPlaying.artworkUrl && (
          <img src={nowPlaying.artworkUrl} className="h-10 w-10 rounded object-cover" />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{nowPlaying.episodeTitle}</div>
          <div className="text-xs text-gray-500 truncate">{nowPlaying.podcastTitle}</div>
        </div>

        {/* Controls */}
        <button onClick={() => onJump(-15)}>
          <svg
            width="24px"
            strokeWidth="1.5"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="#000000"
          >
            <path
              d="M3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 8.02944 16.9706 4 12 4"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M9 9L9 16"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M15 9L13 9C12.4477 9 12 9.44772 12 10L12 11.5C12 12.0523 12.4477 12.5 13 12.5L14 12.5C14.5523 12.5 15 12.9477 15 13.5L15 15C15 15.5523 14.5523 16 14 16L12 16"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M12 4L4.5 4M4.5 4L6.5 2M4.5 4L6.5 6"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <button onClick={() => setIsPlaying(p => !p)} className="text-lg">
          {isPlaying ? (
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="black"
              strokeWidth="1.5"
            >
              <path
                d="M6 18.4V5.6C6 5.26863 6.26863 5 6.6 5H9.4C9.73137 5 10 5.26863 10 5.6V18.4C10 18.7314 9.73137 19 9.4 19H6.6C6.26863 19 6 18.7314 6 18.4Z"
                fill="black"
                stroke="black"
                strokeWidth="1.5"
              ></path>
              <path
                d="M14 18.4V5.6C14 5.26863 14.2686 5 14.6 5H17.4C17.7314 5 18 5.26863 18 5.6V18.4C18 18.7314 17.7314 19 17.4 19H14.6C14.2686 19 14 18.7314 14 18.4Z"
                fill="black"
                stroke="black"
                strokeWidth="1.5"
              ></path>
            </svg>
          ) : (
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="black"
              strokeWidth="1.5"
            >
              <path
                d="M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z"
                fill="black"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          )}
        </button>
        <button onClick={() => onJump(15)}>
          <svg
            width="24px"
            strokeWidth="1.5"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="#000000"
          >
            <path
              d="M21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 8.02944 7.02944 4 12 4"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M12 4H19.5M19.5 4L17.5 2M19.5 4L17.5 6"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M9 9L9 16"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M15 9L13 9C12.4477 9 12 9.44772 12 10L12 11.5C12 12.0523 12.4477 12.5 13 12.5L14 12.5C14.5523 12.5 15 12.9477 15 13.5L15 15C15 15.5523 14.5523 16 14 16L12 16"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <button onClick={cyclePlaybackRate} className="text-xs font-mono">
          {playbackRate}x
        </button>
      </div>

      {/* Timeline */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={e => onSeek(Number(e.target.value))}
          className="flex-1"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}
