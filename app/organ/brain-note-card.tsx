import type {NoteCard, NoteData} from './brain-notes';

/** An info card built from the neuroanatomy notes: the notes' own sentences under the fields of the structure's type, each with its source page. */
export function NoteCardView({card, data, onFocus, onClose, hasModel, approxModel}: {card: NoteCard; data: NoteData; onFocus: () => void; onClose: () => void; hasModel: boolean; approxModel: boolean}) {
  return <article className="note-card" lang="zh-Hant">
    <h2 className="organ-info-title" lang="en">{card.en}</h2>
    <p className="organ-info-zh">{card.zh}</p>
    {card.aka && <p className="note-aka">別名：{card.aka.map(a => [a.zh, a.en].filter(Boolean).join(' ')).join('；')}</p>}
    <p className="note-meta">{data.typeLabels[card.type] ?? card.type}｜{data.regions[card.region] ?? ''}｜{hasModel ? '模型中有此構造' : approxModel ? '模型中只有近似構造' : <b>模型未有</b>}</p>
    {card.fields.map(f => <section key={f.label} className="note-field">
      <h3>{f.label}</h3>
      <ul>{f.items.map(x => <li key={x.t}>{x.t}<small>〔{x.s}〕</small></li>)}</ul>
    </section>)}
    {card.noBody && <p className="note-pending">筆記正文未有描述（只在原共筆題目中出現）。本卡內容待依 Essential Neuroscience 或圖譜補充，並註明來源。</p>}
    <p className="note-source">出處：神經解剖學共筆（M65×CM57）{card.sources.length ? card.sources.join('、') : '（僅列於原共筆題目，無正文頁碼）'}。</p>
    <div className="organ-actions" role="group" aria-label="共筆卡動作">
      {(hasModel || approxModel) && <button onClick={onFocus}>在模型中聚焦</button>}
      <button onClick={onClose}>關閉資訊卡</button>
    </div>
  </article>;
}
