import { useContext, useState } from 'react';
import { terms, yaku, type Entry } from './data/encyclopedia';
import { tileById, tileUrl, type TileId } from './domain/tiles';
import { ThemeContext } from './theme';
import { entryForStyle } from './data/childEncyclopedia';
import type { ExplanationStyle } from './data/learningCopy';

type Section = 'terms' | 'yaku';

function TileExample({ entry }: { entry: Entry }) {
  const theme = useContext(ThemeContext);
  if (!entry.groups && !entry.media) return null;
  return <figure className="dictionary-example">
    {entry.groups && <div className={`dictionary-groups ${['naki', 'chi', 'pon'].includes(entry.id) ? 'dictionary-call' : ''}`} aria-label={entry.caption}>
      {entry.groups.map((group, index) => <div className="dictionary-group" key={index}>{group.map((id: TileId, tileIndex) => <span className="tile-wrap" key={`${id}-${tileIndex}`}><img className="tile-image" src={tileUrl(tileById[id], theme === 'black' ? 'Black' : 'Regular')} alt={tileById[id].label} /></span>)}</div>)}
    </div>}
    {entry.media && <img className="dictionary-media" src={entry.media.src} alt={entry.media.alt} loading="lazy" />}
    {entry.caption && <figcaption>{entry.caption}</figcaption>}
  </figure>;
}

function EntryCard({ entry, showHan }: { entry: Entry; showHan: boolean }) {
  const expandable = Boolean(entry.detail || entry.groups || entry.media);
  const header = <>
      <span className="dictionary-card-title"><strong>{entry.name}</strong><small>{entry.reading}</small></span>
      <span className="dictionary-card-meta">{showHan && entry.han && <b>{entry.han}</b>}{showHan && entry.closed && <b className="dictionary-closed">門前限定</b>}{showHan && entry.condition && <b className="dictionary-closed">{entry.condition}</b>}{expandable && <span className="dictionary-chevron" aria-hidden="true">⌄</span>}</span>
      <span className="dictionary-card-summary">{entry.summary}</span>
  </>;
  if (!expandable) return <article className="dictionary-card dictionary-card-static" id={entry.id}><div className="dictionary-card-header">{header}</div></article>;
  return <details className="dictionary-card" id={entry.id}>
    <summary className="dictionary-card-header">{header}</summary>
    <div className="dictionary-card-body">
      {entry.detail && <p>{entry.detail}</p>}
      <TileExample entry={entry} />
    </div>
  </details>;
}

export default function Encyclopedia({ explanationStyle = 'child' }: { explanationStyle?: ExplanationStyle }) {
  const [section, setSection] = useState<Section>('terms');
  const [query, setQuery] = useState('');
  const [termCategory, setTermCategory] = useState('すべて');
  const [hanFilter, setHanFilter] = useState('すべて');
  const categories = ['すべて', '基本', '鳴き・アガリ', '手牌の進み方', '待ち', '点数・局'];
  const hanGroups = ['すべて', '1翻', '2翻', '3翻以上', '満貫', '役満'];
  const normalizedQuery = query.trim().toLocaleLowerCase('ja');
  const entries = (section === 'terms' ? terms : yaku).map(entry => entryForStyle(entry, explanationStyle)).filter(entry => {
    if (section === 'terms' && termCategory !== 'すべて' && entry.category !== termCategory) return false;
    if (section === 'yaku' && hanFilter !== 'すべて') {
      if (hanFilter === '3翻以上' ? !(entry.han?.startsWith('3翻') || entry.han?.startsWith('6翻')) : hanFilter === '役満' ? !entry.han?.includes('役満') : !entry.han?.startsWith(hanFilter)) return false;
    }
    return `${entry.name} ${entry.reading} ${entry.summary} ${entry.detail ?? ''} ${entry.caption ?? ''}`.toLocaleLowerCase('ja').includes(normalizedQuery);
  });

  return <section className="page-section dictionary-section">
    <p className="eyebrow">MAHJONG DICTIONARY</p>
    <h1>麻雀辞典</h1>
    <p className="muted">気になった言葉や役を、牌の図といっしょに調べられます。</p>
    <div className="dictionary-switch" aria-label="辞典の種類">
      <button className={section === 'terms' ? 'active' : ''} aria-pressed={section === 'terms'} onClick={() => setSection('terms')}>用語 <small>{terms.length}項目</small></button>
      <button className={section === 'yaku' ? 'active' : ''} aria-pressed={section === 'yaku'} onClick={() => setSection('yaku')}>役 <small>{yaku.length}項目</small></button>
    </div>
    <label className="dictionary-search"><span>名前・読み・説明から探す</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="例：鳴き、イーシャンテン、タンヤオ" /></label>
    <div className="dictionary-filters" aria-label="絞り込み">
      {(section === 'terms' ? categories : hanGroups).map(value => <button key={value} className={(section === 'terms' ? termCategory : hanFilter) === value ? 'active' : ''} aria-pressed={(section === 'terms' ? termCategory : hanFilter) === value} onClick={() => section === 'terms' ? setTermCategory(value) : setHanFilter(value)}>{value}</button>)}
    </div>
    {section === 'yaku' && <p className="dictionary-note">{explanationStyle === 'child' ? '一般的な四人麻雀の役を紹介します。「門前限定」は、他の人の捨てた牌をもらって組を作ると使えない役です。ドラは点数のボーナスで、役にはなりません。' : '雀魂の通常の四人麻雀で使う一般的な役を掲載。特殊ルールの役は含みません。門前限定の役は鳴くと成立しません。ドラは役ではありません。'}</p>}
    <p className="dictionary-count">{entries.length}件</p>
    <div className="dictionary-list">{entries.map(entry => <EntryCard key={entry.id} entry={entry} showHan={section === 'yaku'} />)}</div>
    {entries.length === 0 && <p className="dictionary-empty">見つかりませんでした。別の言葉で探してください。</p>}
  </section>;
}
