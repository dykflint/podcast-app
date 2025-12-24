/**
 * services/noteService.js
 *
 * Responsibilities:
 * - Create noets (podcast-wide or episode-level)
 * - Fetch notes by podcast or episode
 * - Enforce ownership rules
 */
import { prisma } from '../db/prisma.js';
/**
 * Fetch notes for a podcast or episode.
 *
 * Exactly one of podcastId or episodeId must be provided.
 */
export async function getNotes({ podcastId, episodeId }) {
  if ((!podcastId && !episodeId) || (podcastId && episodeId)) {
    throw new Error('Must provide either podcastId or episodeId (but not both)');
  }

  // We use the findMany method because we don't know
  // which Id will be provided
  return prisma.note.findMany({
    where: {
      podcastId: podcastId ?? undefined,
      episodeId: episodeId ?? undefined,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

/**
 * Create a new note.
 *
 * Exactly one of podcastId or episodeId must be provided.
 */
export async function createNote({ podcastId, episodeId, content, timestampSeconds }) {
  if (!content || !content.trim()) {
    throw new Error('Note content is required.');
  }
  if ((!podcastId && !episodeId) || (podcastId && episodeId)) {
    throw new Error('Note must belong to either a podcast or an episode');
  }

  return prisma.note.create({
    data: {
      podcastId: podcastId ?? null,
      episodeId: episodeId ?? null,
      content,
      timestampSeconds: timestampSeconds ?? null,
    },
  });
}

/**
 * Update a note's content.
 */
export async function updateNote({ noteId, content, timestampSeconds }) {
  if (!noteId) {
    throw new Error('noteId is required');
  }

  if (!content || !content.trim()) {
    throw new Error('Note content is required');
  }

  return prisma.note.update({
    where: { id: noteId },
    data: {
      ...(content !== undefined && { content }),
      ...(timestampSeconds !== undefined && { timestampSeconds }),
    },
  });
}

/**
 * Delete a note.
 */
export async function deleteNote(noteId) {
  if (!noteId) {
    throw new Error('noteId is required');
  }

  return prisma.note.delete({
    where: { id: noteId },
  });
}
