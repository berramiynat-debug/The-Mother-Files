import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Picture } from '../../components/UI.jsx';
import { useArchive } from '../../context/archiveContext.js';

export default function Quiz({ questions, win, threshold, onReplay }) {
  const { unlock, chime, set } = useArchive();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answer, setAnswer] = useState('');
  const row = questions[round];

  function submit(option) {
    if (answer) return;
    setAnswer(option);
    const correct = option === row.answer;
    if (!correct) { setStreak(0); return; }
    setScore(score + 1);
    setStreak(streak + 1);
    setBest(Math.max(best, streak + 1));
    chime();
    if (row.memory) unlock(row.memory);
    if (row.wall) set('wall', (items) => items.some((item) => item.id === row.wall.id) ? items : [...items, row.wall]);
    if (win && score + 1 >= threshold) unlock(win);
  }

  if (!row) return <div className="game-result panel"><p className="eyebrow">Report filed</p><h2>{score} / {questions.length} correct</h2><p>Best streak · {best}</p>
    <div className="button-row"><button className="button primary" onClick={onReplay}>Play again</button><Link className="button secondary" to="/collection">Memory collection</Link></div>
  </div>;

  return <div className="panel quiz">
    <div className="game-stats"><span>Round {round + 1} / {questions.length}</span><span>Score {score}</span><span>Streak {streak}</span></div>
    <progress aria-label="Quiz progress" value={round + (answer ? 1 : 0)} max={questions.length} />
    <p className="eyebrow">{row.label}</p>
    {row.image && <Picture src={row.image} className="clue-image" />}
    <h2>{row.prompt}</h2>
    <div className="choice-grid">{row.options.map((option) => <button className={'choice ' + (answer && option === row.answer ? 'correct' : answer === option ? 'incorrect' : '')}
      key={option} disabled={Boolean(answer)} onClick={() => submit(option)}>{option}</button>)}</div>
    {answer && <div className="feedback" aria-live="polite"><p>{answer === row.answer ? 'Correct.' : 'The archive recorded ' + row.answer + '.'} {row.explanation}</p>
      <button autoFocus className="button primary" onClick={() => { setAnswer(''); setRound(round + 1); }}>{round + 1 >= questions.length ? 'See results' : 'Next round'}</button></div>}
  </div>;
}
