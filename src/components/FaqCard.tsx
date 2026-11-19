// "Veelgestelde vragen": collapsed questions and a link to all questions.
import { LuxAccordionProvider } from '@lux-design-system/components-react';

import { ContentCard } from './ContentCard';
import { type Doel, Koppeling } from './Koppeling';
import styles from './FaqCard.module.scss';

type Props = {
  titel: string;
  vragen: { vraag: string; antwoord: string }[];
  meer?: { tekst: string; doel: Doel };
};

export function FaqCard({ titel, vragen, meer }: Props) {
  return (
    <ContentCard titel={titel}>
      {/* LUX's provider keeps its first sections; a key per content renders new ones afresh. */}
      <LuxAccordionProvider
        key={vragen.map(({ vraag }) => vraag).join('|')}
        headingLevel={3}
        sections={vragen.map(({ vraag, antwoord }) => ({ label: vraag, body: antwoord }))}
      />
      {meer && (
        <p className={styles.meer}>
          <Koppeling doel={meer.doel} pijl>
            {meer.tekst}
          </Koppeling>
        </p>
      )}
    </ContentCard>
  );
}
