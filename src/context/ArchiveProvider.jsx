import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArchiveContext } from './archiveContext.js';
import { memories } from '../data/memories.js';
import { archiveLegacyCase } from '../features/story/logic.js';

const storageKey = 'mother-files-v1';
const defaults = { unlocked: [], favorites: [], sound: false, spoilers: false, introSeen: false, story: null, aliases: [], connections: [], wall: [], pubObjects: [] };
function readArchive() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    const state = { ...defaults, ...value };
    for (const key of ['unlocked', 'favorites', 'aliases', 'connections', 'wall', 'pubObjects']) {
      state[key] = Array.isArray(state[key]) ? state[key] : defaults[key];
    }
    state.aliases = state.aliases.filter((alias) => typeof alias === 'string');
    state.wall = state.wall.filter((entry) => entry && typeof entry.author === 'string' &&
      (typeof entry.id === 'string' || Number.isSafeInteger(entry.id)) &&
      (entry.season == null || Number.isFinite(entry.season)));
    for (const key of ['sound', 'spoilers', 'introSeen']) state[key] = state[key] === true;
    return archiveLegacyCase(state);
  } catch { return null; }
}

function addMemory(state, id) {
  if (!id || state.unlocked.includes(id) || !memories.some((memory) => memory.id === id)) return state;
  return { ...state, unlocked: [...state.unlocked, id] };
}

export default function ArchiveProvider({ children }) {
  const [state, setState] = useState(() => readArchive() ?? defaults);
  const [intro, setIntro] = useState(() => !state.introSeen);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef();
  const audio = useRef(null);
  const current = useRef(state);
  const canPersist = useRef(true);
  const publish = useCallback((snapshot) => {
    current.current = snapshot;
    setState(snapshot);
  }, []);

  useEffect(() => {
    function sync(event) {
      if (event.storageArea !== localStorage || (event.key !== storageKey && event.key !== null) || !canPersist.current) return;
      const latest = readArchive();
      if (latest) publish(latest);
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [publish]);
  useEffect(() => () => {
    clearTimeout(noticeTimer.current);
    audio.current?.close().catch(() => {});
  }, []);

  const commit = useCallback((update) => {
    function apply() {
      const previous = (canPersist.current && readArchive()) || current.current;
      const next = update(previous);
      if (next !== previous && canPersist.current) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          canPersist.current = false;
        }
      }
      publish(next);
      const recovered = next.unlocked.find((id) => !previous.unlocked.includes(id));
      const record = recovered && memories.find(({ id }) => id === recovered);
      if (record) {
        setNotice('Memory recovered · ' + record.title);
        clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setNotice(''), 3600);
      }
      return next !== previous;
    }
    // Keep the read, change, and write under one origin-wide lock where supported.
    return navigator.locks ? navigator.locks.request(storageKey, apply) : Promise.resolve(apply());
  }, [publish]);

  const set = useCallback((key, value, { reward } = {}) => commit((previous) => {
    const nextValue = typeof value === 'function' ? value(previous[key], previous) : value;
    return Object.is(nextValue, previous[key]) ? previous : addMemory({ ...previous, [key]: nextValue }, reward);
  }), [commit]);
  const unlock = useCallback((id) => commit((previous) => addMemory(previous, id)), [commit]);
  const finishIntro = useCallback(() => { set('introSeen', true); setIntro(false); }, [set]);
  const reset = useCallback(() => commit(() => ({ ...defaults, introSeen: true })).then(() => {
    clearTimeout(noticeTimer.current);
    setNotice('');
  }), [commit]);
  const chime = useCallback((enabled = state.sound) => {
    if (!enabled || !window.AudioContext) return;
    try {
      const context = audio.current ??= new AudioContext();
      context.resume().catch(() => {});
      [220, 330, 440].forEach((pitch, index) => {
        const at = context.currentTime + index * 0.085;
        const tone = context.createOscillator();
        const volume = context.createGain();
        tone.type = 'sine';
        tone.frequency.value = pitch;
        volume.gain.setValueAtTime(0.0001, at);
        volume.gain.exponentialRampToValueAtTime(0.075, at + 0.035);
        volume.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
        tone.connect(volume).connect(context.destination);
        tone.start(at);
        tone.stop(at + 0.3);
      });
    } catch { /* The archive works with or without audio. */ }
  }, [state.sound]);
  const value = useMemo(() => ({ state, set, intro, setIntro, finishIntro, notice, unlock, reset, chime }),
    [state, set, intro, finishIntro, notice, unlock, reset, chime]);
  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}
