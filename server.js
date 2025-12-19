/**
 * server.js
 *
 * Entrypoint for our backend.
 * We create an HTTP server that can:
 * - Accept a podcast RSS feed URL
 * - Fetch and parse the feed
 * - Return clean JSON data to the frontend
 */

import express from 'express';
import Parser from 'rss-parser';

const app = express();
const parser = new Parser();

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

app.get('/api/podcast', async (req, res) => {
  const { rssUrl } = req.query;

  // Basic validation
  if (!rssUrl) {
    return res.status(400).json({
      error: 'rssUrl query parameter is required',
    });
  }

  try {
    // Fetch and parse the RSS feed
    const feed = await parser.parseURL(rssUrl);

    // Normalize episode data so the frontend
    // doesn't need to understand RSS internals
    const episodes = feed.items.map(item => ({
      title: item.title || 'Untitled episode',
      description: item.contentSnippet || '',
      audioUrl: item.enclosure?.url || null,
      publishedAt: item.pubDate || null,
    }));

    // Send clean JSON response
    res.json({
      title: feed.title,
      description: feed.description,
      episodes,
    });
  } catch (error) {
    console.error('Failed to parse RSS feed:', error);
    res.status(500).json({
      error: 'Failed to fetch or parse RSS feed',
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Podcast backend running on http://localhost:${PORT}`);
});
