// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../test/axe';
import { contractExample } from '../test/contractExamples';
import { renderPagina, verbodenFetch } from '../test/render';
import { EnergielabelPage } from './EnergielabelPage';

type Voorbeeld = Record<string, unknown>;
const voorbeeld = () => structuredClone(contractExample('getEnergielabel', 200)) as Voorbeeld;

const toon = (data: unknown = voorbeeld()) =>
  renderPagina({
    patroon: '/nl/wonen/koopwoningen/:woningId/energielabel',
    pad: '/nl/wonen/koopwoningen/w-7f3a/energielabel',
    data,
    element: <EnergielabelPage />,
  });

beforeEach(() => {
  vi.stubGlobal('fetch', verbodenFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EnergielabelPage', () => {
  it('shows the label of the property with its documents and dates', async () => {
    toon();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Energielabel' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Energielabel van uw woning' })).toBeInTheDocument();
    expect(screen.getByText('Uw woning heeft energielabel C')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Energielabel C 3000SS 73 B \(pdf\)/ })
    ).toHaveAttribute('href', '/nl/wonen/nog-niet-beschikbaar');
    const lijst = document.querySelector('dl')!;
    expect(lijst).toHaveTextContent('Registratiedatum4 februari 2021');
    expect(lijst).toHaveTextContent('Geldig tot6 december 2030');
    expect(screen.getByRole('link', { name: /Bekijk uw ISDE-gegevens/ })).toHaveAttribute(
      'href',
      'https://www.rvo.nl/subsidies-financiering/isde'
    );
  });

  it('offers the roof insulation advice when the API offers it', async () => {
    toon();

    expect(
      await screen.findByRole('heading', { name: 'Uw woning verduurzamen' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Bekijk advies dakisolatie/ })).toHaveAttribute(
      'href',
      '/nl/wonen/koopwoningen/w-7f3a/energielabel/dakisolatie'
    );
  });

  it('shows no Verduurzamen card without that action', async () => {
    toon({ ...voorbeeld(), acties: [] });
    await screen.findByRole('heading', { level: 1 });

    expect(
      screen.queryByRole('heading', { name: 'Uw woning verduurzamen' })
    ).not.toBeInTheDocument();
  });

  it("uses the API's object designation for a building", async () => {
    toon({ ...voorbeeld(), objectAanduiding: 'gebouw' });

    expect(
      await screen.findByRole('heading', { name: 'Energielabel van uw gebouw' })
    ).toBeInTheDocument();
    expect(screen.getByText('Uw gebouw heeft energielabel C')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    toon();
    await screen.findByRole('heading', { level: 1 });

    await expectNoAxeViolations(document.body);
  });
});
