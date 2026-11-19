// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { contractExamples } from '../test/contractExamples';
import { verbodenFetch } from '../test/render';
import { Hoofdinhoud } from './Hoofdinhoud';
import { KoopwoningenPage, koopwoningenLoader } from './KoopwoningenPage';

const voorbeelden = contractExamples('listWoningen', 200);

// The list route with its real loader, which gets the contract's example instead of the API.
const toon = (weergave: 'lijst' | 'direct' | 'leeg', vanaf = '/nl/wonen/koopwoningen') => {
  // Inside Hoofdinhoud, as in the app, so the content sits in <main>.
  const router = createMemoryRouter(
    [
      {
        element: <Hoofdinhoud />,
        children: [
          { path: '/nl/wonen', element: <p>Wonen</p> },
          {
            path: '/nl/wonen/koopwoningen',
            loader: () => koopwoningenLoader(() => Promise.resolve(voorbeelden[weergave] as never)),
            element: <KoopwoningenPage />,
          },
          { path: '/nl/wonen/koopwoningen/:woningId', element: <p>Woning</p> },
        ],
      },
    ],
    { initialEntries: [vanaf] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('KoopwoningenPage', () => {
  it('lists every property as a link with its address, label and kind', async () => {
    toon('lijst');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Koopwoningen' })
    ).toBeInTheDocument();
    const lijst = screen.getByRole('list', { name: 'Uw gebouwen:' });
    const links = within(lijst).getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/nl/wonen/koopwoningen/w-7f3a');
    expect(links[0]).toHaveTextContent('Voorbeeldlaan 73 B, Rotterdam');
    expect(links[0]).toHaveTextContent('Energielabel C');
    expect(links[0]).toHaveTextContent('Koopwoning, 1990');
    await expectNoAxeViolations(document.body);
  });

  it('shows the frequently asked questions the API delivers', async () => {
    toon('lijst');

    expect(await screen.findByRole('heading', { name: 'Veelgestelde vragen' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Waarom staat mijn woning hier niet?' })
    ).toBeInTheDocument();
  });

  it('goes straight to the only property, so Back does not return to the list', async () => {
    const router = toon('direct', '/nl/wonen');

    await router.navigate('/nl/wonen/koopwoningen');
    expect(router.state.location.pathname).toBe('/nl/wonen/koopwoningen/w-7f3a');
    expect(await screen.findByText('Woning')).toBeInTheDocument();

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe('/nl/wonen');
  });

  it('says there is no property, with the way to contact the Kadaster', async () => {
    toon('leeg');

    expect(
      await screen.findByText('U heeft geen koopwoning op uw naam staan.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Klopt dit niet\? Neem contact op met het Kadaster/ })
    ).toHaveAttribute('href', 'https://www.kadaster.nl/contact');
    expect(screen.queryByRole('list', { name: 'Uw gebouwen:' })).not.toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});
