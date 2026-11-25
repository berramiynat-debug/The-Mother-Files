import { useMemo, useState } from 'react';
import { Clapperboard, Fingerprint, Gamepad2, NotebookPen, Quote, Timer } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Empty, PageHeading, SpoilerLock, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { protectedEpisode, protectedName, quoteIsSafe } from '../services/normalizers/records.js';
import { himymCharacterService } from '../services/providers/himymCharacterService.js';
import { tvmazeService } from '../services/providers/tvmazeService.js';
import { buildQuestions, fold, seededRandom, synopsisClue } from '../features/games/logic.js';
import Quiz from '../features/games/Quiz.jsx';
import Reaction from '../features/games/Reaction.jsx';
import Playbook from '../features/games/Playbook.jsx';

const catalog = [
  ['playbook', NotebookPen, 'The Playbook', 'Barney’s decision game gives you five choices from a night at the booth.'],
  ['narrator', Quote, 'The Unreliable Narrator', 'Figure out who said what before I accidentally give myself credit again.'],
  ['identity', Fingerprint, 'Identity Crisis', 'Match the nicknames to my friends. If in doubt, remember who liked making business cards.'],
  ['episode', Clapperboard, 'Guess the Episode', 'I saved stills from some of our nights. See if you can match ten of them.'],
  ['reaction', Timer, 'Slap Bet', 'Test your reflexes. Your uncle Marshall would like you to read the rules first.'],
];

function EpisodeQuiz() {
  const { state } = useArchive();
  const resource = useResource('episodes', tvmazeService.episodes);
  const [season, setSeason] = useState('');
  const [difficulty, setDifficulty] = useState('Standard');
  const [run, setRun] = useState(() => Math.random());
  const replay = () => setRun(Math.random());
  const questions = useMemo(() => {
    const eligible = (resource.data ?? []).filter((row) => state.spoilers || !protectedEpisode(row));
    const pool = eligible.filter((row) => !season || row.season === Number(season));
    const names = pool.map((row) => row.name);
    return buildQuestions(pool.filter((row) => row.image || row.summary).map((row) => {
      const nearby = pool.filter((candidate) => candidate.season === row.season && candidate.name !== row.name).map((candidate) => candidate.name);
      return {
        answer: row.name, options: nearby.length >= 3 ? nearby : names,
        image: difficulty === 'Challenge' && row.summary ? '' : row.image,
        label: 'TVmaze · Season ' + row.season,
        prompt: row.summary ? synopsisClue(row.summary, [row.name]).slice(0, difficulty === 'Challenge' ? 135 : 265) : 'Which episode is shown in this still?',
        explanation: 'First aired ' + row.date + '.',
      };
    }), 10, seededRandom(run));
  }, [resource.data, state.spoilers, season, difficulty, run]);

  const seasons = [...new Set((resource.data ?? []).filter((row) => state.spoilers || !protectedEpisode(row)).map((row) => row.season))];
  return <><div className="button-row game-filter"><label className="field-label">Season <select value={season} onChange={(event) => { setSeason(event.target.value); replay(); }}>
    <option value="">All available seasons</option>{seasons.map((value) => <option key={value} value={value}>Season {value}</option>)}</select></label>
    <label className="field-label">Difficulty <select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); replay(); }}>
      <option>Standard</option><option>Challenge</option></select></label></div>
    <Status resource={resource}>{questions.length ? <Quiz key={run + ':' + state.spoilers} questions={questions} win="episode" threshold={7} onReplay={replay} />
      : <Empty title="Too few episode clues" />}</Status></>;
}

