import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, PageHeading, SearchField, SpoilerLock, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { himymQuotesService } from '../services/providers/himymQuotesService.js';
import { quoteIsSafe } from '../services/normalizers/records.js';

export default function Quotes() {
  const { state } = useArchive();
  const resource = useResource('quotes', himymQuotesService.recover);
  const [search, setSearch] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [season, setSeason] = useState('');
  const [extra, setExtra] = useState([]);
  const [page, setPage] = useState(2);
  const [canContinue, setCanContinue] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const safe = [...new Map([...(resource.data?.records ?? []), ...extra].map((row) => [row.id, row])).values()]
    .filter((row) => quoteIsSafe(row, state.spoilers));
  const speakers = [...new Set(safe.map((row) => row.author))].sort();
  const seasons = [...new Set(safe.map((row) => row.season).filter(Boolean))].sort((a, b) => a - b);
  const records = safe.filter((row) => (!speaker || row.author === speaker) && (!season || row.season === Number(season))
    && (row.line + ' ' + row.author).toLowerCase().includes(search.trim().toLowerCase()));

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const next = await himymQuotesService.page(page);
      setExtra([...extra, ...next.records]);
      setPage(page + 1);
      setCanContinue(next.next);
    } catch { setError('Could not recover the next archive page. Try again.'); }
    finally { setLoadingMore(false); }
  }

  return <section className="wrap page">
    <PageHeading eyebrow="Audio transcript archive" title="Recovered lines." description="I remember most of the punch lines. Use the transcript to check who actually said them. Season and episode details appear when the source supplies them.">
      <Link className="button secondary" to="/games?game=narrator">Play Quote Detective</Link>
    </PageHeading>
    <Status resource={resource}>
      {!state.spoilers && resource.data?.source === 'HIMYM Character API' ? <SpoilerLock>The backup serves random quotations without episode metadata. Allow spoilers to browse those unclassified lines.</SpoilerLock> : <>
        <div className="filter-bar"><SearchField label="Search quotes" value={search} onChange={setSearch} placeholder="Search recovered lines…" />
          <label><span className="sr-only">Speaker</span><select value={speaker} onChange={(event) => setSpeaker(event.target.value)}><option value="">All speakers</option>
            {speakers.map((author) => <option key={author}>{author}</option>)}</select></label>
          {seasons.length > 0 && <label><span className="sr-only">Quote season</span><select value={season} onChange={(event) => setSeason(event.target.value)}><option value="">All seasons</option>
            {seasons.map((number) => <option value={number} key={number}>Season {number}</option>)}</select></label>}
        </div>
        <p className="credit">Active provider · {resource.data?.source}. {resource.data?.source === 'HIMYM Character API' ? 'The standalone archive is unavailable.' : ''}</p>
        {records.length ? <div className="quote-grid grid md:grid-cols-2 gap-4">{records.map((row) => <figure className="panel" key={row.id}><blockquote>“{row.line}”</blockquote><figcaption>{row.author}{row.season ? ' · Season ' + row.season : ''} · {row.source}</figcaption></figure>)}</div>
          : <Empty title="No lines match these filters"><button className="button secondary" onClick={() => { setSearch(''); setSpeaker(''); setSeason(''); }}>Clear filters</button></Empty>}
        <div className="button-row load-more">
          {resource.data?.source === 'HIMYM Character API' && <button className="button secondary" onClick={resource.retry}>Recover more lines</button>}
          {resource.data?.next && canContinue && <button className="button secondary" disabled={loadingMore} onClick={loadMore}>Load next page</button>}
          {error && <p role="alert">{error}</p>}
        </div>
      </>}
    </Status>
  </section>;
}
