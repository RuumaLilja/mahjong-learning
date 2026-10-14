import assert from 'node:assert/strict';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { createRun, isCorrect } = await vite.ssrLoadModule('/src/domain/quiz.ts');
  const { createMemoryDeck } = await vite.ssrLoadModule('/src/domain/memory.ts');
  const { tiles } = await vite.ssrLoadModule('/src/domain/tiles.ts');
  const { default: bank } = await vite.ssrLoadModule('/src/data/questions.json');

  assert.equal(tiles.length, 34);
  for (let stage = 1; stage <= 5; stage++) {
    assert.ok(bank[stage].length > 5, `stage ${stage} needs more than five questions`);
    assert.equal(new Set(bank[stage].map(item => item.id)).size, bank[stage].length);
    for (let seed = 0; seed < 100; seed++) {
      let value = seed + 1;
      const random = () => ((value = (value * 1664525 + 1013904223) >>> 0) / 2 ** 32);
      const run = createRun(stage, random);
      assert.equal(run.length, 5);
      assert.equal(new Set(run.map(question => question.id)).size, 5);
      for (const question of run) {
        const answer = question.kind === 'group' ? question.answer : [question.answer];
        assert.equal(isCorrect(question, answer), true, `stage ${stage}, seed ${seed}`);
        assert.equal(isCorrect(question, []), false);
        assert.equal(question.choices.length, question.kind === 'group' ? 5 : 4);
        for (const choice of answer) assert.ok(question.choices.includes(choice));
        if (stage <= 4) assert.equal(question.hint, undefined);
        if (question.kind === 'reading') assert.ok(question.choices.every(choice => /^[ァ-ヶー]+$/.test(choice)));
        if (question.kind === 'tileFromReading') assert.ok(/^「[ァ-ヶー]+」/.test(question.prompt));
      }
    }
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
