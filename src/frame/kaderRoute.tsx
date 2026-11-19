// The frame as a layout route around the content routes. Its loader reads the chosen scenario
// (through the API client, outside rendering); revalidating after a change reruns it and every
// content loader, so the pages reload for the new scenario.
import { Outlet, type RouteObject, useLoaderData } from 'react-router';

import { gekozenScenario } from '../api/client';
import { StandInFrame } from './StandInFrame';

function Kader() {
  const { scenario } = useLoaderData<{ scenario: string }>();
  return (
    <StandInFrame scenario={scenario}>
      <Outlet />
    </StandInFrame>
  );
}

export function kaderRoute(children: RouteObject[]): RouteObject {
  return {
    id: 'kader',
    loader: () => ({ scenario: gekozenScenario() }),
    element: <Kader />,
    children,
  };
}
