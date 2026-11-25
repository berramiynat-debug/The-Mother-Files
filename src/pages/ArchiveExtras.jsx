import { useState } from 'react';
import { Archive, Database, FileText, GitBranch, LockKeyhole, Radio, RotateCcw, Server, Umbrella } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, Picture, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { memories } from '../data/memories.js';
import { useResource } from '../hooks/useResource.js';
import { himymArchiveService } from '../services/providers/himymArchiveService.js';
import { tmdbImage, tmdbService } from '../services/providers/tmdbService.js';

const getShow = () => tmdbService('show');
const getImages = () => tmdbService('images');
const providers = [
  ['TVmaze', 'Canonical series, season, episode, actor, and character records.', 'https://www.tvmaze.com/api', 'CC BY-SA for API data. See TVmaze for its attribution and licensing terms.'],
  ['TMDB', 'Supplementary portraits, season art, episode stills, and backdrops.', 'https://www.themoviedb.org/tv/1100-how-i-met-your-mother', 'This product uses the TMDB API but is not endorsed or certified by TMDB.'],
  ['HIMYM Character API', 'Community alias and occupation records, plus short random quotes.', 'https://github.com/hrithik73/himym-api', 'Used via public GET endpoints. Cast attribution comes from TVmaze.'],
  ['MacLaren’s Pub API', 'Reviewed FastAPI reference project.', 'https://github.com/aashikmathew/himym-maclarens-api', 'The pub uses independently written fiction and chimes.'],
  ['HIMYM Archive API', 'Reviewed Flask reference project.', 'https://github.com/joshshep97/himym_api', 'The evidence board uses first-party TVmaze requests through an independent adapter.'],
  ['GroqCloud', 'Optional custom-question routing for The Mosby Margins.', 'https://console.groq.com/docs/model/openai/gpt-oss-20b', 'Groq classifies case questions. The game chooses approved hints and offers guided help offline.'],
];
const stateLabel = (resource) => resource.loading ? 'Checking' : resource.error ? 'Unavailable' : 'Healthy';

function CaseFile() {
  return <section className="panel architecture">
    <p className="eyebrow">Technical annex</p><h2>Case File 3355</h2>
    <ol className="flow" aria-label="API data flow">
      {[[Database, 'Providers', 'TVmaze supplies canon. The Character API adds aliases and quotations.'],
        [Server, 'TMDB proxy', 'Allowlisted routes resolve show and image data server-side.'],
        [GitBranch, 'Normalizers', 'Check types, strip HTML, deduplicate, and compare actor fields.'],
        [Archive, 'React routes', 'Resource hooks handle requests. Context stores local progress.']].map(([Icon, title, copy]) =>
        <li key={title}><Icon size={23} /><h3>{title}</h3><p>{copy}</p></li>)}
    </ol>
    <p>React Router handles dynamic URLs and lazy routes. Request caching belongs to the provider layer. The optional notebook sends custom questions and reviewed case context through a separate server endpoint. Its replies never change case progress.</p>
  </section>;
}

function Ambiguity() {
  const [answer, setAnswer] = useState('');
  const { unlock } = useArchive();
  return <section className="panel ambiguity">
    <p className="eyebrow">Perception test</p><h2>One drawing, two witnesses.</h2>
    <svg className={answer === 'Rabbit' ? 'flipped' : ''} viewBox="0 0 200 115" width="200" height="115" role="img" aria-label="Original line drawing that can look like a duck or a rabbit"><path d="M166 95c-13-9-13-23-19-36-9-23-31-39-55-27-13 6-17 15-24 13S26 24 12 28c8 12 33 27 48 30-15-2-38-3-45 4 11 9 33 10 52 11 5 15 13 28 30 32 17 3 38-4 49-11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="91" cy="58" r="4" fill="currentColor" /></svg>
    <div className="chip-row">{['Duck', 'Rabbit'].map((value) => <button className="tag" key={value} aria-pressed={answer === value}
      onClick={() => { setAnswer(value); unlock('duck'); }}>{value}</button>)}</div>
    {answer && <p className="note" role="status">{answer === 'Duck' ? 'The duck saw the suitcase first.' : 'The rabbit swears the suitcase was there all along.'}</p>}
  </section>;
}

