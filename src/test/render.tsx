// Renders a component inside a memory router, for components that link to routes.
import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { Hoofdinhoud } from '../pages/Hoofdinhoud';

export function renderMetRouter(ui: ReactNode, pad = '/nl/wonen'): RenderResult {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [pad] });
  return render(<RouterProvider router={router} />);
}

/**
 * Renders a page on its route, inside the content column as in the app, with the given loader
 * data. Other paths render their path as text, so tests can follow links.
 */
export function renderPagina(opties: {
  patroon: string;
  pad: string;
  data: unknown;
  element: ReactNode;
}): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        element: <Hoofdinhoud />,
        children: [
          { path: opties.patroon, loader: () => opties.data, element: opties.element },
          { path: '*', element: <p>Andere pagina</p> },
        ],
      },
    ],
    { initialEntries: [opties.pad] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

/** Makes any fetch fail the test: components and pages never fetch themselves. */
export const verbodenFetch = (): never => {
  throw new Error('A component called fetch');
};
