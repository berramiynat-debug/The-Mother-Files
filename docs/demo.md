# SE 3355 demonstration

## Rubric checklist

| Category | Weight | Where to verify |
| --- | ---: | --- |
| API and data handling | 20% | `/characters`, `/cast`, `/seasons`, `/episodes` and their detail routes use TVmaze. `/sources` probes optional providers and compares cast attribution. |
| React architecture and state | 20% | Functional components, props, hooks, shared API adapters, and an archive context for local persistence. |
| Routing, navigation, and UI/UX | 20% | React Router details and direct refresh, Tailwind grid and layout utilities, responsive menu, search, filters, pagination, favorites, and spoiler controls. |
| Code quality and structure | 10% | Services, normalizers, hooks, pages, and game logic are separated. Run lint and the automated suites from the repository root. |
| Creativity and effort | 30% | Scene controls in the intro, a spotlight in MacLaren’s, five mini-games, a memory gallery, and a four-stage case that uses the TVmaze Pilot air date as a clue. The case has four endings. |

## A four-minute walkthrough

1. Open the home page, replay or skip the intro, then select **Episodes**. Search for `S01E01`, favorite **Pilot**, open it, and refresh its direct URL.
2. Open **Characters**, then **Barney Stinson**. File **Swarley**, use **Suit up**, and show the unlocked memories in **Collection**.
3. Open **Sources & credits** and show the **Marshall Eriksen** actor conflict. Enter `3355` in the restricted file field to show the API flow, optional provider status, and normalized ownership.
4. Open **The Pub**, find the sealed envelope, and try the suitcase or telephone. Show the **Evidence Board** and pin all three records. On **Games**, play one clue in **Guess the Episode** and use **Space** for **Slap Bet**.

## Code walkthrough

| Follow this path | What happens |
| --- | --- |
| `src/main.jsx` → `src/App.jsx` → `src/components/Layout.jsx` | The React entry point loads the fonts and styles. The router selects the screen. The layout renders shared navigation, handles scroll position, and offers a way back to the investigation. |
| `src/pages/Wiki.jsx` and `src/pages/Details.jsx` → `src/hooks/useResource.js` → `src/services/providers` | Wiki screens load lists and details through providers. The hook tracks loading, errors, and retries. `src/services/http.js` handles requests and caching. `src/services/normalizers/records.js` validates fields and applies spoiler rules. |
| `src/pages/Story.jsx` → `src/features/story/CaseScenes.jsx` and `logic.js` | The page reads and updates the current chapter. Each scene presents a clue. The rules validate the drawer code and check whether the final decision or combined keepsakes unlock the chosen ending. |
| `src/context/ArchiveProvider.jsx` and `src/data` | Context persists favorites, progress, and memories in localStorage. The data files define the original story chapters, Playbook decisions, and collectible descriptions. |
| `src/styles/main.css` and component class names | Tailwind provides shared spacing, cards, and responsive layouts. Scene gradients, custom animation keyframes, and illustrated props use CSS. |
| `vercel.json` → `api/tmdb.js` → `server/tmdb.js` | Vercel serves the React entry point for deep links. The TMDB function uses a server-side credential. TVmaze still supplies the wiki when the optional TMDB credential is absent. |

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
- **The Mystery** — open Barney’s envelope, identify Swarley, use the Pilot’s air date (`0919`) for the drawer, and connect both signatures on the slip to Barney. The Pilot card shows the air date in the scene. You can play the whole main case without leaving the story. Choose among three ordinary endings. To access the secret ending, combine the photograph, envelope, loose thread, umbrella, and horn in the last stage. Replay earlier endings with **Try another ending**.

</details>
