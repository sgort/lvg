// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { contractExample } from '../test/contractExamples';
import { verbodenFetch } from '../test/render';
import { Hoofdinhoud } from './Hoofdinhoud';
import { WonenPage } from './WonenPage';

const toon = () => {
  const router = createMemoryRouter(
    [
      {
        element: <Hoofdinhoud />,
        children: [
          {
            path: '/nl/wonen',
            loader: () => contractExample('getWonen', 200),
            element: <WonenPage />,
          },
        ],
      },
    ],
    { initialEntries: ['/nl/wonen'] }
  );
  render(<RouterProvider router={router} />);
};

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WonenPage', () => {
  it('shows the cards the API delivers, each with its source and button', async () => {
    toon();

    expect(await screen.findByRole('heading', { level: 1, name: 'Wonen' })).toBeInTheDocument();
    const kaarten = screen.getAllByRole('region');
    expect(kaarten.map((kaart) => within(kaart).getByRole('heading').textContent)).toEqual([
      'Berichten over uw Buurt',
      'Ik ben woningeigenaar',
      'Ik ben huurder',
    ]);
    expect(within(kaarten[0]!).getByText('Bron: Officiële Bekendmakingen')).toBeInTheDocument();
    expect(within(kaarten[1]!).getByText('{Ingang LVG}')).toBeInTheDocument();
  });

  it('sends each button where its action leads', async () => {
    toon();

    expect(await screen.findByRole('link', { name: /Berichten over uw Buurt/ })).toHaveAttribute(
      'href',
      'https://www.officielebekendmakingen.nl/'
    );
    expect(screen.getByRole('link', { name: /Bekijk koopwoningen/ })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen'
    );
    expect(screen.getByRole('link', { name: /Bekijk huurwoningen/ })).toHaveAttribute(
      'href',
      '/nl/wonen/nog-niet-beschikbaar'
    );
  });

  it('has no axe violations', async () => {
    toon();
    await screen.findByRole('heading', { level: 1 });

    await expectNoAxeViolations(document.body);
  });
});
