import {createRoot} from 'react-dom/client';
import {Component, lazy, Suspense, useEffect, useState, type ReactNode} from 'react';
import '../app/globals.css';
import '../app/workspace-layout.css';
const Home = lazy(() => import('../app/page'));
const SkeletonLab = lazy(() => import('../app/biomechanics-v2/lab'));
const RegionQuiz = lazy(() => import('../app/quiz/page'));
const QuizHub = lazy(() => import('../app/quiz/hub'));
const HeartDetail = lazy(() => import('../app/organ/heart'));
const BrainDetail = lazy(() => import('../app/organ/brain'));
import {QUIZ_REGIONS, isQuizHub, regionOfHash} from '../app/quiz/catalogue';
/** The Skeleton v2 lab is a developer preview: it opens only with ?dev=1 (optionally ?dev=1&lab=skeleton-v2) and has no link in the product. */
const devLab = () => {
  const params = new URLSearchParams(location.search);
  return params.get('dev') === '1' && (params.get('lab') ?? 'skeleton-v2') === 'skeleton-v2';
};
const Trouble = ({title, detail}: {title: string; detail?: string}) => <div role="alert" style={{padding: 32, maxWidth: 520, lineHeight: 1.7}}>
  <p style={{fontSize: 17, margin: '0 0 8px'}}>{title}</p>
  {detail && <p style={{fontSize: 13, color: '#66727f', margin: '0 0 16px', wordBreak: 'break-word'}}>{detail}</p>}
  <button type="button" onClick={() => location.reload()} style={{padding: '10px 16px', border: '1px solid #18253628', borderRadius: 4}}>重新載入</button>
</div>;
/** A screen that throws while rendering shows a message with a reload button instead of a blank page. */
class ErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) {return {error};}
  componentDidCatch(error: Error) {console.error('MJ Anatomy 畫面發生錯誤', error);}
  render() {return this.state.error ? <Trouble title="這個畫面發生錯誤，請重新載入。" detail={this.state.error.message}/> : this.props.children;}
}
function App() {
  const [hash, setHash] = useState(location.hash);
  // After a deployment the JS chunks of the previous build are gone: a tab opened before it cannot load the Quiz, heart or brain screen until it reloads.
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const change = () => setHash(location.hash);
    const preloadError = (e: Event) => {e.preventDefault(); setStale(true);};
    window.addEventListener('hashchange', change);
    window.addEventListener('vite:preloadError', preloadError);
    return () => {window.removeEventListener('hashchange', change); window.removeEventListener('vite:preloadError', preloadError);};
  }, []);
  // The eye and ear detail atlases are hidden for now (ROADMAP.md): a link to one returns to the atlas.
  useEffect(() => { if (/^#\/(?:organ\/|micro\/)?(?:eye|ear)\b/.test(hash)) { history.replaceState(null, '', location.pathname + location.search); setHash(''); } }, [hash]);
  // a page may carry a query, e.g. #/organ/brain?select=<structure> from the atlas search
  const page = hash.split('?')[0];
  const quiz = regionOfHash(hash), hub = isQuizHub(hash);
  // The tab title follows the screen; going back to the atlas (also with the browser's back and forward buttons) must restore the main title.
  useEffect(() => {
    document.title = page === '#/organ/heart' ? '心臟詳細模式 · MJ Anatomy' : page === '#/organ/brain' ? '腦部詳細模式 · MJ Anatomy' : hub ? 'Quiz · MJ Anatomy' : quiz ? `${QUIZ_REGIONS[quiz].label} Quiz · MJ Anatomy` : 'MJ Anatomy｜3D 解剖圖譜';
  }, [hash, hub, quiz]);
  if (stale) return <Trouble title="網站已更新，請重新載入後再開啟這個畫面。"/>;
  return <ErrorBoundary><Suspense fallback={<div role="status" style={{padding: 32}}>正在載入 MJ Anatomy…</div>}>
    {page === '#/organ/heart' ? <HeartDetail/> : page === '#/organ/brain' ? <BrainDetail/> : hub ? <QuizHub/> : quiz ? <RegionQuiz key={quiz} region={quiz}/> : devLab() ? <SkeletonLab/> : <Home initialRegion={hash === '#/atlas/lower' ? 'lower' : hash === '#/atlas/upper' ? 'upper' : 'whole'}/>}
  </Suspense></ErrorBoundary>;
}
createRoot(document.getElementById('root')!).render(<App/>);
