import { useMemo, useEffect } from 'react';
import { useODI } from 'meridian/src/store/odi.store';
import type { FetchedODI } from 'meridian/src/spec/spec.internal';
import { useFeaturesStore } from '@/store/featuresStore';
import { generateNotesODI } from '@/lib/meridian/dynamicBinding';

export function useDynamicODI() {
  const { enabledFeatures } = useFeaturesStore();
  const { setODI } = useODI();

  const odi = useMemo(() => {
    return generateNotesODI(enabledFeatures);
  }, [enabledFeatures]);

  useEffect(() => {
    setODI(odi as Partial<FetchedODI>);
  }, [odi, setODI]);

  return { odi };
}

