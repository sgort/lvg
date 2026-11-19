import { useCallback, useEffect, useRef, useState } from 'react';

import { createLatestRequest } from '../lib/latestRequest';
import {
  getBuildingData,
  getContractors,
  getPersonalProperty,
  getPublicProperty,
} from '../services/propertyService';

const IDLE = { data: null, isLoading: false, error: null };
const LOADING = { data: null, isLoading: true, error: null };

// One data source with its own loading and error state. A result is applied only
// while its request is still the newest, so a slow response for an earlier
// property or session, for example personal data after logout, is dropped.
function useSource(load, enabled) {
  const [state, setState] = useState(enabled ? LOADING : IDLE);
  const guard = useRef(null);
  if (guard.current === null) guard.current = createLatestRequest();

  useEffect(() => {
    const token = guard.current.next();
    if (!enabled) {
      setState(IDLE);
      return;
    }
    setState(LOADING);
    load().then(
      (data) => {
        if (guard.current.isCurrent(token)) setState({ data, isLoading: false, error: null });
      },
      (error) => {
        if (guard.current.isCurrent(token)) {
          setState({ data: null, isLoading: false, error: error.message });
        }
      }
    );
  }, [load, enabled]);

  return state;
}

// Property data for the screens. Personal and building data need a session and
// are cleared on logout.
export function useProperty(propertyId, session) {
  const loadPublic = useCallback(() => getPublicProperty(propertyId), [propertyId]);
  const loadContractors = useCallback(() => getContractors(propertyId), [propertyId]);
  const loadPersonal = useCallback(
    () => getPersonalProperty(propertyId, session),
    [propertyId, session]
  );
  const loadBuilding = useCallback(
    () => getBuildingData(propertyId, session),
    [propertyId, session]
  );

  return {
    publicInfo: useSource(loadPublic, true),
    personalInfo: useSource(loadPersonal, Boolean(session)),
    buildingData: useSource(loadBuilding, Boolean(session)),
    contractors: useSource(loadContractors, true),
  };
}
