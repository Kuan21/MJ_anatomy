import {createRoot} from 'react-dom/client';
import {lazy, Suspense, useEffect, useState} from 'react';
import '../app/globals.css';
import '../app/workspace-layout.css';
const Home = lazy(() => import('../app/page'));
const SkeletonLab = lazy(() => import('../app/biomechanics-v2/lab'));
const LowerLimbQuiz = lazy(() => import('../app/quiz/page'));
function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const change = () => setHash(location.hash);
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const quiz = hash === '#/quiz/lower-limb';
  useEffect(() => {document.title = quiz ? '下肢 Quiz · MJ Anatomy' : 'MJ Anatomy';}, [quiz]);
  return <Suspense fallback={<div role="status" style={{padding: 32}}>正在載入 MJ Anatomy…</div>}>
    {quiz ? <LowerLimbQuiz/> : new URLSearchParams(location.search).get('lab') === 'skeleton-v2' ? <SkeletonLab/> : <Home initialRegion={hash === '#/atlas/lower' ? 'lower' : 'whole'}/>}
  </Suspense>;
}
createRoot(document.getElementById('root')!).render(<App/>);
