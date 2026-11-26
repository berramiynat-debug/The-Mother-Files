import { Heart, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Picture } from '../../components/UI.jsx';
import { useArchive } from '../../context/archiveContext.js';
import { characterArtifacts, episodeArtifacts } from '../../data/wikiArtifacts.js';
import { episodeCode } from '../../services/normalizers/records.js';
import { ArtifactTrigger } from './ArtifactTrigger.jsx';

export function Favorite({ id }) {
  const { state, set } = useArchive();
  const saved = state.favorites.includes(id);
  return <button type="button" className={'icon-button favorite ' + (saved ? 'saved' : '')} aria-pressed={saved} aria-label={saved ? 'Remove favorite' : 'Save favorite'} onClick={() => {
    set('favorites', (current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }}><Heart size={19} fill={saved ? 'currentColor' : 'none'} /></button>;
}

export function EpisodeCard({ row }) {
  const artifact = !row.sealed && episodeArtifacts.get(episodeCode(row));
  return <article className="record-card episode-card">
    <Link to={'/episodes/' + row.id}>
      {row.sealed ? <div className="picture picture-fallback episode-image"><LockKeyhole /></div> : <Picture src={row.image} className="episode-image" />}
      <div className="record-body"><p className="eyebrow">{episodeCode(row)} <span>·</span> {row.date || 'Date unavailable'}</p><h2>{row.name}</h2>
        <p>{row.summary || (row.sealed ? 'Spoiler-protected file.' : 'No synopsis on record.')}</p></div>
    </Link>
    {artifact && <ArtifactTrigger artifact={artifact} />}
    <Favorite id={row.id} />
  </article>;
}

export function PersonCard({ row, mode, image }) {
  const id = mode === 'cast' ? row.actor.id : row.id;
  const first = mode === 'cast' ? row.actor.name : row.name;
  const second = mode === 'cast' ? row.name : row.actor.name;
  const artifact = mode === 'characters' && characterArtifacts.get(row.name);
  return <article className="record-card portrait-card"><Link to={'/' + mode + '/' + id}>
    <Picture src={image} className="portrait-image" />
    <div className="record-body"><h2>{first}</h2><p>{second}</p></div>
  </Link>
    {artifact && <ArtifactTrigger artifact={artifact} />}
  </article>;
}

export function Credit({ row, children }) {
  return <p className="credit">{children || 'Record supplied by ' + row.source}{row.url && <> · <a href={row.url} target="_blank" rel="noreferrer">View original</a></>}</p>;
}
