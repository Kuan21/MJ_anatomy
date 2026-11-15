import {useEffect} from 'react';
import {ArrowLeft, ChevronRight, Lock, Target} from 'lucide-react';
import {orderedRegions, type QuizRegionId} from './catalogue';
import {ModeNav} from './mode-nav';
import './quiz.css';

/** Short descriptions per region; a region without one here (a new region added to QUIZ_REGIONS) shows the first line of its own description. The cards themselves come from the region list. */
const BLURBS: Partial<Record<QuizRegionId, string>> = {
  'head-neck': '顱骨、面部與頸部肌肉、腦神經與頸神經、頭頸血管，以及眼、口、喉的構造（腦另有獨立的 Quiz）',
  thorax: '胸廓、胸壁肌肉、縱膈大血管與肋間構造',
  back: '淺層至深層背肌、枕下區與相關神經血管',
  'upper-limb': '肩帶、上臂、肘、前臂與手',
  'lower-limb': '臀部、大腿、膝、小腿與足',
  heart: '心腔、瓣膜、腱索、乳突肌、冠狀動脈與心臟靜脈',
  lung: '肺的壓跡與溝、尖、緣、面、裂、心切跡、舌葉，以及肺門的支氣管、肺動脈、肺靜脈',
  brain: '大腦皮質、深部核團、腦室、白質纖維束、腦幹、小腦、腦神經根與腦血管',
};

export default function QuizHub() {
  const regions = orderedRegions();
  useEffect(() => {document.title = 'Quiz · MJ Anatomy';}, []);
  return <main className="quiz-app quiz-hub" lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <ModeNav current="quiz"/>
      <span className="quiz-header-tag">選擇部位</span>
    </header>
    <div className="quiz-hub-content">
      <section className="quiz-intro quiz-hub-intro">
        <div className="quiz-kicker"><Target size={15}/> FIND THE STRUCTURE</div>
        <h1 tabIndex={-1}>想練習哪個部位？</h1>
        <p>選擇部位後，可再自由組合題目範圍（骨、肌肉、神經、動脈、靜脈、韌帶與筋膜、特殊空間與孔、器官結構）與左右側。每答一題，都會顯示正確位置與資料卡。</p>
      </section>
      <section aria-label="部位" className="quiz-hub-grid">
        {regions.filter(r => r.group !== 'organ').map(region => <a key={region.id} className="quiz-hub-card" href={region.hash} data-part={region.id}>
          <span className="quiz-hub-text"><b>{region.label}</b><small>{region.english}</small><em>{BLURBS[region.id] ?? region.description[0]}</em></span><ChevronRight size={18}/>
        </a>)}
      </section>
      {/* Organ quizzes: the heart, the lungs and the brain; other organs are added here later. */}
      <h2 className="quiz-hub-subhead">器官 <small>Organs</small></h2>
      <section aria-label="器官" className="quiz-hub-grid quiz-hub-organs">
        {regions.filter(r => r.group === 'organ').map(region => <a key={region.id} className="quiz-hub-card" href={region.hash} data-part={region.id}>
          <span className="quiz-hub-text"><b>{region.label}</b><small>{region.english}</small><em>{BLURBS[region.id] ?? region.description[0]}</em></span><ChevronRight size={18}/>
        </a>)}
        <div className="quiz-hub-card is-soon" aria-disabled="true" data-part="organs">
          <span className="quiz-hub-text"><b>其他器官</b><small>Other organs</small><em>其他器官的 Quiz，之後加入</em></span>
          <span className="quiz-soon"><Lock size={13}/>即將推出</span>
        </div>
      </section>
    </div>
  </main>;
}
