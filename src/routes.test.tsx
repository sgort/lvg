// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from './routes';
import { expectNoAxeViolations } from './test/axe';
import { contractExample } from './test/contractExamples';

const json = (status: number, body: unknown, type = 'application/json') =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': type } })
  );

// Answers each API path with the contract's example for it.
const api = vi.fn((url: string) => {
  if (url === '/api/v1/wonen') return json(200, contractExample('getWonen', 200));
  if (url === '/api/v1/woningen') return json(200, contractExample('listWoningen', 200));
  return json(404, contractExample('getWoning', 404), 'application/problem+json');
});

const toon = (pad: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [pad] });
  render(<RouterProvider router={router} />);
  return router;
};

afterEach(() => {
  vi.unstubAllGlobals();
  api.mockClear();
});

describe('routes', () => {
  it('sends / to Wonen', async () => {
    vi.stubGlobal('fetch', api);

    const router = toon('/');

    await screen.findByRole('heading', { level: 1 });
    expect(router.state.location.pathname).toBe('/nl/wonen');
    expect(api).toHaveBeenCalledWith('/api/v1/wonen', expect.anything());
  });

  it('shows "Pagina niet gevonden" for an unknown path', async () => {
    vi.stubGlobal('fetch', api);

    toon('/nl/bestaat-niet');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pagina niet gevonden' })
    ).toBeInTheDocument();
    expect(screen.getByText('Deze pagina bestaat niet (meer).')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Naar Wonen/ })).toHaveAttribute('href', '/nl/wonen');
    await expectNoAxeViolations(document.body);
  });

  it('shows "Deze woning is niet gevonden" when the API answers 404', async () => {
    vi.stubGlobal('fetch', api);

    toon('/nl/wonen/koopwoningen/w-0000');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Deze woning is niet gevonden' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Naar Koopwoningen/ })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen'
    );
  });

  it("shows the API's next step and retries when asked", async () => {
    const user = userEvent.setup();
    const kapot = vi.fn(() =>
      json(
        503,
        {
          type: 'about:blank',
          title: 'Gegevens niet beschikbaar',
          status: 503,
          burgerActie: 'Probeer het later opnieuw.',
        },
        'application/problem+json'
      )
    );
    vi.stubGlobal('fetch', kapot);

    toon('/nl/wonen/koopwoningen');

    expect(await screen.findByText('Probeer het later opnieuw.')).toBeInTheDocument();
    expect(screen.getByText('Gegevens niet beschikbaar')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Probeer opnieuw' }));
    expect(kapot).toHaveBeenCalledTimes(2);
    await expectNoAxeViolations(document.body);
  });

  it('shows "Nog niet beschikbaar" for a placeholder link', async () => {
    vi.stubGlobal('fetch', api);

    toon('/nl/wonen/nog-niet-beschikbaar');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Nog niet beschikbaar' })
    ).toBeInTheDocument();
    expect(screen.getByText('Deze pagina is nog in ontwikkeling.')).toBeInTheDocument();
  });
});
