# SE 3355 demonstration

<details>
<summary>Instructor reference for The Play That Never Happened (case spoilers)</summary>

### What happened at MacLaren’s

| Time | Event | Contemporary record |
| --- | --- | --- |
| 21:10 | Robin opened a four-drink tab for Robin, Lily, Marshall and Barney. | Robin’s copy of the opening receipt lists the four people and the time. |
| 21:20 | Marshall filed a custody sheet for the entry Barney called The Fifth Alibi. Barney signed his own name and then used Lorenzo von Matterhorn. Lily, Marshall and Robin signed once each. | Marshall’s sheet has five signatures. Barney’s signed correction explicitly matches the two signatures to him. |
| 21:40 | Ted arrived. Robin checked in his coat. | The coat ledger marks Ted’s arrival and carries his initials and Robin’s countersignature. |
| 21:45 | Lily wrote a new closing line on the Playbook page about saving a place for a friend having a difficult evening. | Lily kept a carbon copy of her signed private annotation and of the line she wrote. The bar’s filing slip describes the missing page as an unused play draft. |
| 22:05 | Barney withdrew the page at Lily’s request for privacy, and Lily stored it in a sealed sleeve under the booth. No play was performed that evening. | Barney and Marshall signed a withdrawal slip recording the reason, the unused status, and where Lily put the page. The slip leaves the private line out. |

Marshall knew the filing and withdrawal history. He initially counted names as distinct witnesses because he had only the custody sheet. Barney knew about both signatures and about the withdrawal. He says the play never happened, then lets Ted’s recording imply the entry never existed, avoiding Lily’s confidence. Robin knew when she opened the tab and checked in Ted’s coat. She neither saw Lily write the new line nor witnessed a play. Lily knew she wrote the closing line and wanted it filed privately. She kept a carbon copy and omitted Ted’s difficult conversation from the public record. Ted pictured himself at the first round years later. He was remembering the first round he joined. He never witnessed the original signing and assumed Barney wrote every line of the page.

Players must cite Marshall’s sheet and Barney’s correction for the headcount, then pair the receipt with the countersigned coat ledger and place the recorded events in order. Lily’s signed annotation and the filing and withdrawal records establish who wrote the closing line and why the page was withdrawn. The final deduction distinguishes the unused draft, the privately revised page, and Ted’s memory of the night. Only then can the player file the corrected record, share a redacted account, or seal the page for the booth. The existing five keepsakes unlock the fourth, family-only ending.

</details>

## Rubric checklist

| Category | Weight | Where to verify |
| --- | ---: | --- |
| API integration and data handling | 20% | TVmaze supplies `/characters`, `/cast`, `/seasons`, `/episodes`, detail views, and home statistics. Browser tests exercise loading, empty results, partial failure, retry, and live detail navigation. `/sources` reports optional data and cast attribution. |
| React architecture and state | 20% | Vite builds React function components. Pages compose props and hooks, `useResource` wraps fetch lifecycles, and `ArchiveProvider` persists local data. Unit and browser tests verify saved-case validation, migration, and notebook isolation. |
| Routing, navigation, and UI/UX | 20% | Home introduces the series and links to archive sections. React Router supports dynamic detail URLs and refresh. The responsive menu, Tailwind grid, episode search, filters, and load-more controls are covered by Playwright. |
| Code quality and project structure | 10% | Presentation, hooks, providers, normalizers, and pure case rules have distinct modules. `npm run lint`, `npm test`, and `npm run build` check the project. |
| Creativity and effort | 30% | The intro, pub scene, five mini-games, collection, original evidence puzzles, four endings, and optional notebook extend the wiki. Playwright completes the investigation without Groq and exercises keyboard, reduced motion, and retry behavior. |

## Verification results

The clean install, production build, and lint passed, along with 31 Vitest tests and 24 Playwright tests. The browser suite covers concurrent archive updates and reset across tabs, direct episode links during a list outage, keyboard route focus and titles, and stronger hints after reading evidence. Edge production-preview checks covered home, the investigation, and the open notebook at 320, 375, 390, 768, 1024, and 1440 px. The preview returned HTTP 503 without a Groq credential. A separate live request through the shared server handler returned HTTP 200.

## A four-minute walkthrough

1. Open the home page, replay or skip the intro, then select **Episodes**. Search for `S01E01`, favorite **Pilot**, open it, and refresh its direct URL.
2. Open **Characters**, then **Barney Stinson**. File **Swarley**, use **Suit up**, and show the unlocked memories in **Collection**.
3. Open **Sources & credits** and show the **Marshall Eriksen** actor conflict. Enter `3355` in the restricted file field to show the API flow, optional provider status, and normalized ownership.
4. Open **The Pub**, find the sealed envelope, and try the suitcase or telephone. Show the **Evidence Board** and pin all three records. On **Games**, play one clue in **Guess the Episode** and use **Space** for **Slap Bet**.
5. Open **The Mystery**, read the envelope and correction, and cite both to check the first deduction. Open **Need a hint?** with the keyboard. Try a guided hint, then send a custom case question if the optional Groq credential is configured.

## Code walkthrough

| Follow this path | What happens |
| --- | --- |
| `src/main.jsx` → `src/App.jsx` → `src/components/Layout.jsx` | The React entry point loads the fonts and styles. The router selects the screen. The layout renders shared navigation, handles scroll position, and offers a way back to the investigation. |
| `src/pages/Wiki.jsx` and `src/pages/Details.jsx` → `src/hooks/useResource.js` → `src/services/providers` | Wiki screens load lists and details through providers. The hook tracks loading, errors, and retries. `src/services/http.js` handles requests and caching. `src/services/normalizers/records.js` validates fields and applies spoiler rules. |
| `src/pages/Story.jsx` → `src/features/story/CaseScenes.jsx` and `logic.js` | Scenes present documents and record player choices. Pure rules validate required evidence, event order, deductions, and ending eligibility against stable IDs. |
| `src/context/ArchiveProvider.jsx` and `src/data` | Context persists favorites, progress, and memories in localStorage. The data files define the original story chapters, Playbook decisions, and collectible descriptions. |
| `src/styles/main.css` and component class names | Tailwind provides shared spacing, cards, and responsive layouts. Scene gradients, custom animation keyframes, and illustrated props use CSS. |
| `vercel.json` → `api/tmdb.js` → `server/tmdb.js` | Vercel serves the React entry point for deep links. The TMDB function uses a server-side credential. TVmaze still supplies the wiki when the optional TMDB credential is absent. |
| `HintNotebook.jsx` → `/api/hints` → `server/hints.js` | The notebook keeps temporary conversation state. The server reconstructs clue context and uses Groq to choose among approved hint topics. |

<details>
<summary>Case and secret walkthrough</summary>

- **Home** — inspect the yellow umbrella and the quiet blue musical note.
- **Episodes** — open the Pineapple Incident (Season 1, Episode 10) and inspect the pineapple.
- **Characters** — file Barney’s Swarley alias and use Suit up; file Robin Sparkles in Robin’s dossier.
- **Pub** — finish either telephone conversation, and open the folded rulebook in the notebook. Recover the sealed envelope.
- **About** — select Duck or Rabbit in the perception test.
- **Seasons** — select the first air date on the timeline.
- **Evidence Board** — pull the loose thread.
- **Sources** — enter 3355 to recover the technical annex.
- **The Mystery** — use the instructor reference above to check the four deductions. All required documents are in the story. At the final chapter, choose among three endings. Collect the booth photograph, envelope, loose thread, umbrella, and horn to make **Save one last seat** available. Use **Try another ending** to revisit the decision.

</details>
