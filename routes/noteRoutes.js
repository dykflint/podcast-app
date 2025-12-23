/**
 * routes/noteRoutes.js
 *
 * Create note routing endpoints for server.js
 */

import express from 'express';
import {
  getNotesHandler,
  createNoteHandler,
  updateNoteHandler,
  deleteNoteHandler,
} from '../controllers/noteController.js';

const router = express.Router();

router.get('/notes', getNotesHandler);
router.post('/notes', createNoteHandler);
router.patch('/notes/:id', updateNoteHandler);
router.delete('/notes/:id', deleteNoteHandler);
export default router;
