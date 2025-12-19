/**
 * controllers/podcastController.js
 */

import { getPodcastFromRss } from '../services/podcastService.js';

/**
 * GET /api/podcast
 *
 * Query parameters:
 * - rssUrl: string (required)
 */
export async function getPodcast(req, res) {
  const { rssUrl } = req.query;

  // Basic validation
  if (!rssUrl) {
    return res.status(400).json({
      error: 'rssUrl query parameter is required',
    });
  }

  try {
    const podcast = await getPodcastFromRss(rssUrl);
    res.json(podcast);
  } catch (error) {
    console.error('Failed to fetch podcast:', error);

    res.status(500).json({
      error: 'Failed to fetch or parse RSS feed',
    });
  }
}
