import { request, ProviderError } from '../http.js';
import { castMember, episode, normalizeList, person, season, show } from '../normalizers/records.js';

const get = (path) => request('https://api.tvmaze.com' + path, 'TVmaze');
const list = async (name, transform) => normalizeList(await get('/shows/171/' + name), transform, 'TVmaze');
const record = async (path, transform) => {
  const result = transform(await get(path));
  if (!result) throw new ProviderError('TVmaze', 'Required fields are missing.');
  return result;
};

export const tvmazeService = {
  show: () => record('/shows/171', show),
  seasons: () => list('seasons', season),
  episodes: () => list('episodes', episode),
  characters: () => list('cast', castMember),
  episode: async (id) => {
    const rows = await tvmazeService.episodes();
    return rows.some((row) => row.id === id) ? record('/episodes/' + id, episode) : null;
  },
  actor: async (id) => {
    const rows = await tvmazeService.characters();
    return rows.some((row) => row.actor.id === id) ? record('/people/' + id, person) : null;
  },
};
