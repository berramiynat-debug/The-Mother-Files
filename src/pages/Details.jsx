import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackLink, Empty, PageHeading, Picture, SpoilerLock, SpoilerToggle, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { Credit, EpisodeCard, Favorite } from '../features/wiki/WikiCards.jsx';
import { useResource } from '../hooks/useResource.js';
import { tvmazeService } from '../services/providers/tvmazeService.js';
import { himymCharacterService } from '../services/providers/himymCharacterService.js';
import { himymArchiveService } from '../services/providers/himymArchiveService.js';
import { tmdbImage, tmdbService } from '../services/providers/tmdbService.js';
import { episodeCode, namesMatch, protectedEpisode, protectedName, protectEpisode } from '../services/normalizers/records.js';

const getCredits = () => tmdbService('credits');
const parseId = (value) => /^\d{1,9}$/.test(value ?? '') ? Number(value) : 0;
const clueStyle = { 'Ted Mosby': 'Architect of a thousand side stories', 'Marshall Eriksen': 'Counsel for the booth', 'Lily Aldrin': 'Keeper of the group’s secrets',
  'Robin Scherbatsky': 'Reporter on the midnight desk', 'Barney Stinson': 'Frequent cause of missing paperwork' };

function IdentityFolder({ character }) {
  const resource = useResource('identities', himymCharacterService.identities);
  const { state, set, unlock } = useArchive();
  const [flash, setFlash] = useState('');
  const row = himymArchiveService.identify(resource.data ?? [], character.name);
  const reveal = (name) => {
    const key = character.name + '|' + name;
    set('aliases', (items) => items.includes(key) ? items : [...items, key]);
    if (name === 'Swarley') { unlock('swarley'); setFlash('Swarley protocol unlocked.'); }
    else if (name === 'Robin Sparkles') { unlock('sparkles'); setFlash('Mall transmission restored.'); }
    else setFlash('Alias filed · ' + name);
  };

  return <section className="panel">
    <p className="eyebrow">Identity folder</p><h2>Alternate identities</h2>
    <Status resource={resource}>
      {row?.aliases.length ? <><p>Community records · {state.aliases.filter((alias) => alias.startsWith(character.name + '|')).length} of {row.aliases.length} filed</p>
        {row.occupations.length > 0 && (state.spoilers || character.name !== 'Barney Stinson') && <p>Occupation clue · {row.occupations.join(' / ')}</p>}
        <div className="chip-row">{row.aliases.map((name) => <button className="tag" aria-pressed={state.aliases.includes(character.name + '|' + name)} key={name} onClick={() => reveal(name)}>{name}</button>)}</div>
      </> : <p>No community aliases for this dossier.</p>}
    </Status>
    {flash && <p key={flash} role="status" className={flash.startsWith('Mall') ? 'sparkles' : 'reveal-text'}>{flash}</p>}
  </section>;
}

export function CharacterDetail() {
  const id = parseId(useParams().id);
  const result = useResource('cast', tvmazeService.characters);
  const character = result.data?.find((row) => row.id === id);
  const { state, unlock } = useArchive();
  const [suit, setSuit] = useState(false);
  return <article className="wrap page">
    <div className="record-controls"><BackLink to="/characters">Character dossiers</BackLink><SpoilerToggle /></div>
    <Status resource={result}>
      {!character ? <Empty title="Dossier not found" /> : protectedName(character.name) && !state.spoilers ? <SpoilerLock /> : <>
        <div className={'detail-hero ' + (suit && character.name === 'Barney Stinson' ? 'suited' : '')}>
          <div className="portrait-frame">
            <Picture src={character.image} alt={character.name} className="detail-portrait" />
            {suit && character.name === 'Barney Stinson' && <svg className="suit-overlay" width="240" height="102" viewBox="0 0 240 102" aria-hidden="true">
              <path d="M0 70 73 20l25-12h44l25 12 73 50v32H0Z" fill="#0f141c" />
              <path d="m94 13 26 17 24-17-24 78Z" fill="#f6ebd6" />
              <path d="m120 33 7 7-4 8 6 27-9 16-9-16 7-27-5-8Z" fill="#743743" />
              <path d="m96 10 23 92h-13L73 56l11-9-14-7Zm48 0-23 92h13l33-46-11-9 14-7Z" fill="#29313a" />
            </svg>}
          </div>
          <div><PageHeading eyebrow="Character dossier" title={character.name} description={clueStyle[character.name]} />
            <p>Portrayed by <Link className="text-link" to={'/cast/' + character.actor.id}>{character.actor.name}</Link>.</p>
            <div className="button-row"><Link className="button secondary" to="/evidence">Open the evidence board</Link>
              {character.name === 'Barney Stinson' && <button className="button secondary" aria-pressed={suit} onClick={() => { setSuit(!suit); unlock('suit'); }}>{suit ? 'Undo the makeover' : 'Suit up'}</button>}
            </div><Credit row={character} />
          </div>
        </div>
        <IdentityFolder key={character.id} character={character} />
        <p className="credit">Dossier subtitles are original archive fiction. The actor shown is sourced from TVmaze.</p>
      </>}
    </Status>
  </article>;
}

