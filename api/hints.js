import { hintResponse } from '../server/hints.js';
import { sendNodeResponse } from '../server/tmdb.js';

export default function handler(req, res) {
  return sendNodeResponse(res, hintResponse(req, process.env));
}
