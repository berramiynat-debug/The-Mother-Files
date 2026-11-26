import { useState } from 'react';
import { Dice5, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Empty, PageHeading, Picture, SearchField, SpoilerToggle, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { EpisodeCard, PersonCard } from '../features/wiki/WikiCards.jsx';
import { useResource } from '../hooks/useResource.js';
import { tvmazeService } from '../services/providers/tvmazeService.js';
import { tmdbImage, tmdbService } from '../services/providers/tmdbService.js';
import { episodeCode, namesMatch, protectedEpisode, protectedName, protectEpisode } from '../services/normalizers/records.js';

const getCredits = () => tmdbService('credits');
const matches = (value, search) => value.toLowerCase().includes(search.trim().toLowerCase());

function PeopleListing({ mode, title, description }) {
  const cast = useResource('cast', tvmazeService.characters);
  const credits = useResource('credits', getCredits);
  const { state } = useArchive();
  const [search, setSearch] = useState('');
  const rows = (cast.data ?? []).filter((row) => (state.spoilers || !protectedName(row.name)) && matches(row.name + ' ' + row.actor.name, search));
  return <section className="wrap page">
    <PageHeading eyebrow="Series archive" title={title} description={description}><SpoilerToggle /></PageHeading>
    <div className="filter-bar"><SearchField label={'Search ' + mode} value={search} onChange={setSearch} placeholder={'Search ' + mode + '…'} /><p>{cast.data && rows.length + ' files'}</p></div>
    <Status resource={cast}>
      {rows.length ? <div className="people-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((row) => {
          const tmdb = credits.data?.cast?.find((credit) => namesMatch(credit.name, row.actor.name));
          const image = mode === 'characters' ? row.image : tmdbImage(tmdb?.photo, 'w500') || row.actor.image;
          return <PersonCard key={row.id} row={row} mode={mode} image={image} />;
        })}
      </div> : <Empty><button className="button secondary" onClick={() => setSearch('')}>Clear search</button></Empty>}
    </Status>
    <p className="credit">Series data by TVmaze{mode === 'cast' && credits.data ? ' · Additional portraits by TMDB' : ''}</p>
  </section>;
}

export const Characters = () => <PeopleListing mode="characters" title="Character dossiers." description="These are the people who turned a quick drink into a nine-year scheduling problem." />;
export const Cast = () => <PeopleListing mode="cast" title="The cast." description="Kids, use the cast credits if a name in my files sounds suspicious. Especially if Barney supplied it." />;

export function Seasons() {
  const seasons = useResource('seasons', tvmazeService.seasons);
  const { state, unlock } = useArchive();
  return <section className="wrap page">
    <PageHeading eyebrow="Series archive" title="The timeline." description="I remember most of these nights. For the actual dates, trust the timeline."><SpoilerToggle /></PageHeading>
    <Status resource={seasons}>
      {seasons.data?.length ? <div className="timeline">
        {[...seasons.data].sort((a, b) => a.number - b.number).map((row) => <article className="timeline-entry" key={row.id}>
          <div className="timeline-mark"><span>{String(row.number).padStart(2, '0')}</span>{row.number === 1
            ? <button className="timeline-date" onClick={() => unlock('date')} title="Inspect the first archive date">{row.date}</button>
            : <small>{row.date || 'Unknown date'}</small>}</div>
          <Link to={'/seasons/' + row.number} className="timeline-card">
            {row.number >= 8 && !state.spoilers ? <div className="picture picture-fallback timeline-image"><LockKeyhole /></div> : <Picture src={row.image} className="timeline-image" />}
            <div><p className="eyebrow">{row.count ? row.count + ' episodes' : 'Season record'}</p><h2>Season {row.number}</h2>
              {row.number < 8 || state.spoilers ? <p>{row.summary || 'Browse the episodes from this season.'}</p> : <p>Some files are sealed for spoilers.</p>}</div>
          </Link>
        </article>)}
      </div> : <Empty title="No seasons available" />}
    </Status>
    <p className="credit">Timeline and season records by TVmaze</p>
  </section>;
}

export function Episodes() {
  const resource = useResource('episodes', tvmazeService.episodes);
  const { state } = useArchive();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState('');
  const [sort, setSort] = useState('old');
  const [favorites, setFavorites] = useState(false);
  const [limit, setLimit] = useState(12);
  const raw = resource.data ?? [];
  const rows = raw.map((row) => protectEpisode(row, state.spoilers))
    .filter((row) => (!season || row.season === Number(season)) && (!favorites || state.favorites.includes(row.id)) &&
      matches(row.name + ' ' + episodeCode(row) + ' ' + (row.summary || ''), search))
    .sort((a, b) => sort === 'title' ? a.name.localeCompare(b.name) : (sort === 'old' ? 1 : -1) * (a.season - b.season || a.number - b.number));
  const random = rows.filter((row) => state.spoilers || !protectedEpisode(row));
  const change = (setter) => (value) => { setter(value); setLimit(12); };
  return <section className="wrap page">
    <PageHeading eyebrow="Series archive" title="Episode archive." description="Find the night you’re thinking of by title, season, or the detail you remember. I’m curious which ones you’ll put in your favorites.">
      <div className="heading-actions">
        <SpoilerToggle />
        <button className="button secondary" disabled={!random.length} onClick={() => navigate('/episodes/' + random[Math.floor(Math.random() * random.length)].id)}><Dice5 size={18} /> Random episode</button>
      </div>
    </PageHeading>
    <div className="filter-bar episode-filters">
      <SearchField label="Search episodes" value={search} onChange={change(setSearch)} placeholder="Search titles, summaries, or S01E01…" />
      <label><span className="sr-only">Filter by season</span><select value={season} onChange={(event) => change(setSeason)(event.target.value)}><option value="">All seasons</option>
        {[...new Set(raw.map((row) => row.season))].map((number) => <option key={number} value={number}>Season {number}</option>)}</select></label>
      <label><span className="sr-only">Sort episodes</span><select value={sort} onChange={(event) => change(setSort)(event.target.value)}><option value="old">Oldest first</option><option value="new">Newest first</option><option value="title">Title A–Z</option></select></label>
      <label className="check"><input type="checkbox" checked={favorites} onChange={(event) => change(setFavorites)(event.target.checked)} /> Favorites</label>
    </div>
    <Status resource={resource}>
      <p className="results-count" aria-live="polite">{rows.length} {rows.length === 1 ? 'episode' : 'episodes'}</p>
      {rows.length ? <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.slice(0, limit).map((row) => <EpisodeCard key={row.id} row={row} />)}</div>
        {rows.length > limit && <div className="load-more"><button className="button secondary" onClick={() => setLimit(limit + 12)}>Load more episodes</button><small>{limit} of {rows.length} shown</small></div>}
      </> : <Empty><button className="button secondary" onClick={() => { setSearch(''); setSeason(''); setFavorites(false); setLimit(12); }}>Clear filters</button></Empty>}
    </Status>
    <p className="credit">Episode records by TVmaze</p>
  </section>;
}
