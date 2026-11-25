import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sendNodeResponse, tmdbResponse } from './server/tmdb.js';
import { hintResponse } from './server/hints.js';

export default defineConfig(({ mode }) => {
  const secrets = { ...loadEnv(mode, process.cwd(), ['TMDB_', 'GROQ_']), ...process.env };
  const mountProxy = (server) => {
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0];
      if (path === '/api/tmdb') return sendNodeResponse(res, tmdbResponse(req.method, req.url, secrets));
      if (path === '/api/hints') return sendNodeResponse(res, hintResponse(req, secrets));
      return next();
    });
  };
  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-providers',
      configureServer: mountProxy,
      configurePreviewServer: mountProxy,
    }],
    test: { include: ['tests/unit/*.test.js'] },
  };
});
