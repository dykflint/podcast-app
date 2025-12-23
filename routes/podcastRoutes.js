/**
 * routes/podcastRoutes.js
 *
 * Routes for podcast-fetching.
 */
import express from 'express';
import { getPodcast, getPodcasts } from '../controllers/podcastController.js';

const router = express.Router();

/**
 * GET /api/podcast
 *
 * Query parameters:
 * - rssUrl: string (required)
 *
 * Example request:
 * GET /api/podcast/?rssUrl=https://feeds.simplecast.com/54nAGcIl
 *
 * Response:
 * {
 *  title: string,
 *  description: string,
 *  episodes: [
 *    {
 *      title: string,
 *      description: string,
 *      audioUrl: string,
 *      publishedAt: string
 *    }
 *  ]
 * }
 */
router.get('/podcast', getPodcast);

/**
 * GET /api/podcasts
 *
 * Fetch all podcasts
 */
router.get('/podcasts', getPodcasts);
export default router;
