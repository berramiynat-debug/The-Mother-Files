import { tmdbResponse } from './tmdb.js';
import { assets } from 'virtual:site-assets';

const mime = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/api/tmdb') {
      const result = await tmdbResponse(request.method, request.url, env);
      return new Response(JSON.stringify(result.body), { status: result.status, headers: result.headers });
    }
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('GET or HEAD required', { status: 405, headers: { Allow: 'GET, HEAD' } });
    if (path.startsWith('/api/')) return new Response('Unknown route', { status: 404 });
    const filename = Object.hasOwn(assets, path) ? path : path.split('/').at(-1).includes('.') ? null : '/index.html';
    if (!filename) return new Response('File not found', { status: 404 });
    const suffix = filename.slice(filename.lastIndexOf('.'));
    const headers = {
      'Content-Type': mime[suffix] || 'application/octet-stream',
      'Cache-Control': filename.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    };
    return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(assets[filename]), (character) => character.charCodeAt(0)), { headers });
  },
};
