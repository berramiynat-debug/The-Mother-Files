import { useState } from 'react';
import { plays, playEnding } from '../../data/playbook.js';
import { useArchive } from '../../context/archiveContext.js';

export default function Playbook() {
  const { unlock, chime } = useArchive();
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState({ heart: 0, flair: 0 });
  const [reply, setReply] = useState('');
  const play = plays[round];
  const [ending, description] = playEnding(scores);
  if (!play) return <div className="panel game-result"><p className="eyebrow">Closing time</p><h2>{ending}</h2><p>{description}</p>
    <p>Heart {scores.heart} · Flair {scores.flair}</p>
    <button className="button primary" onClick={() => { setRound(0); setReply(''); setScores({ heart: 0, flair: 0 }); }}>Replay the Playbook</button></div>;

  return <div className="panel quiz">
    <div className="game-stats"><span>Decision {round + 1} / {plays.length}</span><span>Heart {scores.heart}</span><span>Flair {scores.flair}</span></div>
    <progress aria-label="Playbook progress" value={round + (reply ? 1 : 0)} max={plays.length} />
    <h2>{play.title}</h2><p>{play.line}</p>
    <div className="choice-grid">{play.choices.map((choice) => <button key={choice.label} className="choice" disabled={Boolean(reply)} onClick={() => {
      setScores({ heart: scores.heart + choice.heart, flair: scores.flair + choice.flair });
      setReply(choice.text);
    }}>{choice.label}</button>)}</div>
    {reply && <div className="feedback" aria-live="polite"><p>{reply}</p><button autoFocus className="button primary" onClick={() => {
      if (round === plays.length - 1) { unlock('playbook'); chime(); }
      setRound(round + 1);
      setReply('');
    }}>{round === plays.length - 1 ? 'Read your ending' : 'Continue'}</button></div>}
  </div>;
}