function IdentityQuiz() {
  const resource = useResource('identities', himymCharacterService.identities);
  const [run, setRun] = useState(() => Math.random());
  const questions = useMemo(() => {
    const rows = (resource.data ?? []).filter((row) => !protectedName(row.name));
    const names = rows.map((row) => row.name);
    const identity = rows.flatMap((row) => row.aliases.filter((alias) =>
      !protectedName(alias) && !names.some((name) => fold(alias).includes(fold(name)))
    ).map((alias) => ({
      answer: row.name, options: names, prompt: 'Who used the alias “' + alias + '”?', label: 'HIMYM Character API',
      memory: alias === 'Swarley' ? 'swarley' : alias === 'Robin Sparkles' ? 'sparkles' : null,
      explanation: alias === 'Swarley' ? 'The coffee cup just made it into the case file.' : '',
    })));
    const swarley = identity.find((row) => row.memory === 'swarley');
    const random = seededRandom(run);
    const extra = buildQuestions(identity.filter((row) => row !== swarley), swarley ? 6 : 7, random);
    return swarley ? [...extra, ...buildQuestions([swarley], 1, random)] : extra;
  }, [resource.data, run]);

  return <Status resource={resource}>{questions.length ? <Quiz key={run} questions={questions} onReplay={() => setRun(Math.random())} /> : <Empty title="No usable aliases recovered" />}</Status>;
}

function Narrator() {
  const { state } = useArchive();
  const canon = useResource('cast', tvmazeService.characters);
  const quotes = useResource('quote-quiz', himymCharacterService.sampleQuotes);
  const [run, setRun] = useState(() => Math.random());
  const names = (canon.data ?? []).filter((row) => !protectedName(row.name) && row.name !== 'Narrator').map((row) => row.name);
  const questions = useMemo(() => {
    const rows = (canon.data ?? []).filter((row) => !protectedName(row.name) && row.name !== 'Narrator');
    const safe = (quotes.data ?? []).filter((row) => quoteIsSafe(row, state.spoilers));
    const speakerClues = safe.flatMap((row) => {
      const matched = rows.find((character) => fold(character.name) === fold(row.author) || fold(character.name.split(' ')[0]) === fold(row.author));
      if (!matched || fold(row.line).includes(fold(matched.name.split(' ')[0]))) return [];
      return [{
        answer: matched.name, options: rows.map((character) => character.name), label: row.source + ' · Who said it?',
        prompt: '“' + row.line + '”', wall: { id: row.id, author: matched.name, season: row.season },
      }];
    });
    return buildQuestions(speakerClues, 7, seededRandom(run));
  }, [canon.data, quotes.data, state.spoilers, run]);
  return <Status resource={canon}><Status resource={quotes}>
    {questions.length >= 5 ? <Quiz key={run + ':' + state.spoilers} questions={questions} win="narrator" threshold={3} onReplay={() => { setRun(Math.random()); quotes.retry(); }} />
      : !state.spoilers ? <SpoilerLock>The Character API omits episode dates. Allow spoilers to play with unclassified lines.</SpoilerLock>
      : <Empty title="More voices needed"><p>{questions.length} playable lines recovered across {names.length} possible speakers. Five distinct lines are required.</p>
        <button className="button secondary" onClick={quotes.retry}>Recover more quotes</button></Empty>}
  </Status></Status>;
}

const screens = { episode: EpisodeQuiz, identity: IdentityQuiz, narrator: Narrator, reaction: Reaction, playbook: Playbook };

export default function Games() {
  const [params] = useSearchParams();
  const game = params.get('game');
  const meta = catalog.find(([id]) => game === id);
  const Screen = Object.hasOwn(screens, game) ? screens[game] : null;
  return <section className="wrap page">
    {meta && <Link className="back-link" to="/games">‹ All games</Link>}
    <PageHeading eyebrow="Archive arcade" title={meta?.[2] ?? 'The game room.'} description={meta?.[3] ?? 'I tried to make a case file with no games in it. I shouldn’t have asked Barney to proofread.'} />
    {!Screen && <p className="mb-5">Looking for the missing Playbook page? <Link className="text-link" to="/story">Play the main mystery</Link>.</p>}
    {Screen ? <Screen key={game} /> : <div className="game-catalog grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {catalog.map(([id, Icon, title, description]) => <Link className="game-tile" key={id} to={'/games?game=' + id}><Icon size={27} /><h2>{title}</h2><p>{description}</p><span><Gamepad2 size={16} /> Play</span></Link>)}
    </div>}
  </section>;
}
