// "Veelgestelde vragen": collapsed questions and a link to all questions.
import { LuxAccordionProvider } from '@lux-design-system/components-react';

import { ContentCard } from './ContentCard';
import { ChevronRechts } from './icons';
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
      <LuxAccordionProvider
        headingLevel={3}
        sections={vragen.map(({ vraag, antwoord }) => ({ label: vraag, body: antwoord }))}
      />
      {meer && (
        <p className={styles.meer}>
          <Koppeling doel={meer.doel} icon={<ChevronRechts />}>
            {meer.tekst}
          </Koppeling>
        </p>
      )}
    </ContentCard>
  );
}
