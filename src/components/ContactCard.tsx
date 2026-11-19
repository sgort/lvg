// "Contactinformatie": the organisation, its website and its e-mail address.
import { LuxLink } from '@lux-design-system/components-react';

import { ContentCard } from './ContentCard';
import { type Doel, Koppeling } from './Koppeling';
import styles from './ContactCard.module.scss';

type Props = {
  titel: string;
  organisatie: string;
  website?: { tekst: string; doel: Doel };
  email?: string;
};

export function ContactCard({ titel, organisatie, website, email }: Props) {
  return (
    <ContentCard titel={titel}>
      <ul className={styles.lijst}>
        <li>{organisatie}</li>
        {website && (
          <li>
            <Koppeling doel={website.doel}>{website.tekst}</Koppeling>
          </li>
        )}
        {email && (
          <li>
            <LuxLink href={`mailto:${email}`}>{email}</LuxLink>
          </li>
        )}
      </ul>
    </ContentCard>
  );
}
