// "Nog niet beschikbaar": where links go whose target G&B has not delivered yet, and the
// routes whose pages are built in later tasks.
import { LuxParagraph } from '@lux-design-system/components-react';

import { ContentCard } from '../components/ContentCard';
import { ChevronRechts } from '../components/icons';
import { LinkNaar } from '../components/LinkNaar';
import { PageTitle } from '../components/PageTitle';
import { HOME, KRUIMELPAD_LABEL, WONEN, WONEN_PAD } from './paginaKader';

const TITEL = 'Nog niet beschikbaar';

export function NietBeschikbaarPage() {
  return (
    <>
      <PageTitle
        titel={TITEL}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: [HOME, WONEN, { tekst: TITEL }] }}
        terug={{ tekst: 'Wonen', naar: WONEN_PAD }}
      />
      <ContentCard>
        <LuxParagraph>Deze pagina is nog in ontwikkeling.</LuxParagraph>
        <LuxParagraph>
          <LinkNaar naar={WONEN_PAD} icon={<ChevronRechts />} iconPosition="end">
            Naar Wonen
          </LinkNaar>
        </LuxParagraph>
      </ContentCard>
    </>
  );
}
