import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import SkeletonLab from '../app/biomechanics-v2/lab';
import '../app/globals.css';
import '../app/workspace-layout.css';
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('lab')==='skeleton-v2'?<SkeletonLab/>:<Home/>);
