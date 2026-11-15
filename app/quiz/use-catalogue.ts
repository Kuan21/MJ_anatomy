import {useEffect, useState} from 'react';
import {fetchModelBuffer} from '../model-download';
import {QUIZ_REGIONS, type QuizCatalogue, type QuizRegionId} from './catalogue';

/** Fetches and checks the question catalogue of one region (the same file the Quiz reads). */
export async function fetchCatalogue(regionId: QuizRegionId, signal: AbortSignal = new AbortController().signal): Promise<QuizCatalogue> {
  const bytes = await fetchModelBuffer(`${import.meta.env.BASE_URL}models/${QUIZ_REGIONS[regionId].file}`, 0, false, signal);
  const data = JSON.parse(new TextDecoder().decode(bytes)) as QuizCatalogue;
  if (data.version !== 1 || !data.structures?.length || !data.packages?.length || (data.region ?? 'lower-limb') !== regionId) throw Error('Invalid quiz catalogue');
  return data;
}
/** Loads the catalogues of several regions at once (a region is fetched once and kept); `failed` lists the ones that did not load. */
export function useCatalogues(ids: QuizRegionId[]) {
  const [loaded, setLoaded] = useState<Partial<Record<QuizRegionId, QuizCatalogue>>>({}), [failed, setFailed] = useState<QuizRegionId[]>([]), [retry, setRetry] = useState(0);
  const key = ids.join(',');
  useEffect(() => {
    const abort = new AbortController();
    for (const id of ids) {
      if (loaded[id]) continue;
      void fetchCatalogue(id, abort.signal).then(c => {if (!abort.signal.aborted) {setLoaded(l => ({...l, [id]: c})); setFailed(f => f.filter(x => x !== id));}}).catch(() => {if (!abort.signal.aborted) setFailed(f => f.includes(id) ? f : [...f, id]);});
    }
    return () => abort.abort();
  }, [key, retry]); // eslint-disable-line react-hooks/exhaustive-deps
  return {loaded, failed, reload: () => {setFailed([]); setRetry(n => n + 1);}};
}

/** Loads the question catalogue of one region (the same file the Quiz reads). */
export function useCatalogue(regionId: QuizRegionId) {
  const [catalogue, setCatalogue] = useState<QuizCatalogue | null>(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const region = QUIZ_REGIONS[regionId];
  useEffect(() => {
    const abort = new AbortController();
    setError('');
    void fetchModelBuffer(`${import.meta.env.BASE_URL}models/${region.file}`, 0, false, abort.signal)
      .then(bytes => {
        const data = JSON.parse(new TextDecoder().decode(bytes)) as QuizCatalogue;
        if (data.version !== 1 || !data.structures?.length || !data.packages?.length || (data.region ?? 'lower-limb') !== regionId) throw Error('Invalid quiz catalogue');
        if (!abort.signal.aborted) setCatalogue(data);
      })
      .catch(() => {if (!abort.signal.aborted) setError('題庫未能載入，請重試。');});
    return () => abort.abort();
  }, [retry, region.file, regionId]);
  return {catalogue, error, reload: () => setRetry(n => n + 1)};
}
