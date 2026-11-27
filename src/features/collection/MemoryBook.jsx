import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight, FileText, LockKeyhole } from 'lucide-react';
import { memories } from '../../data/memories.js';
import './memoryBook.css';

const pageSize = 3;
const pages = Array.from({ length: Math.ceil(memories.length / pageSize) }, (_, index) =>
  memories.slice(index * pageSize, (index + 1) * pageSize));
const turnDuration = 340;
const singlePageQuery = '(max-width: 720px)';
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function subscribeToPageSize(callback) {
  const query = window.matchMedia(singlePageQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

const singlePage = () => window.matchMedia(singlePageQuery).matches;

function MemoryPage({ index, unlocked, side }) {
  return <div className="book-page" data-side={side}>
    <ul className="book-entries">
      {pages[index]?.map(({ id, title, description }) => {
        const found = unlocked.has(id);
        const Icon = found ? FileText : LockKeyhole;
        return <li className="book-entry" data-found={found} key={id}>
          <span className="book-entry-icon"><Icon size={18} aria-hidden="true" /></span>
          <div><h2>{found ? title : 'Sealed memory'}</h2>
            <p>{found ? description : 'Explore the archive to recover this file.'}</p></div>
        </li>;
      })}
    </ul>
    {pages[index] && <span className="book-folio" aria-hidden="true">{index + 1}</span>}
  </div>;
}

export default function MemoryBook({ unlocked }) {
  const narrow = useSyncExternalStore(subscribeToPageSize, singlePage);
  const [anchor, setAnchor] = useState(0);
  const [turn, setTurn] = useState(null);
  const gesture = useRef(null);
  const instructionId = useId();
  const spreadSize = narrow ? 1 : 2;
  const start = anchor - anchor % spreadSize;
  const end = Math.min(start + spreadSize, pages.length);
  const leaf = turn?.start === start && turn.spreadSize === spreadSize ? turn : null;

  useEffect(() => {
    gesture.current = null;
    setTurn(null);
  }, [spreadSize]);

  useEffect(() => {
    if (!leaf || leaf.phase === 'dragging') return;
    const timer = setTimeout(() => {
      if (leaf.commit) setAnchor(leaf.target);
      setTurn(null);
    }, turnDuration);
    return () => clearTimeout(timer);
  }, [leaf]);

  function pageTurn(direction) {
    const target = start + direction * spreadSize;
    if (leaf || target < 0 || target >= pages.length) return null;
    return { start, spreadSize, direction, target };
  }

  function go(direction) {
    const next = pageTurn(direction);
    if (!next || gesture.current?.turn) return;
    if (prefersReducedMotion()) setAnchor(next.target);
    else setTurn({ ...next, progress: 1, phase: 'button', commit: true });
  }

  function pointerDown(event) {
    if (leaf || !event.isPrimary || event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    gesture.current = {
      pointer: event.pointerId, x: event.clientX, y: event.clientY, width: rect.width / spreadSize,
      side: event.clientX < rect.left + rect.width / 2 ? -1 : 1,
      time: event.timeStamp, reduced: prefersReducedMotion(),
    };
  }

  function pointerMove(event) {
    const drag = gesture.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    const x = event.clientX - drag.x;
    if (!drag.turn) {
      const y = event.clientY - drag.y;
      if (Math.max(Math.abs(x), Math.abs(y)) < 8) return;
      const direction = x < 0 ? 1 : -1;
      drag.turn = Math.abs(x) > Math.abs(y) && (narrow || direction === drag.side) ? pageTurn(direction) : null;
      if (!drag.turn) {
        gesture.current = null;
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const distance = Math.max(0, -x * drag.turn.direction);
    if (!drag.reduced) setTurn({ ...drag.turn, progress: Math.min(distance / drag.width, 1), phase: 'dragging' });
  }

  function finishDrag(event, cancelled = false) {
    const drag = gesture.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    gesture.current = null;
    if (!drag.turn) return;
    if (drag.turn.spreadSize !== spreadSize || drag.turn.start !== start) {
      setTurn(null);
      return;
    }
    const distance = Math.max(0, (drag.x - event.clientX) * drag.turn.direction);
    const quickSwipe = distance >= 45 && event.timeStamp - drag.time < 250;
    const commit = !cancelled && (distance >= drag.width * .24 || quickSwipe);
    if (drag.reduced) {
      if (commit) setAnchor(drag.turn.target);
    } else {
      setTurn({ ...drag.turn, progress: commit ? 1 : 0, phase: 'release', commit });
    }
  }

  // The moving leaf reveals the next spread underneath and lands on its other page.
  const turningRightPage = leaf?.direction === 1;
  const frontSide = turningRightPage ? 'right' : 'left';
  const backSide = turningRightPage ? 'left' : 'right';
  const frontIndex = start + (turningRightPage && !narrow ? 1 : 0);
  const backIndex = leaf ? leaf.target + (!turningRightPage && !narrow ? 1 : 0) : start;
  const leftIndex = leaf && (narrow || !turningRightPage) ? leaf.target : start;
  const rightIndex = leaf && turningRightPage ? leaf.target + 1 : start + 1;
  const pageLabel = end === start + 1 ? `Page ${end} of ${pages.length}` : `Pages ${start + 1}–${end} of ${pages.length}`;

  return <section className="memory-book" aria-label="Memory book" aria-describedby={instructionId} tabIndex={0}
    data-layout={narrow ? 'single' : 'spread'} style={{ '--book-turn-duration': turnDuration + 'ms' }}
    onKeyDown={(event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      go(event.key === 'ArrowRight' ? 1 : -1);
    }}>
    <div className="book-cover">
      <div className="book-binding">
        <div className="book-spread" data-turning={Boolean(leaf)} aria-hidden={leaf ? true : undefined}
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={(event) => finishDrag(event)}
          onPointerCancel={(event) => finishDrag(event, true)} onLostPointerCapture={(event) => finishDrag(event, true)}
          onPointerLeave={() => { if (!gesture.current?.turn) gesture.current = null; }}>
          <MemoryPage index={leftIndex} unlocked={unlocked} side={narrow ? 'single' : 'left'} />
          {!narrow && <MemoryPage index={rightIndex} unlocked={unlocked} side="right" />}
          {leaf && <div className="book-leaf" data-direction={turningRightPage ? 'forward' : 'back'} data-phase={leaf.phase}
            style={{ '--book-leaf-angle': -leaf.direction * leaf.progress * (narrow ? 110 : 180) + 'deg' }}>
            <div className="book-leaf-face"><MemoryPage index={frontIndex} unlocked={unlocked} side={narrow ? 'single' : frontSide} /></div>
            {!narrow && <div className="book-leaf-face book-leaf-back"><MemoryPage index={backIndex} unlocked={unlocked} side={backSide} /></div>}
          </div>}
        </div>
      </div>
    </div>
    <div className="book-controls">
      <button type="button" className="button secondary" aria-label="Previous page" aria-disabled={start === 0} onClick={() => go(-1)}>
        <ChevronLeft size={18} aria-hidden="true" /> <span>Previous</span>
      </button>
      <p className="book-page-count" aria-live="polite">{pageLabel}</p>
      <button type="button" className="button secondary" aria-label="Next page" aria-disabled={end >= pages.length} onClick={() => go(1)}>
        <span>Next</span> <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
    <p className="book-instructions" id={instructionId}>Drag or swipe a page to turn it.</p>
  </section>;
}
