import { request } from '../http.js';
import { imageUrl } from '../normalizers/records.js';

export const tmdbImage = (path, size = 'w780') => path ? imageUrl('https://image.tmdb.org/t/p/' + size + path) : '';
export const tmdbService = (resource, params) => request('/api/tmdb?' + new URLSearchParams({ resource, ...params }), 'TMDB', { timeout: 7000, retries: 0 });
