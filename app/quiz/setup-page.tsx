import {useEffect, useMemo, useState} from 'react';
import {AlertCircle, ArrowLeft, ArrowRight, Check, Target} from 'lucide-react';
import {QUIZ_CATEGORIES, QUIZ_REGIONS, orderedRegions, questionPool, type QuizCategory, type QuizRegionId, type QuizSide} from './catalogue';
import {COUNT_CHOICES, MAX_COUNT, loadSetup, planOf, poolFor, saveSetup, savePlan, settingsFor, type QuizSetup} from './setup';
import {ModeNav} from './mode-nav';
import {CategoryPicker, RegionPicker, toggleRegionIn, toggleSectionIn} from './setup-parts';
import {namingPool} from './level2';
import {useCatalogues} from './use-catalogue';
import './quiz.css';

/** Quiz: the setup screen. Regions come from the question data; sections of several regions can be mixed, the kinds of structure are a multi-choice, the count is free, and the setup is remembered. */
export default function QuizSetupPage() {
  const [setup, setSetup] = useState<QuizSetup>(() => loadSetup()), [open, setOpen] = useState<string[]>([]), [custom, setCustom] = useState('');
  useEffect(() => {document.title = 'Quiz · MJ Anatomy';}, []);
  useEffect(() => {saveSetup(setup);}, [setup]);
  const regions = orderedRegions(), chosen = regions.map(r => r.id).filter(id => setup.regions[id]);
  const {loaded, failed, reload} = useCatalogues(chosen);
  const update = (patch: Partial<QuizSetup>) => setSetup(s => ({...s, ...patch}));
  const toggleRegion = (id: QuizRegionId) => setSetup(s => ({...s, regions: toggleRegionIn(s.regions, id)}));
  const toggleSection = (id: QuizRegionId, section: string) => setSetup(s => ({...s, regions: toggleSectionIn(s.regions, id, section)}));
  const pools = useMemo(() => Object.fromEntries(chosen.filter(id => loaded[id]).map(id => [id, poolFor(loaded[id]!, setup, id).length])), [chosen.join(','), loaded, setup]); // eslint-disable-line react-hooks/exhaustive-deps
  const waiting = chosen.some(id => !loaded[id] && !failed.includes(id));
  const total = Object.values(pools).reduce((a, b) => a + b, 0);
  const countOf = (c: QuizCategory) => chosen.reduce((n, id) => {
    const cat = loaded[id]; if (!cat) return n;
    const only = {...setup, categories: [c]};
    return n + (setup.level === 3 ? namingPool(cat, settingsFor(only, id)).length : questionPool(cat, settingsFor(only, id)).length);
  }, 0);
  const asked = setup.count === 'all' ? total : Math.min(setup.count, total);
  const start = () => {
    const plan = planOf(setup, pools);
    if (!plan.blocks.length) return;
    savePlan(plan); location.hash = '#/quiz/run';
  };
  const setCount = (v: number | 'all') => {update({count: v}); setCustom('');};
  const sideLabel: [QuizSide, string][] = [['right', '右側'], ['left', '左側'], ['both', '雙側']];
  return <main className="quiz-app quiz-setup-page" lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <ModeNav current="quiz"/>
      <span className="quiz-header-tag">自選範圍</span>
    </header>
    <div className="quiz-setup-content">
      <section className="quiz-intro">
        <div className="quiz-kicker"><Target size={15}/> CHECK YOURSELF</div>
        <h1 tabIndex={-1}>想考哪些範圍？</h1>
        <p>可以同時選多個區域、多個區段與多種構造，題數自訂，題目由選好的範圍隨機抽出、不重複。作答沒有提示，隨時可以提早結束，做過的題目照樣計分。</p>
        <div className="quiz-how"><span><b>01</b>選範圍與構造種類</span><span><b>02</b>旋轉模型，點出答案</span><span><b>03</b>看結果，答錯的「回去學習」</span></div>
        <p className="quiz-scope">還沒學過這個區域？先到<a href="#/learn">學習</a>走一遍關卡，再回來檢測。</p>
      </section>
      <section className="quiz-setup-card" aria-label="設定 Quiz">
        <fieldset><legend><b>01</b> 範圍 <small>可多選區域與區段</small></legend>
          <RegionPicker regions={setup.regions} open={open} setOpen={setOpen} onRegion={toggleRegion} onSection={toggleSection}/>
        </fieldset>
        <fieldset><legend><b>02</b> 內容類型 <small>可選多個，任意組合</small></legend>
          <CategoryPicker value={setup.categories} onChange={categories => update({categories})} count={c => chosen.length && !waiting ? countOf(c) : null}/>
          <div className="quiz-category-tools"><button type="button" data-slot="quiz-button" className="quiz-text-button" onClick={() => update({categories: QUIZ_CATEGORIES.map(c => c.id)})}>全選</button><button type="button" data-slot="quiz-button" className="quiz-text-button" onClick={() => update({categories: []})}>全部取消</button><span>灰色的類別在選定範圍內暫無題目</span></div>
        </fieldset>
        <fieldset><legend><b>03</b> 作答方式</legend>
          <div className="quiz-level-grid">
            <button type="button" data-slot="quiz-button" data-level="1" aria-pressed={setup.level === 1} onClick={() => update({level: 1})}><span><b>看名稱找結構</b>在模型上點出答案<small>Level 1 · name → structure</small></span>{setup.level === 1 && <Check size={17}/>}</button>
            <button type="button" data-slot="quiz-button" data-level="3" aria-pressed={setup.level === 3} onClick={() => update({level: 3})}><span><b>看結構寫名稱</b>輸入英文或中文名稱<small>Level 2 · structure → name</small></span>{setup.level === 3 && <Check size={17}/>}</button>
          </div>
        </fieldset>
        <div className="quiz-options-row">
          <fieldset><legend>左右側</legend><div className="quiz-segmented">{sideLabel.map(([id, label]) => <button type="button" data-slot="quiz-button" key={id} aria-pressed={setup.side === id} onClick={() => update({side: id})}>{label}</button>)}</div></fieldset>
          <fieldset><legend>題目範圍</legend><div className="quiz-segmented">{([['all', '包括延伸'], ['summary', '只考摘要']] as const).map(([id, label]) => <button type="button" data-slot="quiz-button" key={id} aria-pressed={setup.scope === id} onClick={() => update({scope: id})}>{label}</button>)}</div></fieldset>
        </div>
        {setup.level === 3 && <div className="quiz-options-row quiz-naming-options">
          <fieldset><legend>作答語言</legend><div className="quiz-segmented">{([['en', '英文'], ['zh', '中文'], ['any', '任一']] as const).map(([id, label]) => <button type="button" data-slot="quiz-button" key={id} aria-pressed={setup.language === id} onClick={() => update({language: id})}>{label}</button>)}</div></fieldset>
          <fieldset><legend>左右側</legend><label className="quiz-context-toggle"><input type="checkbox" checked={setup.needSide} onChange={e => update({needSide: e.target.checked})}/>需要答出左右</label></fieldset>
        </div>}
        <fieldset><legend><b>04</b> 題數</legend>
          <div className="quiz-segmented">{COUNT_CHOICES.map(n => <button type="button" data-slot="quiz-button" key={n} aria-pressed={setup.count === n && !custom} onClick={() => setCount(n)}>{n}</button>)}
            <button type="button" data-slot="quiz-button" aria-pressed={setup.count === 'all'} onClick={() => setCount('all')}>全部</button></div>
          <label className="setup-custom">自訂題數<input type="number" inputMode="numeric" min={1} max={MAX_COUNT} value={custom} placeholder="例如 15" onChange={e => {setCustom(e.target.value); const n = Math.floor(Number(e.target.value)); if (n >= 1) update({count: Math.min(n, MAX_COUNT)});}}/></label>
        </fieldset>
        <label className="quiz-context-toggle setup-remember"><input type="checkbox" checked={setup.remember} onChange={e => update({remember: e.target.checked})}/>記住這次的設定，下次預設用回</label>
        {failed.length > 0 && <div className="quiz-error" role="alert">{failed.map(id => QUIZ_REGIONS[id].label).join('、')}的題庫未能載入。<button data-slot="quiz-button" onClick={reload}>重新載入</button></div>}
        <p className={`quiz-pool-note quiz-scope-count ${total || !chosen.length ? '' : 'is-empty'}`} role="status" aria-live="polite" data-count={total}>{!chosen.length ? '請先選擇至少一個區域。' : waiting ? '正在準備題庫…' : total ? <>此範圍共 <b>{total}</b> 題，本回抽 <b>{asked}</b> 題</> : '此範圍暫無題目，請調整區段、內容類型或左右側。'}</p>
        <div className="quiz-start-row"><button data-slot="quiz-button" className="quiz-primary" disabled={!total || waiting || !setup.categories.length} onClick={start}>開始測驗 <ArrowRight size={18}/></button>
          {!setup.categories.length && <p><AlertCircle size={13}/> 請至少選一種內容類型。</p>}</div>
      </section>
    </div>
  </main>;
}
