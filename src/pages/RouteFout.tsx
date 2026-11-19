// What a route shows when its loader fails: "not found" for a 404, otherwise the API's title
// and next step in an error card, with a retry that runs the loader again.
import { isRouteErrorResponse, useParams, useRevalidator, useRouteError } from 'react-router';

import { ApiError } from '../api/client';
import { ContentCard } from '../components/ContentCard';
import { ErrorState } from '../components/ErrorState';
import { PageTitle } from '../components/PageTitle';
import { NietGevondenPage } from './NietGevondenPage';
import { HOME, KRUIMELPAD_LABEL, WONEN, WONEN_PAD } from './paginaKader';

const TITEL = 'Er ging iets mis';
const LATER_OPNIEUW = 'Probeer het later opnieuw.';

export function RouteFout() {
  const fout = useRouteError();
  const { woningId } = useParams();
  const revalidator = useRevalidator();

  const status =
    fout instanceof ApiError ? fout.status : isRouteErrorResponse(fout) ? fout.status : 500;
  if (status === 404) return <NietGevondenPage soort={woningId ? 'woning' : 'pagina'} />;

  return (
    <>
      <PageTitle
        titel={TITEL}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: [HOME, WONEN, { tekst: TITEL }] }}
        terug={{ tekst: 'Wonen', naar: WONEN_PAD }}
      />
      <ContentCard>
        <ErrorState
          titel={fout instanceof ApiError ? fout.title : TITEL}
          burgerActie={fout instanceof ApiError ? fout.burgerActie : LATER_OPNIEUW}
          opnieuwTekst="Probeer opnieuw"
          onOpnieuw={() => void revalidator.revalidate()}
        />
      </ContentCard>
    </>
  );
}
