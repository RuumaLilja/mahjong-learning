import assert from 'node:assert/strict';
import { createServer } from 'vite';

const vite = await createServer({ optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { completingTiles, createRun, isCorrect, stages } = await vite.ssrLoadModule('/src/domain/quiz.ts');
  const { createMemoryDeck } = await vite.ssrLoadModule('/src/domain/memory.ts');
  const { tiles } = await vite.ssrLoadModule('/src/domain/tiles.ts');
  const { freshData, loadData } = await vite.ssrLoadModule('/src/domain/storage.ts');
  const { default: bank } = await vite.ssrLoadModule('/src/data/questions.json');

  assert.equal(tiles.length, 34);
  assert.ok(!stages.some(stage => stage.id === 3));
  for (const stage of [4, 7]) {
    const expectedKind = stage === 4 ? 'reading' : 'tileFromReading';
    assert.ok(bank[stage].every(spec => spec.kind === expectedKind));
    for (const honor of tiles.filter(tile => tile.family === '字牌')) {
      assert.ok(bank[stage].some(spec => spec.tile === honor.id), `${stage}: ${honor.id}`);
    }
  }
  assert.deepEqual(completingTiles(['man4', 'man5']), ['man3', 'man6']);
  assert.deepEqual(completingTiles(['pin1', 'pin2']), ['pin3']);
  assert.deepEqual(completingTiles(['sou4', 'sou6']), ['sou5']);
  assert.deepEqual(completingTiles(['red', 'red']), ['red']);
  assert.deepEqual(completingTiles(['man4', 'pin5']), []);
  for (const spec of bank[6]) {
    const answers = completingTiles(spec.pair);
    assert.equal(answers.length, spec.pattern === 'twoWay' ? 2 : 1, spec.id);
    if (spec.pattern === 'triplet') assert.equal(spec.pair[0], spec.pair[1], spec.id);
  }
  for (const { id: stage } of stages.filter(stage => stage.id < 8)) {
    assert.ok(bank[stage].length > 5, `stage ${stage} needs more than five questions`);
    assert.equal(new Set(bank[stage].map(item => item.id)).size, bank[stage].length);
    for (let seed = 0; seed < 100; seed++) {
      let value = seed + 1;
      const random = () => ((value = (value * 1664525 + 1013904223) >>> 0) / 2 ** 32);
      const run = createRun(stage, random);
      assert.equal(run.length, 5);
      assert.equal(new Set(run.map(question => question.id)).size, 5);
      if (stage === 4) assert.ok(run.every(question => question.kind === 'reading'));
      if (stage === 7) assert.ok(run.every(question => question.kind === 'tileFromReading'));
      for (const question of run) {
        const answer = question.kind === 'group' || question.kind === 'completeMeld' ? question.answer : [question.answer];
        assert.equal(isCorrect(question, answer), true, `stage ${stage}, seed ${seed}`);
        assert.equal(isCorrect(question, []), false);
        assert.equal(question.choices.length, question.kind === 'group' ? 5 : 4);
        for (const choice of answer) assert.ok(question.choices.includes(choice));
        if (question.kind === 'completeMeld') {
          assert.deepEqual(answer, completingTiles(question.pair));
          assert.equal(new Set(question.choices).size, 4);
          for (const choice of question.choices.filter(id => !answer.includes(id))) {
            assert.equal(completingTiles(question.pair).includes(choice), false);
            assert.equal(isCorrect(question, [choice]), false);
          }
          if (answer.length === 2) assert.equal(isCorrect(question, [answer[0]]), false);
        }
        if (stage <= 4) assert.equal(question.hint, undefined);
        if (question.kind === 'reading') assert.ok(question.choices.every(choice => /^[ァ-ヶー]+$/.test(choice)));
        if (question.kind === 'tileFromReading') assert.ok(/^「[ァ-ヶー]+」/.test(question.prompt));
      }
      if (stage === 6) {
        const patterns = run.map(question => bank[6].find(spec => spec.id === question.id).pattern);
        for (const pattern of ['twoWay', 'edge', 'gap', 'triplet']) assert.ok(patterns.includes(pattern));
      }
    }
  }
  const previousStorage = globalThis.localStorage;
  try {
    const oldData = freshData();
    oldData.stages[1].attempts = 3;
    delete oldData.stages[6];
    delete oldData.stages[7];
    globalThis.localStorage = { getItem: () => JSON.stringify(oldData) };
    const migrated = loadData();
    assert.equal(migrated.stages[1].attempts, 3);
    assert.deepEqual(migrated.stages[6], { attempts: 0, completed: 0, bestFirstTry: 0 });
    assert.deepEqual(migrated.stages[7], { attempts: 0, completed: 0, bestFirstTry: 0 });
  } finally {
    globalThis.localStorage = previousStorage;
  }
  for (const count of [3, 6]) {
    const deck = createMemoryDeck(count);
    assert.equal(deck.length, count * 2);
    const byTile = deck.reduce((counts, card) => counts.set(card.tile, (counts.get(card.tile) ?? 0) + 1), new Map());
    assert.equal(byTile.size, count);
    assert.ok([...byTile.values()].every(value => value === 2));
  }
  console.log('Question banks, unique five-question runs, answers, and memory decks passed invariant checks.');
} finally {
  await vite.close();
}
