import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({ optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { questionForStyle } = await vite.ssrLoadModule('/src/data/learningCopy.ts');
  const { childEntries, entryForStyle } = await vite.ssrLoadModule('/src/data/childEncyclopedia.ts');
  const { terms, yaku } = await vite.ssrLoadModule('/src/data/encyclopedia.ts');
  const { createRun, isCorrect } = await vite.ssrLoadModule('/src/domain/quiz.ts');
  const { drillBank } = await vite.ssrLoadModule('/src/domain/drills.ts');
  const { freshData, loadData, saveData, clearRecords } = await vite.ssrLoadModule('/src/domain/storage.ts');
  const { default: Encyclopedia } = await vite.ssrLoadModule('/src/Encyclopedia.tsx');
  const { default: bank } = await vite.ssrLoadModule('/src/data/questions.json');

  assert.deepEqual(new Set(Object.keys(childEntries)), new Set([...terms, ...yaku].map(entry => entry.id)), 'every dictionary entry needs child copy');
  for (const entry of [...terms, ...yaku]) {
    const snapshot = JSON.stringify(entry);
    assert.equal(entryForStyle(entry, 'adult'), entry);
    const child = entryForStyle(entry, 'child');
    assert.ok(child.summary, entry.id);
    assert.equal(child.groups, entry.groups, 'tile examples stay shared');
    assert.equal(child.han, entry.han, 'scores stay shared');
    assert.equal(JSON.stringify(entry), snapshot, 'adult entry remains intact');
  }

  // Include every authored group and completion pattern, not just a random run.
  const questions = Object.values(bank).flat().filter(q => q.kind === 'group');
  for (const stage of [1, 2, 4, 6, 7]) for (let run = 0; run < 10; run++) questions.push(...createRun(stage));
  for (const topic of [9, 10, 12]) questions.push(...drillBank(topic));
  for (const question of questions) {
    const snapshot = JSON.stringify(question);
    assert.equal(questionForStyle(question, 'adult'), question);
    const child = questionForStyle(question, 'child');
    for (const key of ['id', 'kind', 'choices', 'answer', 'accepted', 'hand', 'choiceTiles', 'comparison']) {
      assert.deepEqual(child[key], question[key], `${question.id}: switching copy changed ${key}`);
    }
    const selection = Array.isArray(child.answer) ? child.answer : [child.answer];
    assert.equal(isCorrect(child, selection), true, question.id);
    assert.equal(JSON.stringify(question), snapshot, 'adult question remains intact');
    if (child.kind === 'group' && child.answer.length === 2) {
      assert.ok(child.explanation.includes('対子'));
      assert.ok(!/雀頭|アガリ|刻子|順子/.test(child.explanation), 'pair lesson introduces only the pair term');
    }
    if (child.kind === 'drill' && child.topic === 10) assert.ok(!/鳴き|フリテン|打牌/.test(child.explanation));
  }

  let stored = null;
  globalThis.localStorage = { getItem: () => stored, setItem: (_key, value) => { stored = value; } };
  assert.equal(loadData().settings.explanationStyle, 'child');
  const legacy = freshData();
  delete legacy.settings.explanationStyle;
  legacy.stages[5] = { attempts: 7, completed: 3, bestFirstTry: 4 };
  stored = JSON.stringify(legacy);
  assert.deepEqual(loadData().stages[5], legacy.stages[5], 'migration preserves records');
  assert.equal(loadData().settings.explanationStyle, 'child');
  const adult = loadData();
  adult.settings.explanationStyle = 'adult';
  saveData(adult);
  assert.equal(loadData().settings.explanationStyle, 'adult', 'selection survives reload');
  assert.equal(clearRecords(loadData()).settings.explanationStyle, 'adult', 'resetting records preserves explanation preference');
  stored = JSON.stringify({ ...adult, settings: { ...adult.settings, explanationStyle: 'invalid' } });
  assert.equal(loadData().settings.explanationStyle, 'child');
  delete globalThis.localStorage;

  for (const style of ['child', 'adult']) {
    const html = renderToString(React.createElement(Encyclopedia, { explanationStyle: style }));
    assert.ok(html.includes(style === 'child' ? childEntries.toitsu.summary : terms.find(entry => entry.id === 'toitsu').summary));
    assert.ok(html.includes('/tiles/Regular/'));
  }
  console.log(`Both explanation styles checked for ${questions.length} questions, ${terms.length + yaku.length} dictionary entries, storage migration, and rendering.`);
} finally {
  await vite.close();
}
