// GET /wonen: the landing cards. The API decides which cards appear and where they lead.
import { json } from '../core/http.js';
import { PLACEHOLDER_HREF } from './shared.js';

export async function getWonen() {
  return json(200, {
    kaarten: [
      {
        id: 'berichten-over-uw-buurt',
        titel: 'Berichten over uw Buurt',
        bron: 'Officiële Bekendmakingen',
        tekst:
          'U vindt hier berichten over vergunningen in uw buurt, zoals evenementen en bouwplannen. Ook vindt u de bekendmakingen van nieuwe regelgeving.',
        actie: {
          type: 'berichten-over-uw-buurt',
          // Placeholder until the real target in MijnOverheid is known.
          href: 'https://www.officielebekendmakingen.nl/',
          tekst: 'Berichten over uw Buurt',
        },
      },
      {
        id: 'woningeigenaar',
        titel: 'Ik ben woningeigenaar',
        bron: 'LVG',
        tekst: '{Ingang LVG}',
        actie: {
          type: 'bekijk-koopwoningen',
          href: '/api/v1/woningen',
          tekst: 'Bekijk koopwoningen',
        },
      },
      {
        id: 'huurder',
        titel: 'Ik ben huurder',
        bron: 'LVG',
        tekst: '{intro}',
        // Rental properties are out of scope: the page shows "Nog niet beschikbaar".
        actie: {
          type: 'bekijk-huurwoningen',
          href: PLACEHOLDER_HREF,
          tekst: 'Bekijk huurwoningen',
        },
      },
    ],
  });
}
