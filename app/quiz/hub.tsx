import {useEffect} from 'react';
import {ArrowLeft, ChevronRight, Lock, Target} from 'lucide-react';
import {QUIZ_REGIONS, type QuizRegionId} from './catalogue';
import './quiz.css';

interface HubCard {id: string; label: string; english: string; blurb: string; region?: QuizRegionId}
/** Body parts in the order of the page: the first row is the trunk and head, the second the limbs. Parts without content yet are shown as 即將推出. */
const PARTS: HubCard[] = [
  {id: 'head', label: '頭部', english: 'Head', blurb: '顱骨、面部肌肉、腦神經與頭部血管'},
  {id: 'neck', label: '頸部', english: 'Neck', blurb: '頸部肌肉、神經叢與頸部血管'},
  {id: 'thorax', label: '胸腔', english: 'Thorax', blurb: '胸廓、胸壁肌肉、縱膈大血管與肋間構造', region: 'thorax'},
  {id: 'back', label: '背部', english: 'Back', blurb: '淺層至深層背肌、枕下區與相關神經血管', region: 'back'},
  {id: 'upper-limb', label: '上肢', english: 'Upper limb', blurb: '肩帶、上臂、肘、前臂與手', region: 'upper-limb'},
  {id: 'lower-limb', label: '下肢', english: 'Lower limb', blurb: '臀部、大腿、膝、小腿與足', region: 'lower-limb'},
];

export default function QuizHub() {
  useEffect(() => {document.title = 'Quiz · MJ Anatomy';}, []);
  return <main className="quiz-app quiz-hub" lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <div className="quiz-brand">MJ Anatomy <span>QUIZ</span></div>
      <span className="quiz-header-tag">選擇部位</span>
    </header>
    <div className="quiz-hub-content">
      <section className="quiz-intro quiz-hub-intro">
        <div className="quiz-kicker"><Target size={15}/> FIND THE STRUCTURE</div>
        <h1 tabIndex={-1}>想練習哪個部位？</h1>
        <p>選擇部位後，可再自由組合題目範圍（骨、肌肉、神經、動脈、靜脈、韌帶與筋膜、特殊空間與孔、器官結構）與左右側。每答一題，都會顯示正確位置與資料卡。</p>
      </section>
      <section aria-label="部位" className="quiz-hub-grid">
        {PARTS.map(part => {
          const region = part.region ? QUIZ_REGIONS[part.region] : undefined;
          const body = <>
            <span className="quiz-hub-text"><b>{part.label}</b><small>{part.english}</small><em>{part.blurb}</em></span>
            {region ? <ChevronRight size={18}/> : <span className="quiz-soon"><Lock size={13}/>即將推出</span>}
          </>;
          return region
            ? <a key={part.id} className="quiz-hub-card" href={region.hash} data-part={part.id}>{body}</a>
            : <div key={part.id} className="quiz-hub-card is-soon" aria-disabled="true" data-part={part.id}>{body}</div>;
        })}
      </section>
      {/* Organ quizzes: the heart and the lungs; other organs (brain …) are added here later. */}
      <h2 className="quiz-hub-subhead">器官 <small>Organs</small></h2>
      <section aria-label="器官" className="quiz-hub-grid quiz-hub-organs">
        <a className="quiz-hub-card" href={QUIZ_REGIONS.heart.hash} data-part="heart">
          <span className="quiz-hub-text"><b>心臟</b><small>Heart</small><em>心腔、瓣膜（含腱索）、乳突肌、冠狀動脈與心臟靜脈</em></span><ChevronRight size={18}/>
        </a>
        <a className="quiz-hub-card" href={QUIZ_REGIONS.lung.hash} data-part="lung">
          <span className="quiz-hub-text"><b>肺</b><small>Lungs</small><em>肺的壓跡與溝、尖、緣、面、裂、心切跡、舌葉，以及肺門的支氣管、肺動脈、肺靜脈</em></span><ChevronRight size={18}/>
        </a>
        <div className="quiz-hub-card is-soon" aria-disabled="true" data-part="organs">
          <span className="quiz-hub-text"><b>其他器官</b><small>Other organs</small><em>腦等器官的 Quiz，之後加入</em></span>
          <span className="quiz-soon"><Lock size={13}/>即將推出</span>
        </div>
      </section>
    </div>
  </main>;
}
