import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROPERTY_ID,
  getBuildingData,
  getContractors,
  getPersonalProperty,
  getPublicProperty,
} from './propertyService';

const session = { user: 'demo' };

describe('propertyService', () => {
  it('loads public data without a session', async () => {
    expect((await getPublicProperty(DEFAULT_PROPERTY_ID)).address).toBe('Lange Hilleweg 73 B');
  });

  it('refuses personal and building data without a session', async () => {
    await expect(getPersonalProperty(DEFAULT_PROPERTY_ID, null)).rejects.toThrow('Niet ingelogd');
    await expect(getBuildingData(DEFAULT_PROPERTY_ID, null)).rejects.toThrow('Niet ingelogd');
  });

  it('loads personal and building data with a session', async () => {
    expect((await getPersonalProperty(DEFAULT_PROPERTY_ID, session)).potentialSavings).toBe(
      '€ 850/jaar'
    );
    expect((await getBuildingData(DEFAULT_PROPERTY_ID, session)).gebouw.vloeroppervlakte_m2).toBe(
      120
    );
  });

  it('loads contractors', async () => {
    expect((await getContractors(DEFAULT_PROPERTY_ID))[0].name).toBe('IsolatieGroep Rotterdam');
  });

  it('rejects an unknown property', async () => {
    await expect(getPublicProperty('onbekend')).rejects.toThrow('Onbekende woning');
    await expect(getPersonalProperty('onbekend', session)).rejects.toThrow('Onbekende woning');
    await expect(getBuildingData('onbekend', session)).rejects.toThrow('Onbekende woning');
    await expect(getContractors('onbekend')).rejects.toThrow('Onbekende woning');
  });

  it('returns copies', async () => {
    (await getContractors(DEFAULT_PROPERTY_ID))[0].name = 'x';
    (await getPublicProperty(DEFAULT_PROPERTY_ID)).wozHistory[0].value = 'x';
    expect((await getContractors(DEFAULT_PROPERTY_ID))[0].name).toBe('IsolatieGroep Rotterdam');
    expect((await getPublicProperty(DEFAULT_PROPERTY_ID)).wozHistory[0].value).not.toBe('x');
  });
});
