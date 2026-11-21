import { expect, it, vi } from 'vitest';
import { tmdbResponse } from '../../server/tmdb.js';

it('rejects wrong methods, invalid arguments and unconfigured requests without contacting TMDB', async () => {
  const fetcher = vi.fn();
  const env = { TMDB_READ_ACCESS_TOKEN: 'fake-fixture-token' };
  expect((await tmdbResponse('POST', '/api/tmdb', env, fetcher)).status).toBe(405);
  expect((await tmdbResponse('GET', '/api/tmdb?resource=episode&season=../../&episode=1', env, fetcher)).status).toBe(400);
  expect((await tmdbResponse('GET', '/api/tmdb?resource=show&resource=images', env, fetcher)).status).toBe(400);
  expect((await tmdbResponse('GET', '/api/tmdb?url=https://example.invalid', env, fetcher)).status).toBe(400);
  expect((await tmdbResponse('GET', '/api/tmdb', {}, fetcher)).status).toBe(503);
  expect(fetcher).not.toHaveBeenCalled();
});

it('keeps credentials in the upstream request and normalizes only necessary data', async () => {
  const fetcher = vi.fn(async () => new Response(JSON.stringify({ name: 'Series', id: 1100, poster_path: '/example.jpg', private_extra: 'ignore' })));
  const response = await tmdbResponse('GET', '/api/tmdb?resource=show', { TMDB_READ_ACCESS_TOKEN: 'mock-server-token' }, fetcher);
  const [url, init] = fetcher.mock.calls[0];
  expect(String(url)).toBe('https://api.themoviedb.org/3/tv/1100');
  expect(init.headers.Authorization).toBe('Bearer mock-server-token');
  expect(response.body).toMatchObject({ id: 1100, poster: '/example.jpg', source: 'TMDB' });
  expect(JSON.stringify(response)).not.toMatch(/mock-server-token|private_extra/);
});

it('handles an upstream rejection without leaking the response body', async () => {
  const fetcher = vi.fn(async () => new Response('Untrusted response', { status: 401 }));
  const response = await tmdbResponse('GET', '/api/tmdb?resource=images', { TMDB_API_KEY: 'mock-api-key' }, fetcher);
  expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('api_key')).toBe('mock-api-key');
  expect(response.status).toBe(502);
  expect(JSON.stringify(response)).not.toMatch(/Untrusted response|mock-api-key/);
});
