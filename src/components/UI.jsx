import { useState } from 'react';
import { FileQuestion, LockKeyhole, LockKeyholeOpen, RotateCw, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';

export function PageHeading({ eyebrow, title, description, children }) {
  return <header className="page-heading">
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="lede">{description}</p>}</div>
    {children}
  </header>;
}

export function Picture({ src, alt = '', className = '', eager = false }) {
  const [broken, setBroken] = useState('');
  return src && broken !== src
    ? <img className={'picture ' + className} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken(src)} />
    : <div className={'picture picture-fallback ' + className} role={alt ? 'img' : undefined} aria-label={alt ? alt + ' unavailable' : undefined}><FileQuestion aria-hidden="true" /></div>;
}

export function Status({ resource, children, label = 'Loading archive records' }) {
  if (resource.loading) return <div role="status" className="skeletons grid gap-4 md:grid-cols-3">
    <span className="sr-only">{label}</span>
    {[0, 1, 2].map((value) => <div key={value} className="skeleton" aria-hidden="true" />)}
  </div>;
  if (resource.error) return <div className="state-panel" role="alert"><p className="eyebrow">{resource.error.source || 'Archive'}</p>
    <h2>Connection interrupted</h2><p>{resource.error.message}</p>
    <button className="button secondary" onClick={resource.retry}><RotateCw size={16} /> Try again</button>
  </div>;
  return children;
}

export function Empty({ title = 'No matching records', children }) {
  return <div className="state-panel"><h2>{title}</h2>{children}</div>;
}

export function SearchField({ value, onChange, placeholder, label = 'Search' }) {
  return <label className="search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">{label}</span>
    <input type="search" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>;
}

export function SpoilerToggle() {
  const { state: { spoilers }, set } = useArchive();
  const Icon = spoilers ? LockKeyholeOpen : LockKeyhole;
  return <button type="button" className="button secondary spoiler-toggle" aria-pressed={spoilers}
    onClick={() => set('spoilers', (enabled) => !enabled)}>
    <Icon size={16} aria-hidden="true" /> Spoilers {spoilers ? 'on' : 'off'}
  </button>;
}

export function SpoilerLock({ children }) {
  const { set } = useArchive();
  return <div className="state-panel"><LockKeyhole aria-hidden="true" /><h2>Under seal</h2>
    <p>{children || 'This file can reveal events from the end of the series.'}</p>
    <button className="button secondary" onClick={() => set('spoilers', true)}>Allow spoilers</button>
  </div>;
}

export function Modal({ title, children, onClose, className = '' }) {
  return <dialog open aria-modal="true" aria-label={title} className={'archive-dialog ' + className} onKeyDown={(event) => {
    if (event.key === 'Escape') onClose();
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])')];
    if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
    if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
  }}>
    <button autoFocus className="icon-button close-dialog" aria-label="Close" onClick={onClose}><X size={20} /></button>
    {children}
  </dialog>;
}

export function BackLink({ to, children }) {
  return <Link className="back-link" to={to}>‹ {children}</Link>;
}
