/**
 * controllers/podcastController.js
 */

import { getPodcastFromRss, getAllPodcasts, getPodcastById } from '../services/podcastService.js';

/**
 * GET /api/podcasts
 *
 * Returns all stored podcassts for the library view.
 */
export async function getPodcasts(req, res) {
  try {
    const podcasts = await getAllPodcasts();
    res.json(podcasts);
  } catch (error) {
    console.error('Failed to fetch podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
}

/**
 * GET /api/podcast
 *
 * Supports:
 * - ?rssUrl=: string (required)
 * - ?id=123
 */
export async function getPodcast(req, res) {
  const { rssUrl, id } = req.query;

  try {
    if (id) {
      const podcast = await getPodcastById(Number(id));
      return res.json(podcast);
    }
    if (rssUrl) {
      const podcast = await getPodcastFromRss(rssUrl);
      return res.json(podcast);
    }

    return res.status(400).json({
      error: 'Either rssUrl or id query parameter is requirede',
    });
  } catch (error) {
    console.error('Failed to fetch podcast:', error);

    res.status(500).json({
      error: 'Failed to fetch or parse RSS feed',
    });
  }
}
