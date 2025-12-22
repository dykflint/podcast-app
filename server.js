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
import { getPodcast } from './controllers/podcastController.js';
const app = express();
const parser = new Parser();

app.use(express.static('.'));
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

app.get('/api/podcast', getPodcast);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Podcast backend running on http://localhost:${PORT}`);
});
