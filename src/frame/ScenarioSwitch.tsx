// The development scenario: which simulated citizen the API answers for. The choice is kept
// in sessionStorage (a scenario name only) and written here, in the change handler. The
// current value comes in as a prop from the frame's loader, never from storage in render.
import { useId } from 'react';
import { useRevalidator } from 'react-router';

import { SCENARIO_SLEUTEL } from '../api/client';
import styles from './StandInFrame.module.scss';

const SCENARIOS = [
  { waarde: 'geen-woning', tekst: 'Geen woning' },
  { waarde: 'een-woning', tekst: 'Eén woning' },
  { waarde: 'drie-woningen', tekst: 'Drie woningen' },
];

export function ScenarioSwitch({ scenario }: { scenario: string }) {
  const id = useId();
  const revalidator = useRevalidator();

  const kies = (waarde: string) => {
    try {
      sessionStorage.setItem(SCENARIO_SLEUTEL, waarde);
    } catch {
      // Storage may be blocked; the scenario then stays the default.
    }
    void revalidator.revalidate();
  };

  return (
    <span className={styles.scenario}>
      <label htmlFor={id}>Scenario</label>
      <select id={id} value={scenario} onChange={(event) => kies(event.target.value)}>
        {SCENARIOS.map(({ waarde, tekst }) => (
          <option key={waarde} value={waarde}>
            {tekst}
          </option>
        ))}
      </select>
    </span>
  );
}
