/**
 * podcastService.test.js
 *
 * Unit tests for getPodcastFromRss.
 *
 * These tests verify:
 *  - RSS parsing behavior (mocked)
 *  - Data normalization
 *  - In-memory caching
 *  - Cache expiration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state ---
const { mockParseURL } = vi.hoisted(() => {
  return {
    mockParseURL: vi.fn(),
  };
});

// --- Mock rss-parser BEFORE importing the service ---
vi.mock('rss-parser', () => {
  return {
    default: class ParserMock {
      constructor() {
        this.parseURL = mockParseURL;
      }
    },
  };
});

// Import AFTER mocking
import { getPodcastFromRss } from './podcastService.js';

// Sample RSS feed data returned by the mock
const mockFeed = {
  title: 'Test Podcast',
  description: 'A test podcast feed',
  items: [
    {
      title: 'Episode 1',
      contentSnippet: 'Episode 1 description',
      enclosure: { url: 'https://audio.test/ep1.mp3' },
      pubDate: '2024-01-01',
    },
  ],
};

describe('getPodcastFromRss', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockParseURL.mockReset();
  });

  it('throws if rssUrl is missing', async () => {
    await expect(getPodcastFromRss()).rejects.toThrow('rssUrl is required');
  });

  it('fetches and normalizes podcast data', async () => {
    mockParseURL.mockResolvedValueOnce(mockFeed);

    const result = await getPodcastFromRss('https://test.feed/rss');

    expect(result).toEqual({
      title: 'Test Podcast',
      description: 'A test podcast feed',
      episodes: [
        {
          title: 'Episode 1',
          description: 'Episode 1 description',
          audioUrl: 'https://audio.test/ep1.mp3',
          publishedAt: '2024-01-01',
        },
      ],
    });

    expect(mockParseURL).toHaveBeenCalledTimes(1);
  });

  it('returns cached data on subsequent calls', async () => {
    mockParseURL.mockResolvedValueOnce(mockFeed);

    const rssUrl = 'https://test.feed/rss';

    const firstCall = await getPodcastFromRss(rssUrl);
    const secondCall = await getPodcastFromRss(rssUrl);

    expect(firstCall).toEqual(secondCall);
    expect(mockParseURL).toHaveBeenCalledTimes(1); // cache hit
  });

  it('refetches data after cache expiration', async () => {
    vi.useFakeTimers();

    mockParseURL.mockResolvedValue(mockFeed);

    const rssUrl = 'https://test.feed/rss';

    await getPodcastFromRss(rssUrl);

    // Advance time past cache TTL (10 minutes)
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);

    await getPodcastFromRss(rssUrl);

    expect(mockParseURL).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
