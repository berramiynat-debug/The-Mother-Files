import { request, ProviderError } from '../http.js';
import { castMember, episode, normalizeList, person, season, show } from '../normalizers/records.js';

const get = (path) => request('https://api.tvmaze.com' + path, 'TVmaze');
const showId = 171;
const showPath = '/shows/' + showId;
const list = async (name, transform) => normalizeList(await get(showPath + '/' + name), transform, 'TVmaze');
const record = async (path, transform) => {
  const result = transform(await get(path));
  if (!result) throw new ProviderError('TVmaze', 'Required fields are missing.');
  return result;
};

export const tvmazeService = {
  show: () => record(showPath, show),
  seasons: () => list('seasons', season),
  episodes: () => list('episodes', episode),
  characters: () => list('cast', castMember),
  episode: async (id) => {
    const row = await get('/episodes/' + id + '?embed=show').catch((error) => {
      if (error.status === 404) return null;
      throw error;
    });
    if (!row) return null;
    if (row.id !== id || !Number.isSafeInteger(row._embedded?.show?.id)) {
      throw new ProviderError('TVmaze', 'Episode ownership is missing or invalid.');
    }
    if (row._embedded.show.id !== showId) return null;
    const result = episode(row);
    if (!result) throw new ProviderError('TVmaze', 'Required fields are missing.');
    return result;
  },
  actor: async (id) => {
    const rows = await tvmazeService.characters();
    return rows.some((row) => row.actor.id === id) ? record('/people/' + id, person) : null;
  },
};
