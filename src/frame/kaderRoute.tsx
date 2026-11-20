// The frame as a layout route around the content routes. Its loader reads the chosen scenario
// (through the API client, outside rendering) on every navigation; after a change the switch
// navigates to Koopwoningen, so that page and the switch show the new scenario.
import { Outlet, type RouteObject, useLoaderData } from 'react-router';

import { gekozenScenario } from '../api/client';
import { LoadState } from '../components/LoadState';
import { StandInFrame } from './StandInFrame';

function Kader({ scenarioKeuze }: { scenarioKeuze?: boolean }) {
  const { scenario } = useLoaderData<{ scenario: string }>();
  return (
    <StandInFrame scenario={scenario} scenarioKeuze={scenarioKeuze}>
      <Outlet />
    </StandInFrame>
  );
}

export function kaderRoute(
  children: RouteObject[],
  { scenarioKeuze }: { scenarioKeuze?: boolean } = {}
): RouteObject {
  return {
    id: 'kader',
    loader: () => ({ scenario: gekozenScenario() }),
    // Read again on every navigation, so the switch shows the scenario just chosen.
    shouldRevalidate: () => true,
    // Until the first loaders finish nothing else can render, frame included.
    hydrateFallbackElement: (
      <main>
        <LoadState tekst="Gegevens laden…" />
      </main>
    ),
    element: <Kader scenarioKeuze={scenarioKeuze} />,
    children,
  };
}
