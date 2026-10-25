import {createRoot} from 'react-dom/client';
import {lazy, Suspense, useEffect, useState} from 'react';
import '../app/globals.css';
import '../app/workspace-layout.css';
const Home = lazy(() => import('../app/page'));
const SkeletonLab = lazy(() => import('../app/biomechanics-v2/lab'));
const RegionQuiz = lazy(() => import('../app/quiz/page'));
const QuizHub = lazy(() => import('../app/quiz/hub'));
const HeartDetail = lazy(() => import('../app/organ/heart'));
import {QUIZ_REGIONS, isQuizHub, regionOfHash} from '../app/quiz/catalogue';
/** The Skeleton v2 lab is a developer preview: it opens only with ?dev=1 (optionally ?dev=1&lab=skeleton-v2) and has no link in the product. */
const devLab = () => {
  const params = new URLSearchParams(location.search);
  return params.get('dev') === '1' && (params.get('lab') ?? 'skeleton-v2') === 'skeleton-v2';
};
function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const change = () => setHash(location.hash);
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const quiz = regionOfHash(hash), hub = isQuizHub(hash);
  useEffect(() => {document.title = quiz ? `${QUIZ_REGIONS[quiz].label} Quiz · MJ Anatomy` : 'MJ Anatomy';}, [quiz]);
  return <Suspense fallback={<div role="status" style={{padding: 32}}>正在載入 MJ Anatomy…</div>}>
    {hash === '#/organ/heart' ? <HeartDetail/> : hub ? <QuizHub/> : quiz ? <RegionQuiz key={quiz} region={quiz}/> : devLab() ? <SkeletonLab/> : <Home initialRegion={hash === '#/atlas/lower' ? 'lower' : hash === '#/atlas/upper' ? 'upper' : 'whole'}/>}
  </Suspense>;
}
createRoot(document.getElementById('root')!).render(<App/>);
