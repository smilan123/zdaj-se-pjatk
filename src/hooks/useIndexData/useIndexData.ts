import { useMemo } from 'react';

import { useErrorHandler } from 'hooks/useErrorHandler/useErrorHandler';
import { useFetch } from 'hooks/useFetch/useFetch';
import { useUpdatedAt } from 'hooks/useUpdatedAt/useUpdatedAt';
import { Pages, pagesSchema } from 'validators/pages';
import { getDataWithOverrides } from './useIndexData.utils';

interface UseSubjectDataLoading {
  state: 'loading';
}

interface UseSubjectDataDone {
  state: 'done';
  data: Pages;
}

type UseSubjectData = UseSubjectDataLoading | UseSubjectDataDone;

export const useIndexData = (): UseSubjectData => {
  const errorHandler = useErrorHandler();
  const { setUpdatedAt } = useUpdatedAt();

  const fetchOptions = useMemo(
    () => ({
      onComplete: (data: Pages) => setUpdatedAt(data.updatedAt),
      onError: errorHandler,
    }),
    [errorHandler, setUpdatedAt],
  );

  const { data: pages, loading: pagesLoading } = useFetch(
    'index.json',
    pagesSchema,
    {
      onComplete: (data) => setUpdatedAt(data.updatedAt),
      onError: errorHandler,
    },
  );

  const { data: overrides, loading: overridesLoading } = useFetch(
    `overrides/index.json`,
    pagesSchema,
    fetchOptions,
  );

  const loading = useMemo(
    () => pagesLoading || overridesLoading,
    [overridesLoading, pagesLoading],
  );

  return useMemo(() => {
    if (loading || pages === null) {
      return {
        state: 'loading',
      };
    }

    return {
      state: 'done',
      data: getDataWithOverrides(pages, overrides),
    };
  }, [loading, overrides, pages]);
};