import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Encyclopedia from './Encyclopedia';
import type { DrillQuestion } from './domain/drills';
import { createMemoryDeck, type MemoryCard, type PairCount } from './domain/memory';
import { createRun, isCorrect, stages, type Question, type StageId } from './domain/quiz';
import { clearRecords, loadData, saveData, type SavedData } from './domain/storage';
import { tileById, tileUrl, tiles, type Tile, type TileId } from './domain/tiles';
import { ThemeContext } from './theme';
import { childStages, questionForStyle } from './data/learningCopy';

type Screen = 'home' | 'stages' | 'quiz' | 'result' | 'memory' | 'guide' | 'encyclopedia' | 'records' | 'settings';
type Feedback = 'correct' | 'wrong' | 'revealed' | null;
type AppHistory = { session: string; screen: Screen; from: Screen | null };

const screens: Screen[] = ['home', 'stages', 'quiz', 'result', 'memory', 'guide', 'encyclopedia', 'records', 'settings'];

function appHistory(value: unknown): AppHistory | null {
  if (!value || typeof value !== 'object' || !('mahjongLearning' in value)) return null;
  const entry = value.mahjongLearning;
  if (!entry || typeof entry !== 'object' || !('session' in entry) || !('screen' in entry) || !('from' in entry)) return null;
  return typeof entry.session === 'string' && screens.includes(entry.screen as Screen) && (entry.from === null || screens.includes(entry.from as Screen)) ? entry as AppHistory : null;
}

const readings: Record<string, string> = {
  萬子: 'マンズ', 筒子: 'ピンズ', 索子: 'ソーズ', 字牌: 'ジハイ',
  雀頭: 'ジャントウ', 刻子: 'コーツ', 順子: 'シュンツ',
  東: 'トン', 南: 'ナン', 西: 'シャー', 北: 'ペー', 白: 'ハク', 發: 'ハツ', 中: 'チュン',
};

function Term({ text, enabled }: { text: string; enabled: boolean }) {
  return enabled && readings[text] ? <ruby>{text}<rt>{readings[text]}</rt></ruby> : <>{text}</>;
}

function ReadingText({ text, enabled }: { text: string; enabled: boolean }) {
  return <>{text.split(/(萬子|筒子|索子|字牌|雀頭|刻子|順子)/g).map((part, index) => <Term key={`${part}-${index}`} text={part} enabled={enabled} />)}</>;
}

function TileImage({ tile, helperNumber = false, celebrate = false, className = '' }: { tile: Tile; helperNumber?: boolean; celebrate?: boolean; className?: string }) {
  const theme = useContext(ThemeContext);
  return <span className={`tile-wrap ${className}`}>
    <img className="tile-image" src={tileUrl(tile, theme === 'black' ? 'Black' : 'Regular')} alt={tile.label} />
    {helperNumber && tile.number && <span className="tile-number" aria-hidden="true">{tile.number}</span>}
    {celebrate && <svg className="tile-success-ring" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="65" rx="47" ry="60" /></svg>}
  </span>;
}

function TileReading({ tile, enabled }: { tile: Tile; enabled: boolean }) {
  return enabled ? <span className="tile-reading">{tile.reading}</span> : null;
}

