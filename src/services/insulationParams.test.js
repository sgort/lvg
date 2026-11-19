import { describe, expect, it } from 'vitest';

import { buildInsulationParams } from './insulationParams';
import { DEFAULT_PROPERTY_ID, getBuildingData } from './propertyService';

describe('buildInsulationParams', () => {
  it("builds today's parameters from the building data", async () => {
    const buildingData = await getBuildingData(DEFAULT_PROPERTY_ID, { user: 'demo' });
    expect(buildInsulationParams(buildingData)).toEqual({
      huidige_r_waarde: 2.8,
      dak_oppervlakte_m2: 120,
      lambda_w_mk: 0.035,
      materiaal_cost_per_m3: 80,
      install_cost_per_m2_per_100mm: 25,
    });
  });
});
