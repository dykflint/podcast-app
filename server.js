/**
 * server.js
 *
 * Entrypoint for our backend.
 * We create an HTTP server that can:
 * - Accept a podcast RSS feed URL
 * - Fetch and parse the feed
 * - Return clean JSON data to the frontend
 */
import 'dotenv/config';
import express from 'express';
import Parser from 'rss-parser';
/**
 * Import routes
 */
import noteRoutes from './routes/noteRoutes.js';
import podcastRoutes from './routes/podcastRoutes.js';

const app = express();
const parser = new Parser();

app.use(express.static('.'));
app.use(express.json());
/**
 * Routes
 */
app.use('/api', podcastRoutes);
app.use('/api', noteRoutes);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Podcast backend running on http://localhost:${PORT}`);
});
