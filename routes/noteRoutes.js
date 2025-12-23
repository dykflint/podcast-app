/**
 * routes/noteRoutes.js
 *
 * Create note routing endpoints for server.js
 */

import express from 'express';
import { getNotesHandler, createNoteHandler } from '../controllers/noteController.js';

const router = express.Router();

router.get('/notes', getNotesHandler);
router.post('/notes', createNoteHandler);

export default router;
