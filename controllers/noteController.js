/**
 * noteController.js
 *
 * HTTP layer for notes.
 */

import { getNotes, createNote, updateNote, deleteNote } from '../services/noteService.js';

/**
 * GET /api/notes
 *
 * Query params:
 * - podcastId
 * - episodeId
 */
export async function getNotesHandler(req, res) {
  const { podcastId, episodeId } = req.query;

  try {
    const notes = await getNotes({
      podcastId: podcastId ? Number(podcastId) : null,
      episodeId: episodeId ? Number(episodeId) : null,
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
  const { content, podcastId, episodeId } = req.body;

  try {
    const note = await createNote({
      content,
      podcastId: podcastId ?? null,
      episodeId: episodeId ?? null,
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
  const { content } = req.body;

  try {
    const updated = await updateNote({
      noteId,
      content,
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
