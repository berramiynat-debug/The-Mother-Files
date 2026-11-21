import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'vite';

const assets = Object.fromEntries(readdirSync('dist', { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => {
    const path = join(entry.parentPath, entry.name);
    return ['/' + path.slice(5).replaceAll('\\', '/'), readFileSync(path).toString('base64')];
  }));

await build({
  configFile: false,
  plugins: [{
    name: 'embed-sites-assets',
    resolveId(id) { return id === 'virtual:site-assets' ? '\0' + id : undefined; },
    load(id) { return id === '\0virtual:site-assets' ? 'export const assets = ' + JSON.stringify(assets) : undefined; },
  }],
  ssr: { target: 'webworker' },
  build: {
    ssr: 'server/sitesWorker.js',
    outDir: 'dist/server',
    emptyOutDir: false,
    target: 'es2022',
    rollupOptions: { output: { entryFileNames: 'index.js' } },
  },
});
