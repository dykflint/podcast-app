/**
 * routes/noteRoutes.js
 *
 * Create note routing endpoints for server.js
 */

import express from 'express';
import {
  getAllNotesHandler,
  createNoteHandler,
  updateNoteHandler,
  deleteNoteHandler,
  getNotesByPodcastHandler,
  getNotesByEpisodeHandler,
} from '../controllers/noteController.js';

const router = express.Router();

// Global notes + search
router.get('/notes', getAllNotesHandler);

// Scoped notes
router.get('/notes/by-podcast', getNotesByPodcastHandler);
router.get('/notes/by-episode', getNotesByEpisodeHandler);

// CRUD
router.post('/notes', createNoteHandler);
router.patch('/notes/:id', updateNoteHandler);
router.delete('/notes/:id', deleteNoteHandler);
export default router;
