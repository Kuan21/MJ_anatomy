import type {NoteCard, NoteData} from './brain-notes';

/** An info card for a brain structure: its type, region and the fields that apply to that type, written for this site. */
export function NoteCardView({card, data, onFocus, onClose, hasModel, approxModel}: {card: NoteCard; data: NoteData; onFocus: () => void; onClose: () => void; hasModel: boolean; approxModel: boolean}) {
  return <article className="note-card" lang="zh-Hant">
    <h2 className="organ-info-title" lang="en">{card.en}</h2>
    <p className="organ-info-zh">{card.zh}</p>
    {card.aka && <p className="note-aka">別名：{card.aka.map(a => [a.zh, a.en].filter(Boolean).join(' ')).join('；')}</p>}
    <p className="note-meta">{data.typeLabels[card.type] ?? card.type}｜{data.regions[card.region] ?? ''}｜{hasModel ? '模型中有此構造' : approxModel ? '模型中只有近似構造' : <b>模型未有</b>}</p>
    {card.fields.map(f => <section key={f.label} className="note-field">
      <h3>{f.label}</h3>
      <ul>{f.items.map(x => <li key={x}>{x}</li>)}</ul>
    </section>)}
    {card.fields.length === 0 && <p className="note-pending">這個構造的說明還在整理中。</p>}
    <div className="organ-actions" role="group" aria-label="資訊卡動作">
      {(hasModel || approxModel) && <button onClick={onFocus}>在模型中聚焦</button>}
      <button onClick={onClose}>關閉資訊卡</button>
    </div>
  </article>;
}
