import { useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';
import './memoryBookCompanion.css';

const corner = { x: 0, y: 1 };
const dragThreshold = 6;
const arrowMoves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
const clamp = (value) => Math.min(1, Math.max(0, value));
const distanceFromStart = (event, drag) => Math.hypot(event.clientX - drag.x, event.clientY - drag.y);

function boundsFor(link) {
  const frame = link.parentElement.getBoundingClientRect();
  return {
    left: frame.left, top: frame.top,
    width: Math.max(1, frame.width - link.offsetWidth),
    height: Math.max(1, frame.height - link.offsetHeight),
  };
}

function pointerPosition(event, drag) {
  const { left, top, width, height } = boundsFor(event.currentTarget);
  return {
    x: clamp((event.clientX - left - drag.offsetX) / width),
    y: clamp((event.clientY - top - drag.offsetY) / height),
  };
}

export default function MemoryBookCompanion() {
  const { state, set } = useArchive();
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const instructionsId = useId();
  const position = preview ?? state.bookPosition ?? corner;

  function save(next) {
    setPreview(next);
    const clearPreview = () => setPreview((current) => current === next ? null : current);
    set('bookPosition', next).then(clearPreview, clearPreview);
  }

  function start(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const { left, top } = event.currentTarget.getBoundingClientRect();
    gesture.current = {
      pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      offsetX: event.clientX - left, offsetY: event.clientY - top, moving: false,
    };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    const drag = gesture.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moving) {
      if (distanceFromStart(event, drag) < dragThreshold) return;
      drag.moving = true;
      suppressClick.current = true;
      setDragging(true);
    }
    setPreview(pointerPosition(event, drag));
  }

  function finish(event, cancelled = false) {
    const drag = gesture.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (!drag.moving) {
      // A captured touch can end without synthesizing a click.
      if (!cancelled && event.pointerType === 'touch' && distanceFromStart(event, drag) < dragThreshold) {
        suppressClick.current = true;
        event.currentTarget.click();
      }
      return;
    }
    setDragging(false);
    if (cancelled) setPreview(null);
    else save(pointerPosition(event, drag));
  }

  function moveByKey(event) {
    const delta = arrowMoves[event.key];
    if (!delta || dragging || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const { width, height } = boundsFor(event.currentTarget);
    save({ x: clamp(position.x + delta[0] * 28 / width), y: clamp(position.y + delta[1] * 28 / height) });
  }

  return <div className="book-companion-dock">
    <NavLink end to="/collection" className="book-companion" draggable={false}
      aria-label="Memory collection" aria-describedby={instructionsId} title="Memory collection · Drag to move"
      style={{ '--companion-x': position.x, '--companion-y': position.y }} data-dragging={dragging}
      onPointerDown={start} onPointerMove={move} onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)}
      onKeyDown={moveByKey}
      onClick={(event) => {
        if (event.detail > 0 && suppressClick.current) {
          event.preventDefault();
          suppressClick.current = false;
        }
      }}>
      <span className="book-companion-tilt"><img src="/playbook.svg" alt="" width="48" height="48" draggable={false} /></span>
    </NavLink>
    <span id={instructionsId} className="sr-only">Drag the book or use the arrow keys to move it.</span>
  </div>;
}
