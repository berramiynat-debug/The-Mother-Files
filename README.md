# Legendiary!

**SE 3355 · Web Programming**

An unofficial *How I Met Your Mother* wiki and an original interactive mystery. Browse the TVmaze archive or play **The Play That Never Happened** as one of Ted’s kids. A page called **The Fifth Alibi** has gone missing from Barney’s Playbook. Compare signed documents, reconstruct the evening, and check Ted’s account before deciding where the page belongs.

- [Hosted site](https://legendiary.vercel.app)
- [Provider verification and attribution](docs/providers.md)
- [Rubric and instructor walkthrough](docs/demo.md)

## Run locally

Requires Node.js 22.12+ and npm. All development dependencies are free.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. TVmaze and community sources use live public GET endpoints. For TMDB, copy `.env.example` to `.env.local` and set **one** value. Use `TMDB_READ_ACCESS_TOKEN` for a Bearer read token or `TMDB_API_KEY` for a v3 API key. Restart Vite after changing it. The local and hosted proxies share the same allowlist, timeout, response transformation, and caching. Basic archive features continue with TVmaze when TMDB credentials are absent.

**The Mosby Margins** offers guided sibling hints throughout the case. To enable optional AI-selected replies to custom questions locally, set `GROQ_API_KEY` in the ignored `.env.local`. Use a GroqCloud free-plan project with `openai/gpt-oss-20b`, the default and only allowed `GROQ_MODEL`. Custom questions and reviewed case context go to Groq. Guided hints, case progression, and all endings work without a credential.

On first visit after upgrading, a saved umbrella investigation is archived locally. Choose **Start the Playbook case** to open the new case. Archive preferences, favorites, aliases, and collectibles carry over.

Open tabs share the same archive on HTTPS and localhost. The browser’s Web Locks API serializes changes where available, and each tab refreshes its view when another tab saves.

## Commands

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The end-to-end suite starts a production preview on port 4185. On Windows, set `$env:BROWSER_CHANNEL = 'msedge'` in PowerShell to use an existing Edge installation. The suite includes live TVmaze navigation and controlled fixtures for loading, errors, quote responses, and notebook replies. Visit `/sources` to see archive provider health and attribution.

## Deploy

Import this repository into **Vercel** as a Vite project. The build command is `npm run build` and the output directory is `dist`. Set optional `TMDB_API_KEY` or `TMDB_READ_ACCESS_TOKEN` and `GROQ_API_KEY` as server-side variables in the intended Vercel environment. `vercel.json` routes direct browser refreshes to React and preserves `/api/tmdb`, `/api/hints`, and assets. The provider documentation describes the notebook’s request limits.

## Source map

| Location | Purpose |
| --- | --- |
| `src/App.jsx` and `src/pages` | Route declarations, lazy screens, and composition |
| `src/services/providers` | API-specific requests and documented fallback adapters |
| `src/services/normalizers` | Schema checks, field provenance, comparison, and spoiler helpers |
| `src/hooks/useResource.js` | Reusable loading, retry, and stale-response protection |
| `src/features` and `src/data` | Wiki cards, games, case rules, and original narrative |
| `src/context` | Favorites, clues, story progress, and preferences in localStorage |
| `src/styles/main.css` | Tailwind theme, shared component styles, and scene effects |
| `server/tmdb.js` and `api/tmdb.js` | TMDB proxy logic and Vercel function entry point |
| `server/hints.js` and `api/hints.js` | Groq classification, validation, and request limits |
| `tests` | Unit and browser checks |

## Credits

TVmaze supplies canonical listing/detail records under its API attribution and ShareAlike terms. TMDB supplies supplementary media. Community aliases and quotes are retrieved at runtime and credited in the app. The name of the series, its characters, and associated images belong to their respective rights holders.

For source-level credits and known provider limits, see the [verification report](docs/providers.md).