export function CastDetail() {
  const id = parseId(useParams().id);
  const { state } = useArchive();
  const load = useCallback(() => tvmazeService.actor(id), [id]);
  const actor = useResource(id || null, load);
  const cast = useResource('cast', tvmazeService.characters);
  const credits = useResource('credits', getCredits);
  const roles = (cast.data ?? []).filter((row) => row.actor.id === id && (state.spoilers || !protectedName(row.name)));
  const picture = credits.data?.cast?.find((row) => namesMatch(actor.data?.name, row.name));
  return <article className="wrap page">
    <div className="record-controls"><BackLink to="/cast">The cast</BackLink><SpoilerToggle /></div>
    <Status resource={actor}>
      {!actor.data ? <Empty title="Actor not found" /> : !state.spoilers && protectedName(actor.data.name) ? <SpoilerLock /> :
        <div className="detail-hero">
          <Picture src={tmdbImage(picture?.photo, 'w500') || actor.data.image} className="detail-portrait" alt={actor.data.name} />
          <div><PageHeading eyebrow="Cast file" title={actor.data.name} />
            <dl className="detail-meta"><div><dt>Country</dt><dd>{actor.data.country || 'Unknown'}</dd></div><div><dt>Born</dt><dd>{actor.data.birthday || 'Unknown'}</dd></div></dl>
            <Status resource={cast}><div className="button-row">{roles.map((row) => <Link className="button secondary" to={'/characters/' + row.id} key={row.id}>Dossier · {row.name}</Link>)}</div></Status>
            <Credit row={actor.data}>{picture?.photo ? 'Record by TVmaze · Portrait by TMDB' : undefined}</Credit>
          </div>
        </div>}
    </Status>
  </article>;
}

export function EpisodeDetail() {
  const id = parseId(useParams().id);
  const { state, unlock } = useArchive();
  const load = useCallback(() => tvmazeService.episode(id), [id]);
  const result = useResource(id || null, load);
  const archive = useResource('episodes', tvmazeService.episodes);
  const row = result.data;
  const sealed = row && !state.spoilers && protectedEpisode(row);
  const season = row?.season;
  const episode = row?.number;
  const loadImage = useCallback(() => tmdbService('episode', { season, episode }), [season, episode]);
  const images = useResource(row && !sealed ? row.id : null, loadImage);
  const at = archive.data?.findIndex((item) => item.id === id) ?? -1;
  const previous = at > 0 ? archive.data[at - 1] : null;
  const next = at >= 0 ? archive.data[at + 1] : null;
  const still = tmdbImage(images.data?.stills?.[0], 'w1280');
  return <article className="wrap page">
    <div className="record-controls"><BackLink to="/episodes">Episode archive</BackLink><SpoilerToggle /></div>
    <Status resource={result}>
      {!row ? <Empty title="Episode not found" /> : sealed ? <><PageHeading eyebrow={episodeCode(row)} title="Sealed episode." /><SpoilerLock /></> : <>
        <PageHeading eyebrow={'TVmaze · ' + episodeCode(row)} title={row.name}><Favorite id={row.id} /></PageHeading>
        <Picture src={still || row.image} className="detail-still" alt={row.name + ' episode still'} eager />
        <div className="panel episode-summary">
          <dl className="detail-meta"><div><dt>First aired</dt><dd>{row.date || 'Unknown'}</dd></div><div><dt>Runtime</dt><dd>{row.runtime ? row.runtime + ' min' : 'Unknown'}</dd></div><div><dt>TVmaze rating</dt><dd>{row.rating ?? 'Unrated'}</dd></div></dl>
          <h2>Synopsis</h2><p>{row.summary || 'No synopsis on record.'}</p>
          {row.season === 1 && row.number === 10 && <button className="quiet-secret" onClick={() => unlock('pineapple')}>Inspect the pineapple</button>}
          <Credit row={row}>{still ? 'Record by TVmaze · Still by TMDB' : undefined}</Credit>
        </div>
      </>}
      {row && <div className="episode-neighbors button-row">
        {previous && <Link className="button secondary" to={'/episodes/' + previous.id}>Previous episode</Link>}
        <Link className="button secondary" to={'/seasons/' + row.season}>Season {row.season}</Link>
        {next && <Link className="button secondary" to={'/episodes/' + next.id}>Next episode</Link>}
      </div>}
    </Status>
  </article>;
}

export function SeasonDetail() {
  const id = parseId(useParams().number);
  const { state } = useArchive();
  const seasons = useResource('seasons', tvmazeService.seasons);
  const episodes = useResource('episodes', tvmazeService.episodes);
  const season = seasons.data?.find((row) => row.number === id);
  const safeImages = id < 8 || state.spoilers;
  const load = useCallback(() => tmdbService('season', { season: id }), [id]);
  const tmdb = useResource(safeImages && season ? id : null, load);
  const poster = tmdbImage(tmdb.data?.poster, 'w500');
  const rows = (episodes.data ?? []).filter((row) => row.season === id).map((row) => protectEpisode(row, state.spoilers));
  return <article className="wrap page">
    <div className="record-controls"><BackLink to="/seasons">The timeline</BackLink><SpoilerToggle /></div>
    <Status resource={seasons}>
      {!season ? <Empty title="Season not found" /> : <>
        <div className="detail-hero">
          <Picture src={safeImages ? poster || season.image : ''} className="detail-portrait season-poster" alt={'Season ' + id + ' poster'} />
          <div><PageHeading eyebrow="Timeline record" title={'Season ' + id} description={(season.date || 'Date unknown') + ' · ' + (season.count || rows.length) + ' episodes'} />
            {safeImages && season.summary && <p>{season.summary}</p>}<Credit row={season}>{poster ? 'Record by TVmaze · Poster by TMDB' : undefined}</Credit></div>
        </div>
        <h2 className="subheading">Episodes</h2>
        <Status resource={episodes}>{rows.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map((row) => <EpisodeCard key={row.id} row={row} />)}</div> : <Empty title="No episodes found" />}</Status>
      </>}
    </Status>
  </article>;
}
