import { useState, useEffect, useRef } from 'react';
import LibraryView from './views/LibraryView.jsx';
import PodcastView from './views/PodcastView.jsx';
import RecentEpisodesView from './views/RecentEpisodesView.jsx';

export default function App() {
  // --- App navigation ---
  const [activeView, setActiveView] = useState('library');
  // ---  Podcast library ---
  const [podcasts, setPodcasts] = useState([]);
  // --- Podcast and episodes ---
  const [rssUrl, setRssUrl] = useState('');
  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  // --- Recent Episodes ---
  const [recentEpisodes, setRecentEpisodes] = useState([]);
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
  const [editingTimestampText, setEditingTimestampText] = useState('');

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

  // Fetch recent episodes when switching to Recent view
  useEffect(() => {
    if (activeView !== 'recent') return;

    fetch('/api/episodes/recent')
      .then(res => res.json())
      .then(setRecentEpisodes)
      .catch(console.error);
  }, [activeView]);
  // Navigation handler for Recent view
  function openEpisodeFromRecent(ep) {
    loadPodcastById(ep.podcast.id);

    // delay until podcast loads
    setTimeout(() => {
      setSelectedEpisodeId(ep.id);

      const index = episodes.findIndex(e => e.id === ep.id);
      if (index !== -1) {
        setCurrentEpisodeIndex(index);
      }
    }, 300);

    setActiveView('podcast');
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
  function secondsToMMSS(seconds) {
    if (seconds === null || seconds === undefined) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function mmssToSeconds(text) {
    if (!text) return null;

    const match = text.match(/^(\d+):([0-5]\d)$/);
    if (!match) return null;

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);

    return minutes * 60 + seconds;
  }
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
    const seconds = mmssToSeconds(editingTimestampText);

    if (editingTimestampText && seconds === null) {
      alert('Timestamp must be in mm:ss format');
      return;
    }

    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: editingContent,
        timestampSeconds: seconds,
      }),
    });

    const updated = await res.json();

    // Update both lists
    setPodcastNotes(notes => notes.map(n => (n.id === updated.id ? updated : n)));
    setEpisodeNotes(notes => notes.map(n => (n.id === updated.id ? updated : n)));

    setEditingNoteId(null);
    setEditingContent('');
    setEditingTimestampText('');
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
        <LibraryView podcasts={podcasts} onSelectPodcast={loadPodcastById} />
      )}

      {/* Podcast Detail View */}
      {activeView === 'podcast' && (
        <PodcastView
          podcast={podcast}
          episodes={episodes}
          podcastNotes={podcastNotes}
          episodeNotes={episodeNotes}
          selectedEpisodeId={selectedEpisodeId}
          setSelectedEpisodeId={setSelectedEpisodeId}
          currentEpisodeIndex={currentEpisodeIndex}
          setCurrentEpisodeIndex={setCurrentEpisodeIndex}
          audioRef={audioRef}
          currentAudioUrl={currentAudioUrl}
          rssUrl={rssUrl}
          setRssUrl={setRssUrl}
          loadPodcast={loadPodcast}
          loading={loading}
          error={error}
          onBack={() => {
            setPodcast(null);
            setActiveView('library');
          }}
          onAddPodcastNote={addPodcastNote}
          onAddEpisodeNote={addEpisodeNote}
          onAddEpisodeNoteAtCurrentTime={addEpisodeNoteAtCurrentTime}
          onSaveEditedNote={saveEditedNote}
          onDeleteNote={deleteNoteById}
          secondsToMMSS={secondsToMMSS}
          mmssToSeconds={mmssToSeconds}
          formatTimestamp={formatTimestamp}
          editingNoteId={editingNoteId}
          setEditingNoteId={setEditingNoteId}
          editingContent={editingContent}
          setEditingContent={setEditingContent}
          editingTimestampText={editingTimestampText}
          setEditingTimestampText={setEditingTimestampText}
          newPodcastNote={newPodcastNote}
          setNewPodcastNote={setNewPodcastNote}
          newEpisodeNote={newEpisodeNote}
          setNewEpisodeNote={setNewEpisodeNote}
        />
      )}

      {/* TODO: Recent Episodes View */}
      {activeView === 'recent' && (
        <RecentEpisodesView episodes={recentEpisodes} onSelectEpisode={openEpisodeFromRecent} />
      )}
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
