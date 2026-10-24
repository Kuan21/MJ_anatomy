import {createRoot} from 'react-dom/client';
import {lazy, Suspense, useEffect, useState} from 'react';
import '../app/globals.css';
import '../app/workspace-layout.css';
const Home = lazy(() => import('../app/page'));
const SkeletonLab = lazy(() => import('../app/biomechanics-v2/lab'));
const RegionQuiz = lazy(() => import('../app/quiz/page'));
import {QUIZ_REGIONS, regionOfHash} from '../app/quiz/catalogue';
function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const change = () => setHash(location.hash);
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const quiz = regionOfHash(hash);
  useEffect(() => {document.title = quiz ? `${QUIZ_REGIONS[quiz].label} Quiz · MJ Anatomy` : 'MJ Anatomy';}, [quiz]);
  return <Suspense fallback={<div role="status" style={{padding: 32}}>正在載入 MJ Anatomy…</div>}>
    {quiz ? <RegionQuiz key={quiz} region={quiz}/> : new URLSearchParams(location.search).get('lab') === 'skeleton-v2' ? <SkeletonLab/> : <Home initialRegion={hash === '#/atlas/lower' ? 'lower' : hash === '#/atlas/upper' ? 'upper' : 'whole'}/>}
  </Suspense>;
}
createRoot(document.getElementById('root')!).render(<App/>);
