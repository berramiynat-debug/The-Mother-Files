const base = 'https://api.themoviedb.org/3/tv/1100';
const image = (value) => typeof value === 'string' && /^\/[\w.-]+\.(jpg|png|webp)$/i.test(value) ? value : null;
const backgrounds = (rows) => Array.isArray(rows) ? rows.map((row) => image(row?.file_path)).filter(Boolean).slice(0, 12) : [];
const common = (value) => ({ id: value.id, name: value.name, poster: image(value.poster_path), backdrop: image(value.backdrop_path), still: image(value.still_path) });

function endpoint(query) {
  const resource = query.get('resource') || 'show';
  const season = query.get('season') || '';
  const episode = query.get('episode') || '';
  const validSeason = /^[1-9]$/.test(season);
  const validEpisode = /^(?:[1-9]|1[0-9]|2[0-6])$/.test(episode);
  if ([...query.keys()].some((key) => !['resource', 'season', 'episode'].includes(key)) || new Set(query.keys()).size !== query.size) return null;
  if (resource === 'show' && !season && !episode) return { suffix: '', normalize: common };
  if (resource === 'images' && !season && !episode) return { suffix: '/images', normalize: (value) => ({ backdrops: backgrounds(value.backdrops) }) };
  if (resource === 'credits' && !season && !episode) return {
    suffix: '/credits',
    normalize: (value) => ({ cast: (Array.isArray(value.cast) ? value.cast : []).slice(0, 40).map((row) => ({ name: row.name, photo: image(row.profile_path) })) }),
  };
  if (resource === 'season' && validSeason && !episode) return { suffix: '/season/' + season, normalize: common };
  if (resource === 'episode' && validSeason && validEpisode) return {
    suffix: '/season/' + season + '/episode/' + episode + '/images',
    normalize: (value) => ({ stills: backgrounds(value.stills) }),
  };
  return null;
}

const cache = new Map();
const pending = new Map();
const json = (status, body) => ({
  status, body,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': status === 200 ? 'public, max-age=300, s-maxage=86400' : 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

export async function tmdbResponse(method, requestUrl, env, fetcher = (url, options) => globalThis.fetch(url, options)) {
  if (method !== 'GET') return { ...json(405, { error: 'GET required.' }), headers: { Allow: 'GET', ...json(405).headers } };
  const target = endpoint(new URL(requestUrl, 'http://localhost').searchParams);
  if (!target) return json(400, { error: 'Unknown TMDB route or arguments.' });
  const bearer = env.TMDB_READ_ACCESS_TOKEN?.trim();
  const key = env.TMDB_API_KEY?.trim();
  if (!bearer && !key) return json(503, { error: 'TMDB is not configured.' });
  const existing = cache.get(target.suffix);
  if (existing?.until > Date.now()) return existing.result;
  if (pending.has(target.suffix)) return pending.get(target.suffix);
  const url = new URL(base + target.suffix);
  if (!bearer) url.searchParams.set('api_key', key);
  const action = (async () => {
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 5500);
    try {
      const response = await fetcher(url.href, {
        // Workers support manual redirects. The status check rejects every redirect.
        signal: controller.signal, redirect: 'manual',
        headers: bearer ? { Authorization: 'Bearer ' + bearer, Accept: 'application/json' } : { Accept: 'application/json' },
      });
      if (!response.ok) return json(502, { error: 'TMDB is temporarily unavailable.', upstreamStatus: response.status });
      const data = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) return json(502, { error: 'TMDB returned unreadable data.' });
      const result = json(200, { ...target.normalize(data), source: 'TMDB' });
      cache.set(target.suffix, { until: Date.now() + 86400000, result });
      return result;
    } catch {
      return json(502, { error: 'TMDB did not respond.' });
    } finally {
      clearTimeout(deadline);
    }
  })();
  pending.set(target.suffix, action);
  try { return await action; } finally { pending.delete(target.suffix); }
}

export async function sendNodeResponse(res, resultPromise) {
  const result = await resultPromise;
  res.writeHead(result.status, result.headers);
  res.end(JSON.stringify(result.body));
}
