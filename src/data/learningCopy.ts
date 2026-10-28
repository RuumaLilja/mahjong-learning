import type { Question, StageId } from '../domain/quiz';
import { tileById, type TileId } from '../domain/tiles';
import { discardOptions } from '../domain/hands';

export type ExplanationStyle = 'child' | 'adult';

// Keep the original questions intact: switching explanations must not change
// the hand, answer, choice order, or progress of the current exercise.
const names = (ids: readonly TileId[]) => ids.map(id => tileById[id].label).join('・');
const shape = '3枚の組を4つと、同じ牌2枚のペアを1つ';
const groupRule = '3枚の組は「同じ牌3枚」か「同じ種類で数字が1つずつ続く3枚」です。';

export const childStages: Partial<Record<StageId, { title: string; summary: string }>> = {
  1: { title: '牌の種類', summary: '漢字・丸・竹の絵で種類を見分ける' },
  5: { title: '牌の組み合わせ', summary: '同じ牌のペアや、3枚の組を作る' },
  6: { title: 'あと1枚で組を作る', summary: '2枚に何を足すと3枚の組になるか' },
  9: { title: 'あと1枚で完成する形', summary: '13枚に何を足すと完成するか' },
  10: { title: 'あと1枚の形にする', summary: '14枚から1枚を選んで捨てる' },
  12: { title: '次に進みやすい形を選ぶ', summary: '手を進められる牌の残り枚数を比べる' },
};

export function questionForStyle(question: Question, style: ExplanationStyle): Question {
  if (style === 'adult') return question;
  if (question.kind === 'group') {
    const same = question.answer.every(id => id === question.answer[0]);
    const count = question.answer.length;
    return { ...question,
      prompt: same ? `同じ牌を${count}枚選ぶ` : '同じ種類で、数字が1つずつ続く3枚を選ぶ',
      explanation: count === 2
        ? `${names([question.answer[0]])}が2枚そろいました。同じ牌2枚のペアを「対子（トイツ）」といいます。`
        : same
          ? `${names([question.answer[0]])}が3枚そろいました。同じ牌3枚の組を「刻子（コーツ）」といいます。`
          : `${question.answer.map(id => tileById[id].number).join(' → ')}と数字が1つずつ続き、牌の種類も同じです。この3枚の組を「順子（シュンツ）」といいます。`,
      hint: same ? `絵と数字の両方が同じ牌を${count}枚探します。` : 'まず同じ種類の牌を探し、その中で数字が1つずつ続く3枚を選びます。',
    };
  }
  if (question.kind === 'completeMeld') {
    const same = question.pair[0] === question.pair[1];
    return { ...question, prompt: same ? '同じ牌3枚の組にするには、何を足す？' : '数字が1つずつ続く3枚の組にするには、何を足す？',
      explanation: same
        ? `${names(question.answer)}を1枚足すと、同じ牌が3枚そろいます。`
        : `${question.answer.map(id => `${tileById[id].label}を足すと${[...question.pair, id].map(tile => tileById[tile].number!).sort((a, b) => a - b).join('・')}`).join('。\n')}。同じ種類で数字が1つずつ続く3枚になります。`,
      hint: same ? '今ある2枚と同じ絵の牌を探します。' : '2枚の前・間・後ろのどこに足すと、数字が1つずつ続くかを考えます。1の前や9の後ろにはつなげられません。',
    };
  }
  if (question.kind === 'drill') {
    if (question.topic === 9) {
      const complete = Boolean(question.choiceTiles[question.choices.indexOf(question.answer)]?.length);
      return { ...question, prompt: '何を1枚足すと、形が完成する？',
        note: `手元には13枚あります。${shape}に分けられる牌を選びます。${groupRule}あと1枚でこの形になる状態が「テンパイ」です。この練習では、この完成形だけを考えます。`,
        explanation: complete
          ? `${question.answer}のどれか1枚を足すと、${shape}に分けられます。牌の図で分け方を確認できます。これらの完成に必要な牌を「待ち」といいます。`
          : `どの牌を1枚足しても、${shape}には分けられません。もう少し形を整える必要があるので「まだテンパイしていない」を選びます。`,
        hint: 'すでにできている3枚の組を探します。残りの牌に何を足すと、4組と1ペアになるでしょうか。',
      };
    }
    if (question.topic === 10) {
      const options = discardOptions(question.hand).filter(option => question.accepted.includes(option.discard));
      return { ...question, prompt: 'どれを捨てると、あと1枚で完成する形になる？',
        note: `手元の14枚から、捨てる牌を1枚選びます。残りの13枚が、あと1枚で「${shape}」になる形を探します。これが「テンパイ」です。${groupRule}正解が複数ある場合は、どれか1つを選びます。`,
        explanation: `正解は${names(question.accepted as TileId[])}です。\n` + options.map(option => `${tileById[option.discard].label}を捨てる → あと必要なのは：${names(option.waits)}`).join('\n') + '\nどの正解も、必要な牌をあと1枚足すと4組と1ペアに分けられます。この問題では形だけを考えます。実際にアガるには、役などの条件も必要です。',
        hint: '1枚捨てたあとの13枚を見ます。同じ牌3枚を分け直すことも含めて、4組と1ペアまであと1枚の形を探します。',
      };
    }
    if (question.topic === 12) {
      const best = question.comparison?.find(row => question.accepted.includes(row.discard))?.copies;
      return { ...question, prompt: '次に手を進められる牌が、最も多く残るのは？',
        note: '1枚捨てたあと、次にどの牌を引けば「あと1枚で完成」の形に進めるかを考えます。引いてから不要な1枚を捨てて進める牌の、残り枚数の合計が最も多くなるものを選びます。完成形は3枚の組4つと同じ牌2枚のペア1つです。点数や相手の手は考えず、この14枚だけを見て数えます。',
        explanation: `正解は${names(question.accepted as TileId[])}です。正解のどれを捨てても、次に手を進められる牌が合計${best}枚残ります。\n下の図の牌を引いて不要な1枚を捨てると、「あと1枚で完成」の形になります。同じ牌は全部で4枚です。手元に見えている枚数を4から引いて、残りを数えます。今回捨てる牌も、見えている枚数に含めます。`,
        hint: '数字が続く2枚なら前後のどちらにも足せる場合があります。間が空いた2枚や、1・2と8・9ではどうでしょうか。手を進められる牌を数えて比べます。',
      };
    }
  }
  if (question.kind === 'family') {
    const tile = tileById[question.tile];
    const features = { 萬子: '「萬」の文字', 筒子: '丸い絵', 索子: tile.number === 1 ? '鳥の絵' : '竹の絵', 字牌: '東・南・西・北・白・發・中' };
    return { ...question, explanation: `${features[tile.family]}が目印です。この種類を「${tile.family}」といいます。${tile.family === '索子' ? '1だけは竹ではなく鳥の絵です。' : ''}` };
  }
  return question;
}
