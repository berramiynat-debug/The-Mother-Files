import { sendNodeResponse, tmdbResponse } from '../server/tmdb.js';

export default function handler(req, res) {
  return sendNodeResponse(res, tmdbResponse(req.method, req.url, process.env));
}
