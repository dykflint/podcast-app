/**
 * podcastService.js
 *
 * Responsibilities:
 * - Fetch and parse podcast RSS feeds
 * - Normalize RSS data
 * - Persist podcasts adn episodes to PostgreSQL via Prisma
 * - Cache results in memory
 * This module iS HTTP-agnostic.
 */

import Parser from 'rss-parser';
import { prisma } from '../db/prisma.js';

const parser = new Parser();

/**
 * In-memory cache.
 * Key: rssUrl
 */
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getPodcastFromRss(rssUrl) {
  if (!rssUrl) {
    throw new Error('rssUrl is required');
  }

  const now = Date.now();
  const cachedEntry = cache.get(rssUrl);

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.data;
  }

  // --- Fetch RSS ---
  const feed = await parser.parseURL(rssUrl);

  // --- Extract podcast artwork from RSS ---
  const imageUrl = feed.image?.url || feed.itunes?.image || feed.itunes?.image?.href || null;
  // --- Upsert podcast ---
  const podcast = await prisma.podcast.upsert({
    where: { rssUrl },
    update: {
      title: feed.title,
      description: feed.description,
      imageUrl,
    },
    create: {
      rssUrl,
      title: feed.title,
      description: feed.description,
      imageUrl,
    },
  });

  // --- Normalize and persist episodes ---
  const episodes = [];

  for (const item of feed.items) {
    const audioUrl = item.enclosure?.url || item.enclosures?.[0]?.url || null;

    const guid = item.guid || null;

    // Skip episodes we can't uniquely identify
    if (!guid && !audioUrl) {
      continue;
    }

    const episode = await prisma.episode.upsert({
      where: {
        podcastId_guid_audioUrl: {
          podcastId: podcast.id,
          guid,
          audioUrl,
        },
      },
      update: {
        title: item.title,
        description: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
      },
      create: {
        podcastId: podcast.id,
        guid,
        audioUrl,
        title: item.title,
        description: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
      },
    });

    episodes.push({
      id: episode.id, // Important for notes later
      title: episode.title || 'Untitled episode',
      description: episode.description || '',
      audioUrl: episode.audioUrl,
      publishedAt: episode.publishedAt,
    });
  }

  const result = {
    id: podcast.id, // Important for podcast-wide notes
    title: podcast.title,
    description: podcast.description,
    imageUrl: podcast.imageUrl,
    episodes,
  };

  // --- Cache result ---
  cache.set(rssUrl, {
    data: result,
    expiresAt: now + CACHE_TTL_MS,
  });

  return result;
}

/**
 * Fetch a podcast and its episodes by podcast id.
 *
 * Used for the libarry -> detail view.
 * Returns the same shape as getPodcastFromRss().
 */
export async function getPodcastById(podcastId) {
  if (!podcastId) {
    throw new Error('podcastId is required');
  }

  const podcast = await prisma.podcast.findUnique({
    where: { id: podcastId },
    include: {
      episodes: {
        orderBy: {
          publishedAt: 'desc',
        },
      },
    },
  });

  if (!podcast) {
    throw new Error('Podcast not found');
  }

  return {
    id: podcast.id,
    title: podcast.title,
    description: podcast.description,
    imageUrl: podcast.imageUrl,
    episodes: podcast.episodes.map(ep => ({
      id: ep.id,
      title: ep.title || 'Untitled episode',
      description: ep.description || '',
      audioUrl: ep.audioUrl,
      publishedAt: ep.publishedAt,
    })),
  };
}
/**
 * Fetch all podcasts for the library view.
 *
 * Returns lightweight data:
 * - metadata
 * - episode count
 * - note count
 */
export async function getAllPodcasts() {
  const podcasts = await prisma.podcast.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          episodes: true,
          notes: true,
        },
      },
    },
  });

  // Normalize for frontend consumption
  return podcasts.map(podcast => ({
    id: podcast.id,
    title: podcast.title,
    description: podcast.description,
    imageUrl: podcast.imageUrl,
    rssUrl: podcast.rssUrl,
    episodeCount: podcast._count.episodes,
    noteCount: podcast._count.notes,
  }));
}
/**
 * TESTING ONLY
 */
export function __clearCache() {
  cache.clear();
}
