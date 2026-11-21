import { Component, lazy } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import ArchiveProvider from './context/ArchiveProvider.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';

const load = (getModule, name) => lazy(async () => ({ default: (await getModule())[name] }));
const wiki = () => import('./pages/Wiki.jsx');
const details = () => import('./pages/Details.jsx');
const extras = () => import('./pages/ArchiveExtras.jsx');
const routes = [
  ['characters', load(wiki, 'Characters')], ['characters/:id', load(details, 'CharacterDetail')],
  ['cast', load(wiki, 'Cast')], ['cast/:id', load(details, 'CastDetail')],
  ['seasons', load(wiki, 'Seasons')], ['seasons/:number', load(details, 'SeasonDetail')],
  ['episodes', load(wiki, 'Episodes')], ['episodes/:id', load(details, 'EpisodeDetail')],
  ['quotes', lazy(() => import('./pages/Quotes.jsx'))], ['pub', lazy(() => import('./pages/Pub.jsx'))],
  ['games', lazy(() => import('./pages/Games.jsx'))], ['story', lazy(() => import('./pages/Story.jsx'))],
  ['evidence', lazy(() => import('./pages/Evidence.jsx'))], ['collection', load(extras, 'Collection')],
  ['sources', load(extras, 'Sources')], ['about', load(extras, 'About')],
];

class ErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <main className="wrap page"><h1>The file could not open</h1><p>Reload the archive to try again.</p><a href="/" className="button primary">Reload archive</a></main>;
    return this.props.children;
  }
}

export default function App() {
  return <ErrorBoundary><BrowserRouter><ArchiveProvider>
    <Routes><Route element={<Layout />}><Route index element={<Home />} />
        {routes.map(([path, Screen]) => <Route key={path} path={path} element={<Screen />} />)}
        <Route path="*" element={<div className="wrap page"><p className="eyebrow">404 · Archive</p><h1>File not found</h1><Link className="button primary" to="/">Back to the archive</Link></div>} />
    </Route></Routes>
  </ArchiveProvider></BrowserRouter></ErrorBoundary>;
}
