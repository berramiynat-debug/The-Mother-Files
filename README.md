# Legendiary!

**SE 3355 · Web Programming**

An unofficial *How I Met Your Mother* wiki and an original interactive mystery. Browse the TVmaze archive or play **The Play That Never Happened** as one of Ted’s kids. A page called **The Fifth Alibi** has gone missing from Barney’s Playbook. Compare signed documents, reconstruct the evening, and check Ted’s account before deciding where the page belongs.

- [Live wiki](https://legendiary.vercel.app)
- [The Mystery](https://legendiary.vercel.app/story)
- [Provider verification and attribution](docs/providers.md)
- [Rubric and instructor walkthrough](docs/demo.md)

## Explore the wiki

On your first visit, choose **Let's see the diary** in the opening to enter the wiki home page. Browse **Characters**, **Seasons**, and **Episodes** from the menu. In **Episodes**, you can search by title, summary, or episode code, filter by season, and save favorites.

Select an object on a character or episode card to reveal an Easter egg. Click the floating book to open **Memory Collection**, then drag or swipe to turn its pages. The previous and next controls also work with the keyboard. You can move the floating book with a mouse or touch, and the browser remembers its position.

## Play the mystery

1. Open **The Mystery** and read the documents for the current chapter.
2. Choose a conclusion and tick **Cite** on the documents that support it. In the timeline chapter, put the recorded events in order as well.
3. Select **Check deduction**. The feedback names missing required citations. You can also cite reviewed records marked **Optional reference**.
4. After a correct deduction, select **Continue** in the first three chapters. Chapter 4 opens the ending choices. Five specific keepsakes unlock an extra ending.

Select **Need a hint?** to open **The Mosby Margins**. Pick a guided hint or type a question in **Ask your sibling**. You can ask about an opened record and follow up on the reply in the same chapter.

The **Evidence Board** is a separate archive activity. **Pin to thread** selects a season’s date, episode, or character card. Select all three and choose **Connect the records** to mark that season as connected.

The **yellow umbrella** button on the home page and the **loose thread** button on the Evidence Board each unlock a keepsake in **Collection**. The final chapter lists all five keepsakes needed for the extra ending.

The browser saves your current chapter, reviewed evidence, deductions, and ending. If you have a save from the earlier umbrella investigation, choose **Start the Playbook case** to begin the new case with your archive preferences, favorites, aliases, and collectibles.

## Run locally

Requires Node.js 22.12+ and npm. All development dependencies are free.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. TVmaze supplies the main archive data. Community endpoints supply optional quotes and aliases.

Copy `.env.example` to the Git-ignored `.env.local` to configure optional providers. Restart Vite after editing the file.

- **TMDB** supplies supplementary artwork. Set either `TMDB_READ_ACCESS_TOKEN` for a Bearer read token or `TMDB_API_KEY` for a v3 key.
- **GroqCloud** writes replies for The Mosby Margins using `openai/gpt-oss-20b`. Set `GROQ_API_KEY` from a free-plan project. Groq receives the question, up to three recent chat exchanges, and reviewed case context. Guided hints and the complete mystery are available without this credential.

The browser shares archive progress across open tabs on HTTPS and localhost. On supported browsers, the Web Locks API serializes writes so simultaneous actions can save together.

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
| `src/components/MemoryBookCompanion.jsx` and `src/features/collection` | Draggable collection shortcut and paged memory book |
| `src/context` | Favorites, clues, story progress, book position, and preferences in localStorage |
| `src/styles/main.css` | Tailwind theme, shared component styles, and scene effects |
| `server/tmdb.js` and `api/tmdb.js` | TMDB proxy logic and Vercel function entry point |
| `server/hints.js` and `api/hints.js` | Groq conversation, validation, and request limits |
| `tests` | Unit and browser checks |

## Credits

TVmaze supplies canonical listing/detail records under its API attribution and ShareAlike terms. TMDB supplies supplementary media. Community aliases and quotes are retrieved at runtime and credited in the app. The name of the series, its characters, and associated images belong to their respective rights holders.

For source-level credits and known provider limits, see the [verification report](docs/providers.md).
