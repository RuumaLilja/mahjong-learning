import assert from 'node:assert/strict';
import { createServer } from 'vite';

const vite = await createServer({ optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { terms, yaku } = await vite.ssrLoadModule('/src/data/encyclopedia.ts');
  const { tileById, tiles } = await vite.ssrLoadModule('/src/domain/tiles.ts');
  const { default: bank } = await vite.ssrLoadModule('/src/data/questions.json');
  const { completingTiles } = await vite.ssrLoadModule('/src/domain/quiz.ts');
  const ordered = ids => [...ids].sort((a, b) => tiles.findIndex(tile => tile.id === a) - tiles.findIndex(tile => tile.id === b));
  const isSequence = ids => {
    const cards = ordered(ids).map(id => tileById[id]);
    return cards.length === 3 && cards.every(card => card.number && card.family === cards[0].family) && cards[1].number === cards[0].number + 1 && cards[2].number === cards[1].number + 1;
  };

  const entries = [...terms, ...yaku];
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length, 'dictionary IDs must be unique');
  for (const entry of entries) {
    assert.ok(entry.name && entry.reading && entry.summary, entry.id);
    if (!entry.groups) continue;
    const pictured = entry.groups.flat();
    for (const id of pictured) assert.ok(tileById[id], `${entry.id}: unknown tile ${id}`);
    for (const id of new Set(pictured)) assert.ok(pictured.filter(tile => tile === id).length <= 4, `${entry.id}: fifth copy of ${id}`);
    assert.ok(entry.caption, `${entry.id}: pictured tiles need a caption`);
    if (!yaku.includes(entry) || entry.id === 'nagashi') continue;
    if (['kokushi13', 'suuankou-tanki', 'junsei-chuuren'].includes(entry.id)) {
      assert.equal(pictured.length, 13, `${entry.id}: waiting hand`);
    } else if (entry.id === 'chiitoi') {
      assert.equal(entry.groups.length, 7, entry.id);
      assert.ok(entry.groups.every(group => group.length === 2 && group[0] === group[1]), entry.id);
      assert.equal(new Set(entry.groups.map(group => group[0])).size, 7, entry.id);
    } else if (entry.id === 'kokushi') {
      assert.equal(pictured.length, 14, entry.id);
      assert.equal(new Set(pictured).size, 13, entry.id);
    } else if (entry.id === 'chuuren') {
      assert.equal(pictured.length, 14, entry.id);
      assert.equal(new Set(pictured.map(id => tileById[id].family)).size, 1, entry.id);
    } else {
      assert.equal(entry.groups.length, 5, `${entry.id}: four melds and a pair`);
      assert.equal(entry.groups.filter(group => group.length === 2 && group[0] === group[1]).length, 1, `${entry.id}: pair`);
      for (const group of entry.groups.filter(group => group.length >= 3)) {
        if (group.length === 4) assert.ok(group.every(id => id === group[0]), `${entry.id}: invalid kan`);
        else {
          assert.equal(group.length, 3, `${entry.id}: invalid meld length`);
          const numbered = group.map(id => tileById[id].number);
          const sequence = numbered.every(Boolean) && new Set(group.map(id => tileById[id].family)).size === 1 && numbered[1] === numbered[0] + 1 && numbered[2] === numbered[1] + 1;
          assert.ok(sequence || group.every(id => id === group[0]), `${entry.id}: invalid meld`);
        }
      }
    }
  }

  const ids = Object.values(bank).flat().map(spec => spec.id);
  assert.equal(new Set(ids).size, ids.length, 'question IDs must be unique');
  for (const spec of Object.values(bank).flat()) {
    if (spec.tile) assert.ok(tileById[spec.tile], `${spec.id}: unknown tile`);
    if (spec.kind === 'group') {
      for (const id of [...spec.choices, ...spec.answer]) assert.ok(tileById[id], `${spec.id}: unknown tile ${id}`);
      const answerCounts = new Map();
      for (const id of spec.answer) answerCounts.set(id, (answerCounts.get(id) ?? 0) + 1);
      for (const [id, count] of answerCounts) assert.ok(spec.choices.filter(choice => choice === id).length >= count, `${spec.id}: answer unavailable`);
      if (spec.answer.length === 2) assert.ok(spec.answer.every(id => id === spec.answer[0]), `${spec.id}: invalid pair`);
      if (spec.answer.length === 3) assert.ok(isSequence(spec.answer) || spec.answer.every(id => id === spec.answer[0]), `${spec.id}: invalid meld`);
      const size = spec.answer.length;
      const valid = [];
      for (let a = 0; a < spec.choices.length; a++) for (let b = a + 1; b < spec.choices.length; b++) {
        if (size === 2 && spec.choices[a] === spec.choices[b]) valid.push(ordered([spec.choices[a], spec.choices[b]]));
        if (size !== 3) continue;
        for (let c = b + 1; c < spec.choices.length; c++) {
          const group = [spec.choices[a], spec.choices[b], spec.choices[c]];
          if (spec.id.startsWith('triplet-') ? group.every(id => id === group[0]) : isSequence(group)) valid.push(ordered(group));
        }
      }
      assert.deepEqual(new Set(valid.map(group => group.join(','))), new Set([ordered(spec.answer).join(',')]), `${spec.id}: ambiguous choices`);
    }
    if (spec.kind === 'completeMeld') {
      const [first, second] = spec.pair.map(id => tileById[id]);
      const expected = first.id === second.id ? [first.id] : tiles.filter(tile => {
        const cards = ordered([first.id, second.id, tile.id]);
        return isSequence(cards);
      }).map(tile => tile.id);
      assert.deepEqual(completingTiles(spec.pair), expected, spec.id);
      assert.equal(expected.length, spec.pattern === 'twoWay' ? 2 : 1, spec.id);
    }
  }
  assert.equal(tiles.length, 34);
  console.log(`${terms.length} terms, ${yaku.length} yaku examples, and ${ids.length} basic question specifications passed content checks.`);
} finally {
  await vite.close();
}
