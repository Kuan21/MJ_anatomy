import {useEffect, useState} from 'react';
import {fetchModelBuffer} from '../model-download';
import {QUIZ_REGIONS, type QuizCatalogue, type QuizRegionId} from './catalogue';

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
