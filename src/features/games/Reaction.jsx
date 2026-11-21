import { useEffect, useRef, useState } from 'react';
import { useArchive } from '../../context/archiveContext.js';
import { gradeReaction, meterPosition, reactionSettings } from './logic.js';

export default function Reaction() {
  const { unlock, chime } = useArchive();
  const [difficulty, setDifficulty] = useState('Classic');
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState([]);
  const [position, setPosition] = useState(0);
  const start = useRef(0);
  const control = useRef(null);
  const combo = runs.reduce((count, shot) => shot.hit ? count + 1 : 0, 0);
  const limit = 5;
  const finished = runs.length === limit;
  const { speed, target } = reactionSettings[difficulty];
  const center = [.50, .64, .38, .55, .44][runs.length % limit];
  useEffect(() => {
    if (!running) return undefined;
    let frame;
    function animate(timestamp) {
      setPosition(meterPosition(Math.max(0, timestamp - start.current), speed));
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [running, speed]);

  function hit() {
    if (!running) { start.current = performance.now(); setPosition(0); setRunning(true); return; }
    const position = meterPosition(performance.now() - start.current, speed);
    const grade = gradeReaction(position, target, center);
    setPosition(position);
    setRuns([...runs, { ...grade, points: grade.points + (grade.hit ? combo * 15 : 0) }]);
    setRunning(false);
    if (grade.hit) { unlock('reaction'); chime(); }
  }

  return <div className="panel quiz reaction" onKeyDown={(event) => {
    if (event.code === 'Space' && !finished && event.target === event.currentTarget && !event.repeat) { event.preventDefault(); hit(); }
  }} tabIndex={0}>
    <p>Catch the moving marker inside the yellow zone. Use the button, or press Space while the game is focused.</p>
    <label className="field-label">Difficulty <select value={difficulty} disabled={running || (runs.length > 0 && !finished)} onChange={(event) => setDifficulty(event.target.value)}>
      {Object.keys(reactionSettings).map((key) => <option key={key}>{key}</option>)}</select></label>
    <div className="game-stats"><span>{runs.length} / {limit} attempts</span><span>Combo {combo}</span><span>{runs.reduce((sum, shot) => sum + shot.points, 0)} points</span></div>
    <div className="meter" aria-hidden="true"><span className="target" style={{ left: (center - target) * 100 + '%', width: target * 200 + '%' }} /><span className="marker" style={{ left: position * 100 + '%' }} /></div>
    <div className="button-row"><button ref={control} className="button primary" onClick={finished ? () => { setRuns([]); setPosition(0); } : hit}
      onKeyDown={(event) => { if (event.repeat) event.preventDefault(); }}>{finished ? 'Retry' : running ? 'Catch signal' : runs.length ? 'Start next attempt' : 'Start meter'}</button></div>
    <p aria-live="polite">{finished ? 'Round complete. ' : ''}{runs.length > 0 && (runs.at(-1).hit ? 'On target.' : 'Signal missed.')}</p>
  </div>;
}
