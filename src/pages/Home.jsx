import { BookOpen, Clapperboard, Dice5, Fingerprint, Music, Play, Umbrella, Users, Wine } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SpoilerToggle } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { tvmazeService } from '../services/providers/tvmazeService.js';
import { protectedEpisode } from '../services/normalizers/records.js';
import { casePremise, caseTitle } from '../data/investigation.js';

const entries = [
  ['/characters', Users, 'Characters', 'The friends I trusted with a spare key. Some got one anyway.'],
  ['/seasons', BookOpen, 'The Timeline', 'I put the years in order. That’s where my restraint ended.'],
  ['/episodes', Clapperboard, 'Episodes', 'Find the night you remember. I probably started it twice.'],
  ['/pub', Wine, 'MacLaren’s Pub', 'Our corner booth. Check underneath it before you pull up a chair.'],
  ['/games', Dice5, 'Games', 'I saved the games, too. Your uncle Barney kept score.'],
  ['/evidence', Fingerprint, 'Evidence Board', 'Pin the dates to the board. Somebody in this family should.'],
];

export default function Home() {
  const { unlock, setIntro, state } = useArchive();
  const navigate = useNavigate();
  const seasons = useResource('seasons', tvmazeService.seasons);
  const episodes = useResource('episodes', tvmazeService.episodes);
  const cast = useResource('cast', tvmazeService.characters);
  const show = useResource('show', tvmazeService.show);
  const safeEpisodes = episodes.data?.filter((row) => state.spoilers || !protectedEpisode(row)) ?? [];
  const stats = [
    [seasons, seasons.data?.length, 'Seasons'], [episodes, episodes.data?.length, 'Episodes'],
    [cast, cast.data?.length, 'Listed characters'], [show, show.data?.date?.slice(0, 4), 'Series premiere'],
  ];
  return <>
    <section className="home-hero relative isolate grid">
      <div className="wrap hero-inner">
        <p className="eyebrow hero-label flex items-center gap-2.5"><span /> A How I Met Your Mother fan archive</p>
        <h1>Legen<em>diary</em>!</h1>
        <p className="eyebrow hero-case-title">{caseTitle}</p>
        <p className="hero-copy">{casePremise}</p>
        <div className="hero-actions flex flex-wrap gap-3">
          <Link className="button primary" to="/episodes"><BookOpen size={17} /> Browse the archive</Link>
        </div>
        <button className="replay" onClick={() => setIntro(true)}><Play size={13} fill="currentColor" /> Replay opening sequence</button>
      </div>
      <img className="hero-case-page" src="/fifth-alibi.svg" width="208" height="246" alt="" />
      <button className="umbrella-hotspot" onClick={() => unlock('umbrella')} aria-label="Inspect the yellow umbrella" title="Inspect the umbrella"><Umbrella size={19} /></button>
      <span className="hero-location">MANHATTAN, NY <span /> AFTER MIDNIGHT</span>
    </section>
    <section className="stat-strip" aria-label="Series at a glance">
      <div className="wrap stat-grid grid">{stats.map(([resource, value, label]) => {
        const status = resource.loading ? 'Loading…' : resource.error || value === undefined || value === '' ? 'Unavailable' : '';
        return <div key={label}><strong className={status ? 'stat-status' : undefined}>{status || value}</strong><span>{label}</span></div>;
      })}</div>
    </section>
    <section className="wrap home-archive">
      <div className="section-heading"><div><p className="eyebrow">The archive</p><h2>Explore the files.</h2></div>
        <div className="heading-actions">
          <SpoilerToggle />
          <button className="button secondary" disabled={!safeEpisodes.length} onClick={() => navigate('/episodes/' + safeEpisodes[Math.floor(Math.random() * safeEpisodes.length)].id)}><Dice5 size={17} /> Random episode</button>
        </div>
      </div>
      <p className="series-intro"><strong>{show.data?.name ?? 'How I Met Your Mother'}</strong> is a comedy about Ted Mosby telling his children how he met their mother. The story follows his search for love in New York with his friends Marshall, Lily, Barney and Robin.
        {show.data?.url && <>{' '}<a className="text-link" href={show.data.url}>Series record on TVmaze</a></>}</p>
      <div className="home-index grid sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([url, Icon, title, copy]) => <Link className="flex items-center gap-3.5 p-4" to={url} key={url}><span className="index-icon"><Icon size={21} /></span><div><h3>{title}</h3><p>{copy}</p></div></Link>)}
      </div>
      <div className="home-pub isolate mt-7 grid items-center"><div><p className="eyebrow">Open late</p><h2>Your booth is waiting.</h2><p>We kept receipts, notes and the good booth at MacLaren’s. I only remembered the booth.</p><Link to="/pub" className="button primary">Go to the pub</Link></div></div>
      <button className="quiet-secret" title="Inspect the blue French horn" aria-label="Inspect the blue French horn" onClick={() => unlock('horn')}><Music size={18} aria-hidden="true" /></button>
    </section>
  </>;
}
