// Inputs for the bereken_isolatie_opties decision. The cost figures are fixed
// assumptions until a real source provides them.
const LAMBDA_W_MK = 0.035;
const MATERIAAL_COST_PER_M3 = 80;
const INSTALL_COST_PER_M2_PER_100MM = 25;

export const buildInsulationParams = (buildingData) => ({
  huidige_r_waarde: buildingData.bestaande_isolatie.R_waarde_m2K_per_W,
  dak_oppervlakte_m2: buildingData.gebouw.vloeroppervlakte_m2,
  lambda_w_mk: LAMBDA_W_MK,
  materiaal_cost_per_m3: MATERIAAL_COST_PER_M3,
  install_cost_per_m2_per_100mm: INSTALL_COST_PER_M2_PER_100MM,
});
