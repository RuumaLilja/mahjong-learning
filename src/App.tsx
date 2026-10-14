import { useEffect, useRef, useState } from 'react';
import { createMemoryDeck, type MemoryCard } from './domain/memory';
import { createRun, isCorrect, stages, type Question, type StageId } from './domain/quiz';
import { clearRecords, loadData, saveData, type SavedData } from './domain/storage';
import { tileById, tileUrl, tiles, type Tile, type TileId } from './domain/tiles';

type Screen = 'home' | 'stages' | 'quiz' | 'result' | 'memory' | 'guide' | 'records' | 'settings';
type Feedback = 'correct' | 'wrong' | null;

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
  return <span className={`tile-wrap ${className}`}>
    <img className="tile-image" src={tileUrl(tile)} alt={tile.label} />
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [data, setData] = useState<SavedData>(loadData);
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
  const [pairCount, setPairCount] = useState<3 | 6>(6);
  const [deck, setDeck] = useState<MemoryCard[]>(() => createMemoryDeck(6));
  const [turns, setTurns] = useState(0);
  const [memoryBusy, setMemoryBusy] = useState(false);
  const memoryRun = useRef(0);
  const [guideFamily, setGuideFamily] = useState<Tile['family']>('萬子');
  const [resetOpen, setResetOpen] = useState(false);
  const question = questions[questionIndex];

  useEffect(() => saveData(data), [data]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, questionIndex]);
  useEffect(() => {
    if (screen !== 'quiz' || !data.settings.showTime || feedback === 'correct') return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - questionStartedAt.current) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [screen, questionIndex, data.settings.showTime, feedback]);

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
    setScreen('quiz');
  }

  function choose(index: number) {
    if (feedback === 'correct') return;
    if (question.kind === 'group') {
      setSelected(current => current.includes(index) ? current.filter(item => item !== index) : current.length < question.answer.length ? [...current, index] : current);
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

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      setData(current => ({ ...current, stages: { ...current.stages, [stage]: {
        ...current.stages[stage],
        completed: current.stages[stage].completed + 1,
        bestFirstTry: Math.max(current.stages[stage].bestFirstTry, firstTryScore),
      } } }));
      setScreen('result');
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

  function startMemory(count: 3 | 6 = pairCount) {
    memoryRun.current += 1;
    setPairCount(count);
    setDeck(createMemoryDeck(count));
    setTurns(0);
    setMemoryBusy(false);
    setScreen('memory');
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
    setResetOpen(false);
    setScreen(destination);
  }

  const stageTitle = stages.find(item => item.id === stage)?.title ?? '';
  const familyTabs = ['萬子', '筒子', '索子', '字牌'] as const;
  const memoryComplete = deck.every(card => card.matched);

  return <div className="app-shell">
    <header className={`topbar ${screen === 'home' ? 'topbar-home' : ''}`}>
      {screen !== 'home' ? <button className="plain-button" onClick={() => navigate(screen === 'quiz' || screen === 'result' ? 'stages' : 'home')}>‹ 戻る</button> : <span />}
      <span className="topbar-title"><ReadingText text={screen === 'home' ? '' : screen === 'stages' ? 'ステージ選択' : screen === 'quiz' ? stageTitle : screen === 'result' ? 'ステージ結果' : screen === 'memory' ? '神経衰弱' : screen === 'guide' ? '牌一覧' : screen === 'records' ? '成績' : '設定'} enabled={data.settings.furigana} /></span>
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
            <button onClick={() => navigate('records')}><span>成績</span></button>
          </div>
        </div>
      </>}

      {screen === 'stages' && <section className="page-section">
        <p className="eyebrow">STAGE SELECT</p>
        <h1>学ぶ内容を選ぶ</h1>
        <p className="muted">好きなステージから始められます。</p>
        <div className="stage-list">{stages.map(item => <button className="stage-card" key={item.id} onClick={() => startStage(item.id)}>
          <span className="stage-number">{item.id}</span>
          <span className="stage-info"><strong><ReadingText text={item.title} enabled={data.settings.furigana} /></strong><small><ReadingText text={item.summary} enabled={data.settings.furigana} /></small></span>
          <span className="stage-record">{data.stages[item.id].bestFirstTry ? `${data.stages[item.id].bestFirstTry}/5` : '—'}</span>
        </button>)}</div>
      </section>}

      {screen === 'quiz' && <section className="page-section quiz-section">
        <div className="progress-label">ステージ {stage} ・ {questionIndex + 1} / 5 {data.settings.showTime && <span>・ {elapsedSeconds}秒</span>}</div>
        <div className="progress-dots" aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <span key={index} className={index <= questionIndex ? 'active' : ''} />)}</div>
        <h1><ReadingText text={question.kind === 'family' ? 'この牌の種類は？' : question.kind === 'number' ? 'この牌の数字は？' : question.kind === 'reading' ? 'この牌の読みは？' : question.prompt} enabled={data.settings.furigana} /></h1>
        {'tile' in question && <div className="question-tile"><TileImage tile={tileById[question.tile]} helperNumber={data.settings.helperNumbers} celebrate={feedback === 'correct'} />{feedback === 'correct' && <TileReading tile={tileById[question.tile]} enabled={data.settings.furigana} />}</div>}
        <p className="section-caption">{question.kind === 'group' ? `${question.answer.length}枚選択してください` : '答えを選択してください'}</p>
        <div className={question.kind === 'group' ? 'tile-options' : question.kind === 'tileFromReading' ? 'tile-options tile-options-four' : 'text-options'}>
          {question.choices.map((choice, index) => <button key={`${choice}-${index}`} className={`option ${selected.includes(index) ? 'selected' : ''}`} onClick={() => choose(index)} aria-pressed={selected.includes(index)}>
            {question.kind === 'group' || question.kind === 'tileFromReading' ? <span className="tile-option-content"><TileImage tile={tileById[choice as TileId]} helperNumber={data.settings.helperNumbers} celebrate={feedback === 'correct' && selected.includes(index)} />{question.kind === 'group' && <TileReading tile={tileById[choice as TileId]} enabled={data.settings.furigana} />}</span> : <Term text={choice} enabled={data.settings.furigana} />}
          </button>)}
        </div>
        {feedback && <div className={`feedback ${feedback}`} role="status"><strong>{feedback === 'correct' ? '正解' : 'もう一度選んでください'}</strong>{feedback === 'correct' && <p><ReadingText text={question.explanation} enabled={data.settings.furigana} /></p>}</div>}
        {hintOpen && !feedback && question.hint && <div className="hint">{question.hint}</div>}
        <div className="quiz-actions">
          {feedback === 'correct' ? <Button onClick={nextQuestion}>{questionIndex === questions.length - 1 ? '結果を見る' : '次の問題へ'}　→</Button> : <>
            {question.hint && <Button secondary onClick={() => setHintOpen(value => !value)}>ヒント</Button>}
            <Button onClick={answer} disabled={!selected.length || (question.kind === 'group' && selected.length !== question.answer.length)}>回答する</Button>
          </>}
        </div>
      </section>}

      {screen === 'result' && <section className="page-section result-section">
        <p className="eyebrow">STAGE COMPLETE</p><h1>ステージ完了</h1>
        <div className="result-score"><strong>{firstTryScore} / 5</strong><span>最初の回答で正解した数</span></div>
        <div className="info-panel"><strong>今回学んだ内容</strong><p>{stageTitle}</p></div>
        <Button onClick={() => startStage(stage)}>もう一度遊ぶ</Button>
        <Button secondary onClick={() => navigate('stages')}>ステージ選択へ</Button>
      </section>}

      {screen === 'memory' && <section className="page-section memory-section">
        <h1>{memoryComplete ? 'すべてそろいました' : '同じ牌をそろえる'}</h1>
        <p className="muted">時間制限はありません。</p>
        <div className="memory-toolbar"><span>組数</span><button className={pairCount === 3 ? 'active' : ''} onClick={() => startMemory(3)}>3組</button><button className={pairCount === 6 ? 'active' : ''} onClick={() => startMemory(6)}>6組</button></div>
        <p className="memory-status">手数：{turns}　そろえた組：{deck.filter(card => card.matched).length / 2} / {pairCount}</p>
        <div className="memory-grid">{deck.map(card => <button key={card.key} className={`memory-card ${card.matched ? 'matched' : ''}`} onClick={() => flipCard(card.key)} aria-label={card.faceUp || card.matched ? tileById[card.tile].label : '裏向きの牌'}>
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

      {screen === 'records' && <section className="page-section records-section">
        <p className="eyebrow">YOUR RECORD</p><h1>学習記録</h1>
        <div className="record-summary"><div><strong>{stages.reduce((sum, item) => sum + data.stages[item.id].attempts, 0)}</strong><span>挑戦した回数</span></div><div><strong>{stages.filter(item => data.stages[item.id].completed > 0).length}</strong><span>完了したステージ</span></div></div>
        <h2>ステージごとの記録</h2>
        <div className="record-list">{stages.map(item => <div key={item.id} className="record-row"><span>{item.title}</span><strong>{data.stages[item.id].completed ? `最高 ${data.stages[item.id].bestFirstTry} / 5` : '記録なし'}</strong></div>)}</div>
        <p className="muted">成績はこのブラウザに保存されます。</p>
        <Button onClick={() => navigate('stages')}>学習を始める</Button>
      </section>}

      {screen === 'settings' && <section className="page-section settings-section">
        <p className="eyebrow">PREFERENCES</p><h1>表示と記録の設定</h1>
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
  </div>;
}
