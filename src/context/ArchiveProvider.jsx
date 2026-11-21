import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArchiveContext } from './archiveContext.js';
import { memories } from '../data/memories.js';

const storageKey = 'mother-files-v1';
const defaults = { unlocked: [], favorites: [], sound: false, spoilers: false, introSeen: false, story: null, aliases: [], connections: [], wall: [] };
function restore() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    const state = { ...defaults, ...value };
    for (const key of ['unlocked', 'favorites', 'aliases', 'connections', 'wall']) {
      state[key] = Array.isArray(state[key]) ? state[key] : defaults[key];
    }
    for (const key of ['sound', 'spoilers', 'introSeen']) state[key] = state[key] === true;
    return state;
  } catch { return defaults; }
}

export default function ArchiveProvider({ children }) {
  const [state, setState] = useState(restore);
  const [intro, setIntro] = useState(() => !state.introSeen);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef();
  const audio = useRef(null);
  const earned = useRef(new Set(state.unlocked));
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Preferences remain usable in this tab. */ }
  }, [state]);
  useEffect(() => () => {
    clearTimeout(noticeTimer.current);
    audio.current?.close().catch(() => {});
  }, []);

  const set = useCallback((key, value) => {
    setState((prev) => ({ ...prev, [key]: typeof value === 'function' ? value(prev[key]) : value }));
  }, []);
  const unlock = useCallback((id) => {
    const record = memories.find((row) => row.id === id);
    if (!record || earned.current.has(id)) return;
    earned.current.add(id);
    set('unlocked', (previous) => [...previous, id]);
    setNotice('Memory recovered · ' + record.title);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 3600);
  }, [set]);
  const finishIntro = useCallback(() => { set('introSeen', true); setIntro(false); }, [set]);
  const reset = useCallback(() => {
    earned.current.clear();
    setState({ ...defaults, introSeen: true });
    clearTimeout(noticeTimer.current);
    setNotice('');
  }, []);
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
