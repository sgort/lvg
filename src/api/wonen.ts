// One function per API operation, each returning validated data. Loaders and actions call
// these; nothing else in the front-end knows API paths.
import { apiGet, apiPost } from './client';
import {
  AannemersOverzicht,
  Dakisolatie,
  Energielabel,
  Kadaster,
  Toestemming,
  type ToestemmingAanvraag,
  Woning,
  WoningenOverzicht,
  Wonen,
  Woz,
} from './schemas';

const woning = (woningId: string, deel = '') => `/woningen/${encodeURIComponent(woningId)}${deel}`;

export const haalWonen = () => apiGet('/wonen', Wonen);

export const haalWoningen = () => apiGet('/woningen', WoningenOverzicht);

export const haalWoning = (woningId: string) => apiGet(woning(woningId), Woning);

export const haalKadaster = (woningId: string) => apiGet(woning(woningId, '/kadaster'), Kadaster);

export const haalWoz = (woningId: string) => apiGet(woning(woningId, '/woz'), Woz);

export const haalEnergielabel = (woningId: string) =>
  apiGet(woning(woningId, '/energielabel'), Energielabel);

export const haalDakisolatie = (woningId: string) =>
  apiGet(woning(woningId, '/dakisolatie'), Dakisolatie);

export const haalAannemers = (woningId: string) =>
  apiGet(woning(woningId, '/aannemers'), AannemersOverzicht);

export const geefToestemming = (woningId: string, aanvraag: ToestemmingAanvraag) =>
  apiPost(woning(woningId, '/toestemmingen'), aanvraag, Toestemming);

export const haalToestemming = (kenmerk: string) =>
  apiGet(`/toestemmingen/${encodeURIComponent(kenmerk)}`, Toestemming);
