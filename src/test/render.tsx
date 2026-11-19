// Renders a component inside a memory router, for components that link to routes.
import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

export function renderMetRouter(ui: ReactNode, pad = '/nl/wonen'): RenderResult {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [pad] });
  return render(<RouterProvider router={router} />);
}

/** Makes any fetch fail the test: components and pages never fetch themselves. */
export const verbodenFetch = (): never => {
  throw new Error('A component called fetch');
};
