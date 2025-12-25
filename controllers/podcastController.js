/**
 * controllers/podcastController.js
 */

import {
  getPodcastFromRss,
  getAllPodcasts,
  getPodcastById,
  getRecentEpisodes,
} from '../services/podcastService.js';

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

    if (error.code === 'ALREADY_SUBSCRIBED') {
      return res.status(409).json({
        error: 'ALREADY_SUBSCRIBED',
        podcastId: error.podcastId,
        title: error.title,
      });
    }
    res.status(500).json({
      error: 'Failed to fetch or parse RSS feed',
    });
  }
}

/**
 * GET /api/episodes/recent
 */
export async function getRecentEpisodesHandler(req, res) {
  try {
    const episodes = await getRecentEpisodes();
    res.json(episodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load recent episodes' });
  }
}
