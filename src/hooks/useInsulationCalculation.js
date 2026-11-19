import { useCallback, useRef, useState } from 'react';

import { createLatestRequest } from '../lib/latestRequest';
import { buildInsulationParams } from '../services/insulationParams';
import { fetchAllCalculations } from '../services/operatonService';

// State of the roof insulation flow: consent, contractor and the calculation.
export function useInsulationCalculation() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [showCalculations, setShowCalculations] = useState(false);
  const [calculations, setCalculations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const guard = useRef(null);
  if (guard.current === null) guard.current = createLatestRequest();

  // Everything opening the modal resets. A calculation still running is dropped.
  const reset = useCallback(() => {
    guard.current.next();
    setConsentGiven(false);
    setSelectedContractor('');
    setShowCalculations(false);
    setCalculations(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const requestCalculation = useCallback(
    async (buildingData) => {
      if (!consentGiven || !selectedContractor) return;
      const token = guard.current.next();
      setShowCalculations(true);
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchAllCalculations(buildInsulationParams(buildingData));
        if (guard.current.isCurrent(token)) setCalculations(result);
      } catch (err) {
        console.error('Failed to fetch calculations:', err);
        if (guard.current.isCurrent(token)) setError(err.message);
      } finally {
        if (guard.current.isCurrent(token)) setIsLoading(false);
      }
    },
    [consentGiven, selectedContractor]
  );

  return {
    consentGiven,
    setConsentGiven,
    selectedContractor,
    setSelectedContractor,
    showCalculations,
    calculations,
    isLoading,
    error,
    reset,
    requestCalculation,
  };
}
