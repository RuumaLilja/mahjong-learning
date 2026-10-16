import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite = await createServer({ optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { drillBank } = await vite.ssrLoadModule('/src/domain/drills.ts');
  const { waits, discardOptions, isWinning, counts, shanten, efficiencyOptions } = await vite.ssrLoadModule('/src/domain/hands.ts');
  const { createRun, isCorrect, stages } = await vite.ssrLoadModule('/src/domain/quiz.ts');
  const parse = text => text.split(' ');
  assert.deepEqual(waits(parse('man1 man2 man3 pin4 pin5 pin6 sou7 sou8 sou9 east east man4 man5')), ['man3','man6']);
  assert.deepEqual(waits(parse('man4 man5 man6 pin2 pin3 pin4 sou6 sou7 sou8 white white man1 man2')), ['man3']);
  assert.deepEqual(waits(parse('man7 man8 man9 pin1 pin2 pin3 sou3 sou4 sou5 red red man4 man6')), ['man5']);
  assert.deepEqual(waits(parse('man2 man3 man4 pin5 pin6 pin7 sou1 sou2 sou3 east east east white')), ['white']);
  assert.deepEqual(waits(parse('man1 man2 man3 pin4 pin5 pin6 sou7 sou8 sou9 east east red red')), ['east','red']);
  assert.equal(isWinning(parse('man1 man1 man1 man1 man1 pin1 pin2 pin3 sou1 sou2 sou3 east east east')), false);
  assert.equal(isWinning(parse('man1 man1 man3 man3 pin5 pin5 pin7 pin7 sou2 sou2 east east red red')), false);
  const tied = discardOptions(parse('man1 man2 man3 pin4 pin5 pin6 sou7 sou8 sou9 east east red red north'));
  assert.equal(tied.find(o => o.discard === 'north').copies, 4);
  assert.ok(!stages.some(s => s.id === 8 || s.id === 11));
  const { tiles } = await vite.ssrLoadModule('/src/domain/tiles.ts');
  for (const stage of [9,10,12]) {
    const bank = drillBank(stage);
    assert.ok(bank.length >= 48);
    assert.equal(new Set(bank.map(q => q.id)).size,bank.length);
    for (const q of bank) {
      assert.ok(counts(q.hand).every(n => n <= 4), q.id);
      assert.equal(q.hand.length, stage === 9 ? 13 : 14);
      assert.equal(new Set(q.choices).size, q.choices.length);
      assert.equal(q.choices.length, q.choiceTiles.length);
      assert.ok(q.accepted.length);
      for (const choice of q.choices) assert.equal(isCorrect(q,[choice]), q.accepted.includes(choice));
      assert.equal(isCorrect(q,[]),false);
      if(stage === 9) {
        assert.ok(counts(q.hand).some(n => n === 3), q.id);
        assert.equal(shanten(q.hand) === 0, waits(q.hand).length > 0);
      }
      if(stage >= 10) {
        assert.equal(isWinning(q.hand),false, `already complete: ${q.id}`);
        assert.ok(q.accepted.length < q.choices.length,q.id);
        if(stage === 10) assert.deepEqual(q.accepted,discardOptions(q.hand).filter(o => o.waits.length).map(o => o.discard));
        if(stage === 12) {
          assert.equal(discardOptions(q.hand).some(o => o.waits.length),false,q.id);
          const options = efficiencyOptions(q.hand);
          const eligible = options.filter(o => o.distance === 1);
          const best = Math.max(...eligible.map(o => o.copies));
          assert.ok(new Set(eligible.map(o => o.copies)).size > 1,q.id);
          assert.deepEqual(q.accepted,eligible.filter(o => o.copies === best).map(o => o.discard));
          // Independently enumerate draw -> discard -> winning waits for one
          // authored variant of each pattern, rather than trusting shanten twice.
          if(q.id.endsWith('-0')) {
            for(const o of eligible) {
              const rest = [...q.hand]; rest.splice(rest.indexOf(o.discard),1);
              const actual = tiles.filter(t => q.hand.filter(id => id === t.id).length < 4 && discardOptions([...rest,t.id]).some(d => d.waits.length)).map(t => t.id);
              assert.deepEqual(o.effective, actual,`${q.id} ${o.discard}`);
            }
          }
        }
      }
    }
    for(let seed=1;seed<=20;seed++) {
      let value=seed;
      const run=createRun(stage,()=>((value=(value*1664525+1013904223)>>>0)/2**32));
      assert.equal(new Set(run.map(q=>q.pattern)).size,5);
      assert.ok(run.every(q=>q.choices.includes(q.answer)));
    }
    console.log(`Stage ${stage}: ${bank.length} validated variants; five distinct shapes per run.`);
  }
} finally { await vite.close(); }
