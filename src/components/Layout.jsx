import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Archive, ChevronDown, Menu, Volume2, VolumeX, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';
import Intro from './Intro.jsx';

const links = [
  ['/', 'Home'], ['/characters', 'Characters'], ['/seasons', 'Seasons'], ['/episodes', 'Episodes'],
  ['/pub', 'The Pub'], ['/games', 'Games'], ['/story', 'The Mystery'],
];
const extras = [['/cast', 'Cast'], ['/quotes', 'Quotes'], ['/evidence', 'Evidence board'], ['/sources', 'Sources'], ['/about', 'About']];

export default function Layout() {
  const { state, set, notice, intro, setIntro, chime } = useArchive();
  const location = useLocation();
  const navigation = useNavigationType();
  const [menuPath, setMenuPath] = useState('');
  const [morePath, setMorePath] = useState('');
  const positions = useRef(new Map());
  const key = location.key;
  const menu = menuPath === key;
  const more = morePath === key;
  useLayoutEffect(() => {
    const record = () => positions.current.set(key, window.scrollY);
    const destination = navigation === 'POP' ? positions.current.get(key) ?? 0 : 0;
    window.scrollTo(0, destination);
    const frame = requestAnimationFrame(() => window.scrollTo(0, destination));
    window.addEventListener('scroll', record, { passive: true });
    return () => { window.removeEventListener('scroll', record); cancelAnimationFrame(frame); };
  }, [key, navigation]);
  useEffect(() => {
    if (!intro) return undefined;
    const previousFocus = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
      if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
      else document.getElementById('main')?.focus({ preventScroll: true });
    };
  }, [intro]);

  return <>
    <div inert={intro ? true : undefined}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="The Pineapple Files home"><img src="/umbrella.svg" alt="" width="40" height="40" /><span>The Pineapple <strong>Files</strong></span></Link>
          <nav className={'main-nav ' + (menu ? 'is-open' : '')} aria-label="Main navigation">
            {links.map(([url, name]) => <NavLink end={url === '/'} to={url} key={url}>{name}</NavLink>)}
            <div className="nav-more" onKeyDown={(event) => { if (event.key === 'Escape') { setMorePath(''); event.currentTarget.querySelector('button').focus(); } }}>
              <button type="button" aria-expanded={more} onClick={() => setMorePath(more ? '' : key)}>More <ChevronDown size={13} /></button>
              {more && <div className="nav-dropdown">{extras.map(([url, name]) => <NavLink key={url} to={url}>{name}</NavLink>)}</div>}
            </div>
          </nav>
          <div className="nav-actions">
            <NavLink to="/collection" className="icon-button" aria-label="Memory collection" title="Memory collection"><Archive size={18} /></NavLink>
            <button className="icon-button sound-toggle" aria-label={state.sound ? 'Mute sound' : 'Enable sound'} title="Sound preference" onClick={() => { set('sound', !state.sound); chime(!state.sound); }}>{state.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            <button className="icon-button hamburger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => { setMenuPath(menu ? '' : key); setMorePath(''); }}>{menu ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}><Suspense fallback={<div className="wrap page" role="status">Opening file…</div>}><Outlet /></Suspense></main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div><Link to="/" className="brand"><img src="/umbrella.svg" alt="" width="33" height="33" /> The Pineapple Files</Link><p>An unofficial How I Met Your Mother fan archive.</p></div>
          <nav aria-label="Footer links">
            <button onClick={() => set('spoilers', !state.spoilers)} aria-pressed={state.spoilers}>Spoilers {state.spoilers ? 'on' : 'off'}</button>
            <button onClick={() => setIntro(true)}>Replay intro</button>
            <Link to="/sources">Sources &amp; credits</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
      </footer>
    </div>
    {intro && <Intro />}
    {notice && <div className={location.pathname === '/story' ? 'sr-only' : 'toast'} role="status"><Archive size={19} /> {notice}</div>}
  </>;
}
