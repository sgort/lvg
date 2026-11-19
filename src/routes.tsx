// The route table of the spec ("Information architecture"). Loaders fetch through src/api/;
// pages only present what they get. Routes whose page comes in a later task show
// "Nog niet beschikbaar" for now.
import { type LoaderFunctionArgs, redirect, type RouteObject } from 'react-router';

import { NIET_BESCHIKBAAR_PAD } from './api/acties';
import { ApiError } from './api/client';
import {
  haalAannemers,
  haalDakisolatie,
  haalEnergielabel,
  haalKadaster,
  haalToestemming,
  haalWoning,
  haalWoningen,
  haalWonen,
  haalWoz,
} from './api/wonen';
import { LoadState } from './components/LoadState';
import { Hoofdinhoud } from './pages/Hoofdinhoud';
import { NietBeschikbaarPage } from './pages/NietBeschikbaarPage';
import { NietGevondenPage } from './pages/NietGevondenPage';
import { RouteFout } from './pages/RouteFout';

// A route parameter the path guarantees; its absence means the path did not match.
function parameter(params: LoaderFunctionArgs['params'], naam: string): string {
  const waarde = params[naam];
  if (!waarde) {
    throw new ApiError({ status: 404, title: 'Niet gevonden', burgerActie: 'Ga naar Wonen.' });
  }
  return waarde;
}

const woning = ({ params }: LoaderFunctionArgs) => parameter(params, 'woningId');

const placeholder = <NietBeschikbaarPage />;

/** Shown while the first page's data loads, before anything else can render. */
export const eersteLaden = (
  <main>
    <LoadState tekst="Gegevens laden…" />
  </main>
);

export const routes: RouteObject[] = [
  {
    element: <Hoofdinhoud />,
    hydrateFallbackElement: eersteLaden,
    children: [
      {
        errorElement: <RouteFout />,
        children: [
          { path: '/', loader: () => redirect('/nl/wonen') },
          { path: '/nl/wonen', loader: () => haalWonen(), element: placeholder },
          { path: '/nl/wonen/koopwoningen', loader: () => haalWoningen(), element: placeholder },
          {
            path: '/nl/wonen/koopwoningen/:woningId',
            loader: (args) => haalWoning(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/kadaster',
            loader: (args) => haalKadaster(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/woz',
            loader: (args) => haalWoz(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/energielabel',
            loader: (args) => haalEnergielabel(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/energielabel/dakisolatie',
            loader: (args) => haalDakisolatie(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/energielabel/dakisolatie/aannemer',
            loader: (args) => haalAannemers(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/energielabel/dakisolatie/toestemming',
            loader: (args) => haalAannemers(woning(args)),
            element: placeholder,
          },
          {
            path: '/nl/wonen/koopwoningen/:woningId/energielabel/dakisolatie/toestemming/:kenmerk',
            loader: ({ params }) => haalToestemming(parameter(params, 'kenmerk')),
            element: placeholder,
          },
          { path: NIET_BESCHIKBAAR_PAD, element: <NietBeschikbaarPage /> },
          { path: '*', element: <NietGevondenPage /> },
        ],
      },
    ],
  },
];