function Button({ children, onClick, secondary = false, disabled = false }: { children: React.ReactNode; onClick: () => void; secondary?: boolean; disabled?: boolean }) {
  return <button className={`button ${secondary ? 'button-secondary' : 'button-primary'}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function UkeireDiagram({ question, helperNumbers, childCopy }: { question: DrillQuestion; helperNumbers: boolean; childCopy: boolean }) {
  if (!question.comparison) return null;
  const best = question.comparison.filter(row => question.accepted.includes(row.discard));
  const others = question.comparison.filter(row => !question.accepted.includes(row.discard));
  function rowView(row: NonNullable<DrillQuestion['comparison']>[number]) {
    const correct = question.accepted.includes(row.discard);
    return <div className={`ukeire-row ${correct ? 'ukeire-best' : ''}`} key={row.discard}>
      <div className="ukeire-heading"><span className="ukeire-discard"><TileImage tile={tileById[row.discard]} helperNumber={helperNumbers} /><span>{childCopy ? 'を捨てる' : 'を切る'}</span></span><strong>{correct ? '正解 · ' : ''}合計 {row.copies}枚</strong></div>
      <p className="ukeire-label">{childCopy ? '次に引くと「あと1枚で完成」の形へ進める牌 ↓' : '次に引くとテンパイへ進める牌 ↓'}</p>
      <div className="ukeire-tiles">{row.tiles.map(tile => <div key={tile.id}><TileImage tile={tileById[tile.id]} helperNumber={helperNumbers} /><span>残り{tile.copies}枚</span></div>)}</div>
    </div>;
  }
  return <section className="ukeire-diagram" aria-label={childCopy ? '捨てる牌ごとに、手を進められる牌の残り枚数を比較' : '打牌ごとの受け入れ牌と残り枚数'}><h2>{childCopy ? '次に手を進められる牌を比べる' : '牌で比べる受け入れ'}</h2>{best.map(rowView)}{others.length > 0 && <details><summary>{childCopy ? 'ほかの捨て方' : 'ほかの打牌'}と比べる（{others.length}候補）</summary>{others.map(rowView)}</details>}</section>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [data, setData] = useState<SavedData>(loadData);
  const childCopy = data.settings.explanationStyle === 'child';
  const displayStages = stages.map(item => childCopy ? { ...item, ...childStages[item.id] } : item);
  const [category, setCategory] = useState(0);
  const categories = [
    { title: '牌を覚える', ids: [1, 2, 4, 7], description: '図柄・数字・読み方の基礎から。' },
    { title: '形を覚える', ids: [5, 6], description: childCopy ? '同じ牌のペアや3枚の組、あと1枚で組になる形。' : '雀頭・刻子・順子と、あと1枚で完成する形。' },
    { title: '待ち・何切る', ids: [9, 10, 12], description: childCopy ? '完成に必要な牌や、捨てる牌を考える練習。' : '待ちを見つけ、テンパイにする打牌を練習。' },
  ];
  const [stage, setStage] = useState<StageId>(1);
  const [questions, setQuestions] = useState<Question[]>(() => createRun(1));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [firstTryScore, setFirstTryScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const questionStartedAt = useRef(Date.now());
  const [pairCount, setPairCount] = useState<PairCount>(12);
  const [compactMemory, setCompactMemory] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 520px)').matches);
  const [deck, setDeck] = useState<MemoryCard[]>(() => createMemoryDeck(12));
  const [turns, setTurns] = useState(0);
  const [memoryBusy, setMemoryBusy] = useState(false);
  const memoryRun = useRef(0);
  const [guideFamily, setGuideFamily] = useState<Tile['family']>('萬子');
  const [dictionaryReturn, setDictionaryReturn] = useState<Screen>('home');
  const [resetOpen, setResetOpen] = useState(false);
  const historySession = useRef(`${Date.now()}-${Math.random()}`);
  const question = useMemo(() => questionForStyle(questions[questionIndex], data.settings.explanationStyle), [questions, questionIndex, data.settings.explanationStyle]);
  const memoryOptions: PairCount[] = compactMemory ? [6, 12] : [6, 12, 26];
  const resolved = feedback === 'correct' || feedback === 'revealed';
  const selectionLimit = Array.isArray(question.answer) ? question.answer.length : 1;

  useEffect(() => saveData(data), [data]);
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', data.settings.theme === 'black' ? '#1f1f1e' : '#14524a');
  }, [data.settings.theme]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, questionIndex]);
  useEffect(() => {
    const session = historySession.current;
    window.history.replaceState({ ...window.history.state, mahjongLearning: { session, screen: 'home', from: null } }, '');
    const restore = (event: PopStateEvent) => {
      const entry = appHistory(event.state);
      const destination = entry?.session === session ? entry.screen : 'home';
      memoryRun.current += 1;
      setResetOpen(false);
      setDictionaryReturn(entry?.session === session && entry.from ? entry.from : 'home');
      setScreen(destination);
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 520px)');
    const update = () => setCompactMemory(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!compactMemory || pairCount !== 26) return;
    memoryRun.current += 1;
    setPairCount(12);
    setDeck(createMemoryDeck(12));
    setTurns(0);
    setMemoryBusy(false);
  }, [compactMemory, pairCount]);
  useEffect(() => {
    if (screen !== 'quiz' || !data.settings.showTime || resolved) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - questionStartedAt.current) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [screen, questionIndex, data.settings.showTime, feedback, resolved]);

  function showScreen(destination: Screen, replace = false) {
    if (screen === destination) return;
    const previous = appHistory(window.history.state);
    const from = replace && previous?.session === historySession.current ? previous.from : screen;
    const state = { ...window.history.state, mahjongLearning: { session: historySession.current, screen: destination, from } };
    if (replace) window.history.replaceState(state, '');
    else window.history.pushState(state, '');
    setScreen(destination);
  }

  function backTo(destination: Screen) {
    const current = appHistory(window.history.state);
    if (current?.session === historySession.current && current.from === destination) {
      window.history.back();
    } else {
      showScreen(destination, true);
    }
  }

  function startStage(id: StageId) {
    setStage(id);
    setQuestions(createRun(id));
    setQuestionIndex(0);
    setFirstTryScore(0);
    setFirstTry(true);
    setSelected([]);
    setFeedback(null);
    setHintOpen(false);
    questionStartedAt.current = Date.now();
    setElapsedSeconds(0);
    setData(current => ({ ...current, stages: { ...current.stages, [id]: { ...current.stages[id], attempts: current.stages[id].attempts + 1 } } }));
    showScreen('quiz', screen === 'result');
  }

  function choose(index: number) {
    if (resolved) return;
    if (selectionLimit > 1) {
      setSelected(current => current.includes(index)
        ? current.filter(item => item !== index)
        : [...current, index].slice(-selectionLimit));
    } else {
      setSelected([index]);
    }
    if (feedback === 'wrong') setFeedback(null);
  }

  function answer() {
    const values = selected.map(index => question.choices[index]);
    if (isCorrect(question, values)) {
      setFeedback('correct');
      if (firstTry) setFirstTryScore(current => current + 1);
    } else {
      setFeedback('wrong');
      setFirstTry(false);
    }
  }

  function revealAnswer() {
    const answers = question.kind === 'drill' ? [question.accepted[0]] : Array.isArray(question.answer) ? question.answer : [question.answer];
    const indices: number[] = [];
    for (const answer of answers) {
      const index = question.choices.findIndex((choice, i) => choice === answer && !indices.includes(i));
      if (index >= 0) indices.push(index);
    }
    setSelected(indices);
    setFirstTry(false);
    setFeedback('revealed');
    setHintOpen(false);
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      setData(current => ({ ...current, stages: { ...current.stages, [stage]: {
        ...current.stages[stage],
        completed: current.stages[stage].completed + 1,
        bestFirstTry: Math.max(current.stages[stage].bestFirstTry, firstTryScore),
      } } }));
      showScreen('result', true);
      return;
    }
    setQuestionIndex(current => current + 1);
    setFirstTry(true);
    setSelected([]);
    setFeedback(null);
    setHintOpen(false);
    questionStartedAt.current = Date.now();
    setElapsedSeconds(0);
  }

  function startMemory(count: PairCount = pairCount) {
    const availableCount = compactMemory && count === 26 ? 12 : count;
    memoryRun.current += 1;
    setPairCount(availableCount);
    setDeck(createMemoryDeck(availableCount));
    setTurns(0);
    setMemoryBusy(false);
    showScreen('memory');
  }

  function flipCard(key: string) {
    if (memoryBusy) return;
    const card = deck.find(item => item.key === key);
    if (!card || card.matched || card.faceUp) return;
    const next = deck.map(item => item.key === key ? { ...item, faceUp: true } : item);
    setDeck(next);
    const visible = next.filter(item => item.faceUp && !item.matched);
    if (visible.length !== 2) return;
    setTurns(current => current + 1);
    if (visible[0].tile === visible[1].tile) {
      setDeck(next.map(item => visible.some(open => open.key === item.key) ? { ...item, matched: true } : item));
    } else {
      setMemoryBusy(true);
      const run = memoryRun.current;
      window.setTimeout(() => {
        if (memoryRun.current !== run) return;
        setDeck(current => current.map(item => visible.some(open => open.key === item.key) ? { ...item, faceUp: false } : item));
        setMemoryBusy(false);
      }, 800);
    }
  }

  function navigate(destination: Screen) {
    if (screen === 'memory') memoryRun.current += 1;
    if (destination === 'encyclopedia') setDictionaryReturn(screen);
    setResetOpen(false);
    showScreen(destination);
  }

  const stageTitle = displayStages.find(item => item.id === stage)?.title ?? '';
  const familyTabs = ['萬子', '筒子', '索子', '字牌'] as const;
  const memoryComplete = deck.every(card => card.matched);

  return <ThemeContext.Provider value={data.settings.theme}><div className="app-shell" data-theme={data.settings.theme}>
    <header className={`topbar ${screen === 'home' ? 'topbar-home' : ''}`}>
      {screen !== 'home' ? <button className="plain-button" onClick={() => backTo(screen === 'encyclopedia' ? dictionaryReturn : screen === 'quiz' || screen === 'result' ? 'stages' : 'home')}>‹ 戻る</button> : <span />}
      <span className="topbar-title"><ReadingText text={screen === 'home' ? '' : screen === 'stages' ? 'ステージ選択' : screen === 'quiz' ? stageTitle : screen === 'result' ? 'ステージ結果' : screen === 'memory' ? '神経衰弱' : screen === 'guide' ? '牌一覧' : screen === 'encyclopedia' ? '麻雀辞典' : screen === 'records' ? '成績' : '設定'} enabled={data.settings.furigana} /></span>
      {screen === 'home' ? <button className="plain-button" onClick={() => navigate('settings')}><span className="gear-icon" aria-hidden="true">⚙</span>設定</button> : <span />}
    </header>

    <main className={`main-content ${screen === 'home' ? 'home-content' : ''}`}>
      {screen === 'home' && <>
        <div className="hero-tiles" aria-hidden="true">
          {(['man1', 'east', 'red'] as TileId[]).map(id => <TileImage key={id} tile={tileById[id]} />)}
        </div>
        <h1>麻雀を学ぶ</h1>
        <p className="home-subtitle">牌の種類と組み合わせを、遊びながら覚える。</p>
        <p className="eyebrow">MAHJONG LEARNING</p>
        <div className="home-primary"><Button onClick={() => navigate('stages')}>学習を始める　→</Button></div>
        <div className="home-menu">
          <p className="section-caption">その他のメニュー</p>
          <div className="menu-grid">
            <button onClick={() => startMemory()}><span>神経衰弱</span></button>
            <button onClick={() => navigate('guide')}><span>牌一覧</span></button>
            <button onClick={() => navigate('encyclopedia')}><span>麻雀辞典</span></button>
            <button onClick={() => navigate('records')}><span>成績</span></button>
          </div>
        </div>
      </>}

      {screen === 'stages' && <section className="page-section">
        <p className="eyebrow">STAGE SELECT</p>
        <h1>学ぶ内容を選ぶ</h1>
        <p className="muted">好きなステージから始められます。</p>
        <div className="category-tabs" aria-label="学習カテゴリ">{categories.map((item, index) => <button key={item.title} aria-pressed={category === index} className={category === index ? 'active' : ''} onClick={() => setCategory(index)}>{item.title}<small>{item.ids.length}レッスン</small></button>)}</div>
        <p className="category-description">{categories[category].description}</p>
        <div className="stage-list">{displayStages.filter(item => categories[category].ids.includes(item.id)).map((item, index) => <button className="stage-card" key={item.id} onClick={() => startStage(item.id)}>
          <span className="stage-number">{index + 1}</span>
          <span className="stage-info"><strong><ReadingText text={item.title} enabled={data.settings.furigana} /></strong><small><ReadingText text={item.summary} enabled={data.settings.furigana} /></small></span>
          <span className="stage-record">{data.stages[item.id].bestFirstTry ? `${data.stages[item.id].bestFirstTry}/5` : '—'}</span>
        </button>)}</div>
      </section>}

      {screen === 'quiz' && <section className="page-section quiz-section">
        <div className="quiz-heading-row">
          <div className="progress-label">{stageTitle} ・ {questionIndex + 1}/5 {data.settings.showTime && <span>・ {elapsedSeconds}秒</span>}</div>
          <button className="dictionary-inline-link" onClick={() => navigate('encyclopedia')}>用語・役を辞典で見る</button>
        </div>
        <div className="progress-dots" aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <span key={index} className={index <= questionIndex ? 'active' : ''} />)}</div>
        <h1><ReadingText text={question.kind === 'family' ? 'この牌の種類は？' : question.kind === 'number' ? 'この牌の数字は？' : question.kind === 'reading' ? 'この牌の読みは？' : question.prompt} enabled={data.settings.furigana} /></h1>
        {'tile' in question && <>
          <div className="question-tile">
            <TileImage tile={tileById[question.tile]} helperNumber={data.settings.helperNumbers} celebrate={feedback === 'correct'} />
            <div className="question-tile-name" aria-live="polite">{feedback === 'correct' && <TileReading tile={tileById[question.tile]} enabled={data.settings.furigana} />}</div>
          </div>
        </>}
        {question.kind === 'completeMeld' && <div className="question-pair" role="group" aria-label="組を作る2枚の牌">
          {question.pair.map((id, index) => <div className="question-pair-tile" key={`${id}-${index}`}><TileImage tile={tileById[id]} helperNumber={data.settings.helperNumbers} /><TileReading tile={tileById[id]} enabled={data.settings.furigana} /></div>)}
          <span className="question-pair-plus" aria-hidden="true">＋ ?</span>
        </div>}
        {question.kind === 'drill' && <>
          <p className="drill-note">{question.note}</p>
          <div className="hand-tiles" role="group" aria-label={`${question.hand.length}枚の手牌`}>{question.hand.map((id, index) => <TileImage key={`${id}-${index}`} tile={tileById[id]} helperNumber={data.settings.helperNumbers} />)}</div>
        </>}
        <div className="quiz-prompt-row">
          <p className="section-caption">{question.kind === 'group' ? `${question.answer.length}枚選択してください` : question.kind === 'completeMeld' ? `組を作れる牌を${question.answer.length}種類すべて選んでください` : '答えを選択してください'}</p>
          <button className="reveal-button" disabled={resolved} onClick={revealAnswer}>答えを見る・スキップ</button>
        </div>
        {selectionLimit > 1 && <p className="selection-help">選択中：{selected.length} / {selectionLimit}　選んだ牌はもう一度押すと解除できます。<br />{selectionLimit}つ選んだあとに別の牌を押すと、先に選んだ牌から入れ替わります。</p>}
        <div className={question.kind === 'drill' ? `drill-options ${question.topic >= 10 ? 'discard-options' : ''}` : question.kind === 'group' ? 'tile-options' : question.kind === 'tileFromReading' || question.kind === 'completeMeld' ? 'tile-options tile-options-four' : 'text-options'}>
          {question.choices.map((choice, index) => <button key={`${choice}-${index}`} className={`option ${selected.includes(index) ? 'selected' : ''} ${resolved && question.kind === 'drill' && question.accepted.includes(choice) ? 'correct-option' : ''}`} onClick={() => choose(index)} aria-pressed={selected.includes(index)}>
            {question.kind === 'drill' ? <span className="drill-choice">{question.choiceTiles[index].length ? question.choiceTiles[index].map((id, i) => <TileImage key={`${id}-${i}`} tile={tileById[id]} helperNumber={data.settings.helperNumbers} />) : choice}</span> : question.kind === 'group' || question.kind === 'tileFromReading' || question.kind === 'completeMeld' ? <span className="tile-option-content"><TileImage tile={tileById[choice as TileId]} helperNumber={data.settings.helperNumbers} celebrate={feedback === 'correct' && selected.includes(index)} />{(question.kind === 'group' || question.kind === 'completeMeld') && <TileReading tile={tileById[choice as TileId]} enabled={data.settings.furigana} />}</span> : <Term text={choice} enabled={data.settings.furigana} />}
            {question.kind === 'drill' && question.topic >= 10 && <span className="answer-badge">{resolved && question.accepted.includes(choice) ? '正解' : ' '}</span>}
          </button>)}
        </div>
        <div className="quiz-actions">
          {question.hint && <Button secondary disabled={resolved} onClick={() => setHintOpen(value => !value)}>ヒント</Button>}
          {resolved ? <Button onClick={nextQuestion}>{questionIndex === questions.length - 1 ? '結果を見る' : '次の問題へ'}　→</Button> : <Button onClick={answer} disabled={selected.length !== selectionLimit}>回答する</Button>}
        </div>
        {question.kind === 'drill' && resolved && question.example && <div className="answer-example"><p>{question.example.label}</p><div className="example-groups">{question.example.groups.map((group, index) => <div key={index}>{group.map((id, i) => <TileImage key={`${id}-${i}`} tile={tileById[id]} helperNumber={data.settings.helperNumbers} />)}</div>)}</div></div>}
        {hintOpen && !resolved && question.hint && <div className="hint">{question.hint}</div>}
        {feedback && <div className={`feedback ${feedback}`} role="status"><strong>{feedback === 'correct' ? '正解' : feedback === 'revealed' ? '答えを確認（正解数には含めません）' : 'もう一度選んでください'}</strong>{resolved && <p><ReadingText text={question.explanation} enabled={data.settings.furigana} /></p>}</div>}
        {resolved && question.kind === 'drill' && <UkeireDiagram question={question} helperNumbers={data.settings.helperNumbers} childCopy={childCopy} />}
      </section>}

      {screen === 'result' && <section className="page-section result-section">
        <p className="eyebrow">STAGE COMPLETE</p><h1>ステージ完了</h1>
        <div className="result-score"><strong>{firstTryScore} / 5</strong><span>最初の回答で正解した数</span></div>
        <div className="info-panel"><strong>今回学んだ内容</strong><p>{stageTitle}</p></div>
        <Button onClick={() => startStage(stage)}>もう5問練習する</Button>
        <Button secondary onClick={() => backTo('stages')}>ステージ選択に戻る</Button>
      </section>}

      {screen === 'memory' && <section className={`page-section memory-section memory-section-${pairCount}`}>
        <h1>{memoryComplete ? 'すべてそろいました' : '同じ牌をそろえる'}</h1>
        <p className="muted">時間制限はありません。</p>
        <div className="memory-toolbar"><span>枚数を選ぶ</span><div className={`memory-levels ${compactMemory ? 'compact' : ''}`}>{memoryOptions.map(count => <button key={count} className={pairCount === count ? 'active' : ''} aria-pressed={pairCount === count} onClick={() => startMemory(count)}><strong>{count === 26 ? '最大' : `${count}組`}</strong><small>{count * 2}枚</small></button>)}</div>{compactMemory && <p className="memory-mobile-note">スマホでは24枚まで遊べます。</p>}</div>
        {pairCount === 26 && <p className="memory-full-note">トランプと同じ52枚。34種類の牌から毎回26種類を選びます。</p>}
        <p className="memory-status">手数：{turns}　そろえた組：{deck.filter(card => card.matched).length / 2} / {pairCount}</p>
        <div className={`memory-grid memory-grid-${pairCount}`}>{deck.map((card, index) => <button key={card.key} className={`memory-card ${card.matched ? 'matched' : ''}`} onClick={() => flipCard(card.key)} aria-label={`${index + 1}番目、${card.faceUp || card.matched ? tileById[card.tile].label : '裏向きの牌'}`}>
          {card.faceUp || card.matched ? <TileImage tile={tileById[card.tile]} helperNumber={data.settings.helperNumbers} /> : <span className="tile-back" aria-hidden="true" />}
        </button>)}</div>
        {memoryComplete && <div className="info-panel">{turns}手で完成しました。</div>}
        <Button secondary onClick={() => startMemory()}>最初からやり直す</Button>
      </section>}

      {screen === 'guide' && <section className="page-section guide-section">
        <p className="eyebrow">TILE GUIDE</p><h1>牌の一覧</h1><p className="muted">図柄と名前を確認できます。</p>
        <div className="family-tabs">{familyTabs.map(family => <button key={family} className={guideFamily === family ? 'active' : ''} onClick={() => setGuideFamily(family)}><Term text={family} enabled={data.settings.furigana} /></button>)}</div>
        <div className="guide-grid">{tiles.filter(tile => tile.family === guideFamily).map(tile => <div className="guide-card" key={tile.id}><TileImage tile={tile} helperNumber={data.settings.helperNumbers} /><strong>{tile.label}</strong><TileReading tile={tile} enabled={data.settings.furigana} /></div>)}</div>
      </section>}

      {screen === 'encyclopedia' && <Encyclopedia explanationStyle={data.settings.explanationStyle} />}

      {screen === 'records' && <section className="page-section records-section">
        <p className="eyebrow">YOUR RECORD</p><h1>学習記録</h1>
        <div className="record-summary"><div><strong>{stages.reduce((sum, item) => sum + data.stages[item.id].attempts, 0)}</strong><span>挑戦した回数</span></div><div><strong>{stages.filter(item => data.stages[item.id].completed > 0).length}</strong><span>完了したステージ</span></div></div>
        <h2>ステージごとの記録</h2>
        <div className="record-list">{displayStages.map(item => <div key={item.id} className="record-row"><span>{item.title}</span><strong>{data.stages[item.id].completed ? `最高 ${data.stages[item.id].bestFirstTry} / 5` : '記録なし'}</strong></div>)}</div>
        <p className="muted">成績はこのブラウザに保存されます。</p>
        <Button onClick={() => navigate('stages')}>学習を始める</Button>
      </section>}

      {screen === 'settings' && <section className="page-section settings-section">
        <p className="eyebrow">PREFERENCES</p><h1>表示と記録の設定</h1>
        <fieldset className="explanation-picker">
          <legend>説明のスタイル</legend>
          <p className="muted">問題文・ヒント・解説・辞典の説明を切り替えます。問題の難しさは変わりません。</p>
          {([
            ['child', 'やさしい説明', '具体例を使い、麻雀用語を一つずつ説明します。'],
            ['adult', '用語を使った説明', '麻雀用語を使い、関連する条件もまとめて説明します。'],
          ] as const).map(([style, label, description]) => <label className="setting-row" key={style}>
            <span><strong>{label}</strong><small>{description}</small></span>
            <input type="radio" name="explanation-style" value={style} checked={data.settings.explanationStyle === style} onChange={() => setData(current => ({ ...current, settings: { ...current.settings, explanationStyle: style } }))} />
          </label>)}
        </fieldset>
        <div className="theme-picker" role="group" aria-label="牌と画面の配色">
          {([['regular', '白牌・緑'], ['black', '黒牌・金']] as const).map(([theme, label]) => <button key={theme} className={data.settings.theme === theme ? 'active' : ''} aria-pressed={data.settings.theme === theme} onClick={() => setData(current => ({ ...current, settings: { ...current.settings, theme } }))}>
            <span className={`theme-preview theme-preview-${theme}`} aria-hidden="true"><span className="theme-preview-tile"><img src={tileUrl(tileById.man1, theme === 'black' ? 'Black' : 'Regular')} alt="" /></span></span>
            <strong>{label}</strong>
          </button>)}
        </div>
        <div className="settings-list">
          {([
            ['furigana', 'ふりがなを表示', '牌の読み方を補助します'],
            ['helperNumbers', '牌の補助数字を表示', '数牌の数字を見やすくします'],
            ['showTime', '回答時間を表示', '時間制限や減点には使いません'],
          ] as const).map(([key, title, description]) => <label className="setting-row" key={key}><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={data.settings[key]} onChange={event => setData(current => ({ ...current, settings: { ...current.settings, [key]: event.target.checked } }))} /></label>)}
        </div>
        <h2>学習記録</h2>
        <button className="reset-button" onClick={() => setResetOpen(true)}>学習記録をリセット <span>確認してから削除します</span></button>
        {resetOpen && <div className="dialog-backdrop"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">学習記録を消しますか？</h2><p>これまでの成績や挑戦回数がすべて消えます。元には戻せません。</p><div className="dialog-actions"><Button secondary onClick={() => setResetOpen(false)}>やめる</Button><Button onClick={() => { setData(current => clearRecords(current)); setResetOpen(false); }}>記録を消す</Button></div></div></div>}
      </section>}
    </main>
  </div></ThemeContext.Provider>;
}
