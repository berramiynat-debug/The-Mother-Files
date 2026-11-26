import { useId, useLayoutEffect, useRef, useState } from 'react';
import {
  Armchair, CassetteTape, CircleDot, Disc3, Footprints, GlassWater,
  Leaf, Sandwich, Shirt, Snowflake, Timer, Videotape, X,
} from 'lucide-react';
import { useArchive } from '../../context/archiveContext.js';

const icons = {
  boots: Footprints, burger: Sandwich, baseball: CircleDot, snow: Snowflake, tie: Shirt,
  pineapple: Leaf, disc: Disc3, video: Videotape, cassette: CassetteTape, glass: GlassWater,
  timer: Timer, chair: Armchair,
};

function ArtifactDialog({ artifact, onClose }) {
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const [inspected, setInspected] = useState(false);
  const Icon = icons[artifact.icon];

  useLayoutEffect(() => {
    if (!dialog.current.open) dialog.current.showModal();
  }, []);

  return <dialog ref={dialog} className="wiki-artifact-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
    onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
    <div className="wiki-artifact-content">
      <button type="button" className="icon-button wiki-artifact-close" aria-label="Close" autoFocus onClick={() => dialog.current.close()}><X size={19} aria-hidden="true" /></button>
      <div className="wiki-artifact-emblem" aria-hidden="true"><Icon size={32} strokeWidth={1.6} /></div>
      {artifact.source && <p className="eyebrow">{artifact.source}</p>}
      <h2 id={titleId}>{artifact.title}</h2>
      <p id={descriptionId} className="wiki-artifact-description">{artifact.description}</p>
      {artifact.action && <div className="wiki-artifact-action">
        <button type="button" className="button secondary" aria-expanded={inspected} onClick={() => setInspected(!inspected)}>{artifact.action.label}</button>
        <p role="status" className="wiki-artifact-note">{inspected && artifact.action.note}</p>
      </div>}
    </div>
  </dialog>;
}

export function ArtifactTrigger({ artifact, showLabel = false }) {
  const { state, unlock } = useArchive();
  const [open, setOpen] = useState(false);
  const Icon = icons[artifact.icon];

  return <>
    <button type="button" className={showLabel ? 'button secondary wiki-artifact-trigger' : 'icon-button wiki-artifact-trigger'}
      aria-label={artifact.label} title={artifact.label} aria-haspopup="dialog" data-found={state.unlocked.includes(artifact.id)}
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        setOpen(true);
        unlock(artifact.id);
      }}>
      <Icon size={18} aria-hidden="true" />{showLabel && artifact.label}
    </button>
    {open && <ArtifactDialog artifact={artifact} onClose={() => setOpen(false)} />}
  </>;
}
