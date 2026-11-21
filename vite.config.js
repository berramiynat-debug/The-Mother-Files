import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sendNodeResponse, tmdbResponse } from './server/tmdb.js';

export default defineConfig(({ mode }) => {
  const secrets = { ...loadEnv(mode, process.cwd(), 'TMDB_'), ...process.env };
  const mountProxy = (server) => {
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/tmdb') return next();
      return sendNodeResponse(res, tmdbResponse(req.method, req.url, secrets));
    });
  };
  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-tmdb',
      configureServer: mountProxy,
      configurePreviewServer: mountProxy,
    }],
    test: { include: ['tests/unit/*.test.js'] },
  };
});