export function Collection() {
  const { state, reset } = useArchive();
  const [confirm, setConfirm] = useState(false);
  const cast = useResource('integrity', himymArchiveService.integrity);
  const count = memories.filter((item) => state.unlocked.includes(item.id)).length;
  const pct = Math.round(count / memories.length * 100);
  return <section className="wrap page">
    <PageHeading eyebrow="Local archive" title="Recovered memories." description="This is your folder now, kids. Keep the clues you found. Mine’s the one with six separate tabs for rain." />
    <div className="panel completion"><p><strong>{count} / {memories.length}</strong> recovered <span>{pct}%</span></p><progress aria-label="Memory collection completion" value={count} max={memories.length} /></div>
    <div className="memory-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{memories.map((item) => {
      const found = state.unlocked.includes(item.id);
      return <article className={'memory ' + (found ? 'found' : 'locked')} key={item.id}>{found ? <FileText size={19} /> : <LockKeyhole size={18} />}
        <div><h2>{found ? item.title : 'Sealed memory'}</h2><p>{found ? item.description : 'Explore the archive to recover this file.'}</p></div></article>;
    })}</div>
    <section className="panel memory-wall"><p className="eyebrow">Quote detective</p><h2>Memory wall</h2>
      {state.wall.length ? <ul>{state.wall.filter((item) => state.spoilers || (item.season && item.season < 8)).map((item) => <li key={item.id}>{item.author} · Voice print recovered</li>)}
        {!state.spoilers && state.wall.some((item) => !item.season || item.season >= 8) && <li>Unclassified and late-season voices under seal</li>}</ul>
        : <p>Correct answers from <Link className="text-link" to="/games?game=narrator">Quote Detective</Link> appear here.</p>}
      {state.connections.length > 0 && <p>Connected evidence threads · {state.connections.length}</p>}
      {state.aliases.length > 0 && <p>Filed aliases · {state.aliases.length}</p>}
      {cast.data?.identityHealthy && <Link className="text-link" to="/sources">Review archive integrity</Link>}
    </section>
    {state.unlocked.includes('case3355') && <CaseFile />}
    <div className="reset-row">
      {confirm ? <><p>Clear your recovered files, story progress, favorites, and preferences?</p>
        <button className="button danger" onClick={() => { reset(); setConfirm(false); }}>Clear archive data</button><button className="button secondary" onClick={() => setConfirm(false)}>Cancel</button></>
        : <button className="button secondary" onClick={() => setConfirm(true)}><RotateCcw size={17} /> Reset local progress</button>}
    </div>
  </section>;
}

export function Sources() {
  const { state, unlock } = useArchive();
  const integrity = useResource('integrity', himymArchiveService.integrity);
  const show = useResource('tmdb-show', getShow);
  const images = useResource('tmdb-images', getImages);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const visual = tmdbImage(images.data?.backdrops?.[0] || show.data?.backdrop, 'w780');
  const statuses = new Map([
    ['TVmaze', stateLabel(integrity)], ['TMDB', stateLabel(show)],
    ['HIMYM Character API', integrity.loading ? 'Checking' : integrity.data?.identityHealthy ? 'Healthy' : 'Unavailable'],
    ['GroqCloud', 'Optional · on demand'],
  ]);

  return <section className="wrap page">
    <PageHeading eyebrow="Engineering & credits" title="Archive integrity." description="Here’s where I got the records. When two sources disagree, check who actually keeps the original credit." />
    <div className="grid md:grid-cols-2 gap-4 source-grid">
      {providers.map(([name, purpose, url, rights]) => {
        const status = statuses.get(name) ?? 'Local reference';
        return <article className="panel source" key={name}>
          <span className={'health ' + (status === 'Healthy' ? 'healthy' : '')}><Radio size={14} aria-hidden="true" /> {status}</span>
          <h2>{name}</h2><p>{purpose}</p>
          {name === 'TMDB' && <a className="tmdb-logo" href="https://www.themoviedb.org" target="_blank" rel="noreferrer"><img src="/tmdb.svg" alt="The Movie Database" width="96" /></a>}
          <p className="credit">{rights}</p><a className="text-link" href={url} target="_blank" rel="noreferrer">Provider documentation</a>
        </article>;
      })}
    </div>
    <section className="panel">
      <p className="eyebrow">Field-level comparison</p><h2>Cast attribution</h2>
      <Status resource={integrity}>{integrity.data?.identityHealthy ? <div className="table-scroll"><table><thead><tr><th scope="col">Character</th><th scope="col">Canonical actor · TVmaze</th><th scope="col">Community record</th></tr></thead>
        <tbody>{integrity.data.rows.filter((row) => state.spoilers || !/the mother/i.test(row.name)).map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.actor}</td><td>{row.status}</td></tr>)}</tbody></table></div>
        : <><p>The community provider did not respond. TVmaze cast credits remain available.</p><button className="button secondary" onClick={integrity.retry}>Retry comparison</button></>}</Status>
    </section>
    {visual && state.spoilers && <figure className="source-art"><Picture src={visual} alt="Series backdrop from TMDB" /><figcaption>{show.data?.name || 'Series backdrop'} · TMDB</figcaption></figure>}
    <form className="panel integrity-form" onSubmit={(event) => {
      event.preventDefault();
      if (code.trim() === '3355') { unlock('case3355'); setFeedback('Technical annex recovered.'); }
      else setFeedback('That file is sealed. Check the course number in About.');
    }}>
      <label className="field-label">Open a restricted file <input value={code} maxLength={10} onChange={(event) => setCode(event.target.value)} placeholder="File number" inputMode="numeric" required /></label>
      <button className="button secondary" type="submit">Open file</button>{feedback && <p role="status">{feedback}</p>}
    </form>
    {state.unlocked.includes('case3355') && <CaseFile />}
  </section>;
}

export function About() {
  return <section className="wrap page">
    <PageHeading eyebrow="SE 3355 · Web Programming" title="About the archive." description="An interactive wiki and an original, unofficial How I Met Your Mother mystery." />
    <div className="panel"><Umbrella size={29} /><h2>One show, two ways in.</h2>
      <p>Browse the TVmaze series records or play an original story as one of Ted’s children. Ted narrates the investigation, and your sibling helps you check his version against the evidence.</p>
      <p>This educational fan project is independent of the show’s rights holders. The original mystery, illustrations, and sounds were made for this project.</p>
      <div className="button-row"><Link className="button secondary" to="/sources">Sources and attribution</Link><Link className="button secondary" to="/story">The Play That Never Happened</Link></div>
    </div><Ambiguity />
  </section>;
}
