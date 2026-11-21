import { BookOpen, Clapperboard, Dice5, Fingerprint, Play, Umbrella, Users, Wine } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { tvmazeService } from '../services/providers/tvmazeService.js';
import { protectedEpisode } from '../services/normalizers/records.js';

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
  const regulars = cast.data?.filter((row) => !/narrator|the mother/i.test(row.name));
  const stats = [
    [seasons.data?.length, 'Seasons'], [episodes.data?.length, 'Episodes'], [regulars?.length, 'Main characters'],
    [show.data?.date?.slice(0, 4), 'Series premiere'],
  ];
  return <>
    <section className="home-hero">
      <div className="wrap hero-inner">
        <p className="eyebrow hero-label"><span /> A How I Met Your Mother fan archive</p>
        <h1>The Mother<br /><em>Files.</em></h1>
        <p className="hero-copy">Kids, somebody changed my story. A photo’s gone, the yellow umbrella is missing, and for once I’d like you two to skip ahead.</p>
        <div className="hero-actions flex flex-wrap gap-3">
          <Link className="button primary" to="/story"><Fingerprint size={18} /> Start the investigation</Link>
          <Link className="button hero-outline" to="/episodes"><BookOpen size={17} /> Browse the archive</Link>
        </div>
        <button className="replay" onClick={() => setIntro(true)}><Play size={13} fill="currentColor" /> Replay opening sequence</button>
      </div>
      <button className="umbrella-hotspot" onClick={() => unlock('umbrella')} aria-label="Inspect the yellow umbrella" title="Inspect the umbrella"><Umbrella size={19} /></button>
      <span className="hero-location">MANHATTAN, NY <span /> AFTER MIDNIGHT</span>
    </section>
    <section className="stat-strip" aria-label="Series at a glance">
      <div className="wrap stat-grid">{stats.map(([value, label]) => <div key={label}><strong>{value ?? '—'}</strong><span>{label}</span></div>)}</div>
    </section>
    <section className="wrap home-archive">
      <div className="section-heading"><div><p className="eyebrow">The archive</p><h2>Explore the files.</h2></div>
        <button className="button secondary" disabled={!safeEpisodes.length} onClick={() => navigate('/episodes/' + safeEpisodes[Math.floor(Math.random() * safeEpisodes.length)].id)}><Dice5 size={17} /> Random episode</button>
      </div>
      <div className="home-index grid sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([url, Icon, title, copy]) => <Link to={url} key={url}><span className="index-icon"><Icon size={21} /></span><div><h3>{title}</h3><p>{copy}</p></div></Link>)}
      </div>
      <div className="home-pub"><div><p className="eyebrow">Open late</p><h2>Your booth is waiting.</h2><p>I used to leave notes in that booth. An envelope was a little formal, even for me.</p><Link to="/pub" className="button primary">Go to the pub</Link></div></div>
      <button className="quiet-secret" title="Inspect the blue French horn" aria-label="Inspect the blue French horn" onClick={() => unlock('horn')}>♫</button>
    </section>
  </>;
}
