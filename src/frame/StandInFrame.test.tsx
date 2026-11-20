// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SCENARIO_SLEUTEL } from '../api/client';
import { expectNoAxeViolations } from '../test/axe';
import { kaderRoute } from './kaderRoute';
import { StandInFrame } from './StandInFrame';

const BAND = 'Nagebootst MijnOverheid-kader. Geen onderdeel van de oplevering.';

const opgeslagen = new Map<string, string>();
const opslag = {
  getItem: vi.fn((sleutel: string) => opgeslagen.get(sleutel) ?? null),
  setItem: vi.fn((sleutel: string, waarde: string) => void opgeslagen.set(sleutel, waarde)),
};

const inhoudLoader = vi.fn(() => null);

// Without scenarioKeuze the frame uses its own default.
const toon = (pad = '/nl/wonen', scenarioKeuze?: boolean) => {
  const router = createMemoryRouter(
    [
      kaderRoute(
        [
          {
            path: '*',
            loader: inhoudLoader,
            element: (
              <main>
                <p>Inhoud</p>
              </main>
            ),
          },
        ],
        { scenarioKeuze }
      ),
    ],
    { initialEntries: [pad] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

beforeEach(() => {
  opgeslagen.clear();
  vi.stubGlobal('sessionStorage', opslag);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('StandInFrame', () => {
  it('marks itself as a stand-in and shows the content in it', async () => {
    toon();

    expect(await screen.findByText(BAND)).toBeInTheDocument();
    expect(screen.getByText('Inhoud')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wonen' })).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations(document.body);
  });

  it('shows mock content instead of placeholders', async () => {
    toon();

    expect(await screen.findByText(BAND)).toBeInTheDocument();
    expect(screen.getByText('R. Janssen')).toBeInTheDocument();
    expect(screen.getByText('Over deze site')).toBeInTheDocument();
    expect(screen.getByText('Meldpunt Fouten in Overheidsregistraties')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/{[A-Za-z][^{}]*}/);
  });

  it('shows only the content with ?kader=uit', async () => {
    toon('/nl/wonen?kader=uit');

    expect(await screen.findByText('Inhoud')).toBeInTheDocument();
    expect(screen.queryByText(BAND)).not.toBeInTheDocument();
  });

  it('shows the scenario switch, set to the default of one property', async () => {
    toon();

    expect(await screen.findByRole('combobox', { name: 'Scenario' })).toHaveValue('een-woning');
  });

  it('keeps the chosen scenario and goes to Koopwoningen, where the scenarios differ', async () => {
    const user = userEvent.setup();
    const router = toon('/nl/wonen/koopwoningen/w-7f3a', true);
    const keuze = await screen.findByRole('combobox', { name: 'Scenario' });
    expect(keuze).toHaveValue('een-woning');
    const geladen = inhoudLoader.mock.calls.length;

    await user.selectOptions(keuze, 'drie-woningen');

    expect(opslag.setItem).toHaveBeenCalledWith(SCENARIO_SLEUTEL, 'drie-woningen');
    await vi.waitFor(() => expect(inhoudLoader.mock.calls.length).toBeGreaterThan(geladen));
    expect(router.state.location.pathname).toBe('/nl/wonen/koopwoningen');
    expect(screen.getByRole('combobox', { name: 'Scenario' })).toHaveValue('drie-woningen');
  });

  it('reads no browser storage while rendering', () => {
    const router = createMemoryRouter(
      [
        {
          path: '*',
          element: (
            <StandInFrame scenario="geen-woning" scenarioKeuze>
              Inhoud
            </StandInFrame>
          ),
        },
      ],
      { initialEntries: ['/nl/wonen'] }
    );
    // Creating the router reads React Router's own key; only rendering is measured.
    opslag.getItem.mockClear();

    render(<RouterProvider router={router} />);

    expect(opslag.getItem).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox', { name: 'Scenario' })).toHaveValue('geen-woning');
  });

  it('provides a fallback for the first load, so React Router does not warn', () => {
    expect(kaderRoute([]).hydrateFallbackElement).toBeDefined();
  });

  it('shows "local build" without build variables', async () => {
    vi.stubEnv('VITE_BUILD_SHA', '');
    vi.stubEnv('VITE_BUILD_RUN', '');
    toon();

    expect(await screen.findByText(/local build/)).toBeInTheDocument();
  });
});
