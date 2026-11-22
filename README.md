# The Pineapple Files

**SE 3355 · Web Programming**

An unofficial *How I Met Your Mother* wiki and an original, interactive mystery. Browse the TVmaze archive or play as one of Ted’s kids in an investigation of a missing photograph and yellow umbrella. Ted narrates the case from his fictional 2030 living room. Barney sends the first clue, and your sibling helps you use the evidence to check his story.

- [Hosted site](https://the-mother-files-3355.berramiynat.chatgpt.site)
- [Provider verification and attribution](docs/providers.md)
- [Rubric and instructor walkthrough](docs/demo.md)

## Run locally

Requires Node.js 22.12+ and npm. All development dependencies are free.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. TVmaze and community sources use live public GET endpoints. For TMDB, copy `.env.example` to `.env.local` and set **one** value. Use `TMDB_READ_ACCESS_TOKEN` for a Bearer read token or `TMDB_API_KEY` for a v3 API key. Restart Vite after changing it. The local and hosted proxies share the same allowlist, timeout, response transformation, and caching. Basic archive features continue with TVmaze when TMDB credentials are absent.

## Commands

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The end-to-end suite starts a production preview on port 4185. On Windows, set `$env:BROWSER_CHANNEL = 'msedge'` in PowerShell to use an existing Edge installation. The suite includes live data navigation and controlled network fixtures for errors and quote response shapes. Visit `/sources` to check current provider health.

## Deploy

**Vercel** can import this repository as a Vite project. Use `npm run build` and output directory `dist`. Add the server-side TMDB setting in the environment for Production and, if desired, Preview. The function is `api/tmdb.js`. `vercel.json` routes direct browser refreshes to the React app while preserving `/api/tmdb` and assets.

**ChatGPT Sites** uses `npm run build:sites` and the manifest in `.openai/hosting.json`. The Worker serves the same compiled React app and runs the shared TMDB proxy with the encrypted runtime variable. The hosted site’s sharing policy controls who can open the URL.

## Source map

| Location | Purpose |
| --- | --- |
| `src/App.jsx` and `src/pages` | Route declarations, lazy screens, and composition |
| `src/services/providers` | API-specific requests and documented fallback adapters |
| `src/services/normalizers` | Schema checks, field provenance, comparison, and spoiler helpers |
| `src/hooks/useResource.js` | Reusable loading, retry, and stale-response protection |
| `src/features` and `src/data` | Wiki cards, games, case rules, and original narrative |
| `src/context` | Favorites, clues, story progress, and preferences in localStorage |
| `server` and `api` | Shared TMDB server logic and hosting entry points |
| `tests` | Unit and browser checks |

## Credits

TVmaze supplies canonical listing/detail records under its API attribution and ShareAlike terms. TMDB supplies supplementary media. Community aliases and quotes are retrieved at runtime and credited in the app. The name of the series, its characters, and associated images belong to their respective rights holders.

This educational project was implemented with assistance from OpenAI Codex. The city and pub illustrations were generated using OpenAI ImageGen for this project. The narrative, artwork composition, and synthesized chimes are original to the project. For source-level credits and known provider limits, see the [verification report](docs/providers.md).
