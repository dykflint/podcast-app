/**
 * noteController.js
 *
 * HTTP layer for notes.
 */

import {
  getAllNotes,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../services/noteService.js';

/**
 * GET /api/notes?q=
 */
export async function getAllNotesHandler(req, res) {
  try {
    const { q } = req.query;

    const notes = await getAllNotes({ query: q });

    res.json(
      notes.map(note => ({
        id: note.id,
        content: note.content,
        timestampSeconds: note.timestampSeconds,
        createdAt: note.createdAt,
        podcast: note.podcast
          ? {
              id: note.podcast.id,
              title: note.podcast.title,
            }
          : note.episode
            ? {
                id: note.episode.podcast.id,
                title: note.episode.podcast.title,
              }
            : null,
        episode: note.episode
          ? {
              id: note.episode.id,
              title: note.episode.title,
            }
          : null,
      })),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}
/**
 * GET /api/notes/by-podcast?podcastId=
 */
export async function getNotesByPodcastHandler(req, res) {
  const { podcastId } = req.query;

  try {
    const notes = await getNotes({
      podcastId: Number(podcastId),
      episodeId: null,
    });

    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/notes/by-episode?episodeId=
 */
export async function getNotesByEpisodeHandler(req, res) {
  const { episodeId } = req.query;

  try {
    const notes = await getNotes({
      podcastId: null,
      episodeId: Number(episodeId),
    });

    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/notes
 *
 * Body:
 * {
 * content: string,
 * podcastId?: number,
 * episodeId?: number
 * }
 */
export async function createNoteHandler(req, res) {
  console.log(req.body);
  const { content, podcastId, episodeId, timestampSeconds } = req.body;

  try {
    const note = await createNote({
      content,
      podcastId: podcastId ?? null,
      episodeId: episodeId ?? null,
      timestampSeconds,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * PATCH /api/notes/:id
 */
export async function updateNoteHandler(req, res) {
  const noteId = Number(req.params.id);
  const { content, timestampSeconds } = req.body;

  try {
    const updated = await updateNote({
      noteId,
      content,
      timestampSeconds,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * DELETE /api/notes/:id
 */
export async function deleteNoteHandler(req, res) {
  const noteId = Number(req.params.id);

  try {
    await deleteNote(noteId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
