/**
 * routes/podcastRoutes.js
 *
 * Routes for podcast-fetching.
 */
import express from 'express';
import {
  getPodcast,
  getPodcasts,
  getRecentEpisodesHandler,
} from '../controllers/podcastController.js';

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
/**
 * GET /api/episodes/recent
 *
 * Fetch the latest episodes across all subscribed podcasts.
 * The limit can be set in the podcastService.js file.
 */
router.get('/episodes/recent', getRecentEpisodesHandler);
export default router;
