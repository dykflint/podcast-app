/**
 * podcastService.js
 *
 * This module is responsible for:
 * - Fetching a podcast RSS feed
 * - Parsing the feed
 * - Normalizing the data into a clean shape
 * - Cache results in memory to avoid repeated fetches
 *
 * It does not know anything about HTTP nor handles req/res objects
 */

import Parser from 'rss-parser';
const parser = new Parser();

/**
 * In-memory cache.
 *
 * Key: rssUrl (string)
 * Value: {
 *  data: Parsed podcast data,
 *  expiresAt: number (timestamp in ms)
 * }
 */
const cache = new Map();
// For now the cache duration is set to 10 minutes
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Fetch and parse a podcast RSS feed.
 *
 * @param {string} rssUrl - The URL of the podcast RSS feed
 * @returns {Promise<{
 *   title: string,
 *   description: string,
 *   episodes: Array<{
 *     title: string,
 *     description: string,
 *     audioUrl: string | null,
 *     publishedAt: string | null
 *   }>
 * }>}
 */
export async function getPodcastFromRss(rssUrl) {
  if (!rssUrl) {
    throw new Error('rssUrl is required');
  }

  const now = Date.now();

  // 1. Check cache
  const cachedEntry = cache.get(rssUrl);

  if (cachedEntry) {
    const isExpired = cachedEntry.expiresAt < now;

    if (!isExpired) {
      // Cache is not expired. Return it.
      console.log('CACHE HIT');
      return cachedEntry.data;
    }

    // Cache entry exists but is expired
    cache.delete(rssUrl);
  }

  // 2. No available cache -> fetch RSS feed
  const feed = await parser.parseURL(rssUrl);

  // Normalize episode data
  const episodes = feed.items.map(item => ({
    title: item.title || 'Untitled episode',
    description: item.contentSnippet,
    audioUrl: item.enclosure?.url || null,
    publishedAt: item.pubDate || null,
  }));

  const podcastData = {
    title: feed.title,
    description: feed.description,
    episodes,
  };

  // 3. Store result in cache
  cache.set(rssUrl, {
    data: podcastData,
    expiresAt: now + CACHE_TTL_MS,
  });

  return podcastData;
}
