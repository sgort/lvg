// src/services/operatonService.js
// Service for calling Operaton DMN API

const getBaseUrl = () => {
  // Production: Direct connection to Operaton (CORS enabled)
  if (import.meta.env.PROD) {
    return "https://operaton.open-regels.nl/engine-rest";
  }

  // Development: Use Vite proxy
  return "/api/engine-rest";
};

const OPERATON_CONFIG = {
  baseUrl: getBaseUrl(),
  decisionKey: "bereken_isolatie_opties",
  auth: {
    username: import.meta.env.VITE_OPERATON_USER || "demo",
    password: import.meta.env.VITE_OPERATON_PASSWORD || "demo",
  },
};

/**
 * Evaluate insulation options for a given target R-value
 * @param {Object} params - Evaluation parameters
 * @param {number} params.huidige_r_waarde - Current R-value
 * @param {number} params.dak_oppervlakte_m2 - Roof surface area
 * @param {number} params.lambda_w_mk - Thermal conductivity
 * @param {number} params.materiaal_cost_per_m3 - Material cost per m³
 * @param {number} params.install_cost_per_m2_per_100mm - Installation cost
 * @param {number} params.doel_r_waarde - Target R-value
 * @returns {Promise<Object>} DMN evaluation result
 */
export const evaluateInsulation = async (params) => {
  const auth = btoa(
    `${OPERATON_CONFIG.auth.username}:${OPERATON_CONFIG.auth.password}`,
  );

  try {
    const response = await fetch(
      `${OPERATON_CONFIG.baseUrl}/decision-definition/key/${OPERATON_CONFIG.decisionKey}/evaluate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          variables: {
            huidige_r_waarde: {
              value: params.huidige_r_waarde,
              type: "Double",
            },
            dak_oppervlakte_m2: {
              value: params.dak_oppervlakte_m2,
              type: "Double",
            },
            lambda_w_mk: {
              value: params.lambda_w_mk,
              type: "Double",
            },
            materiaal_cost_per_m3: {
              value: params.materiaal_cost_per_m3,
              type: "Integer",
            },
            install_cost_per_m2_per_100mm: {
              value: params.install_cost_per_m2_per_100mm,
              type: "Integer",
            },
            doel_r_waarde: {
              value: params.doel_r_waarde,
              type: "Double",
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `DMN evaluation failed (${response.status}): ${errorText}`,
      );
    }

    const result = await response.json();
    return result[0]; // Return first result from COLLECT hit policy
  } catch (error) {
    console.error("Operaton API error:", error);
    throw error;
  }
};

/**
 * Transform Operaton result to UI format
 * @param {Object} operatonResult - Result from Operaton DMN
 * @param {number} targetRValue - Target R-value for this calculation
 * @param {number} dakOppervlakte - Roof surface area
 * @returns {Object} Transformed result for UI
 */
export const transformOperatonResult = (
  operatonResult,
  targetRValue,
  dakOppervlakte,
) => {
  const getValue = (field) => operatonResult[field]?.value || 0;

  const totaleKosten = getValue("totale_kosten");

  return {
    doel_R: targetRValue,
    delta_R: getValue("delta_r"),
    extra_dikte_mm: getValue("extra_dikte_mm"),
    kost_per_m2_eur: dakOppervlakte > 0 ? totaleKosten / dakOppervlakte : 0,
    totale_kost_eur: totaleKosten,
    subsidie_eur: getValue("subsidie"),
    netto_kost_eur: getValue("netto_kosten"),
    jaarlijkse_besparing_eur: getValue("besparing_jaar"),
    terugverdientijd_jaar: getValue("terugverdientijd"),
    aanbeveling: operatonResult.aanbeveling?.value || "",
  };
};

/**
 * Fetch all insulation calculations for R-values 3.0, 4.0, 6.0, 8.0
 * @param {Object} baseParams - Base evaluation parameters
 * @returns {Promise<Object>} Complete calculations object for UI
 */
export const fetchAllCalculations = async (baseParams) => {
  const rValues = [3.0, 4.0, 6.0, 8.0];

  try {
    const results = await Promise.all(
      rValues.map((rValue) =>
        evaluateInsulation({
          ...baseParams,
          doel_r_waarde: rValue,
        }),
      ),
    );

    const transformedResults = results.map((result, idx) =>
      transformOperatonResult(
        result,
        rValues[idx],
        baseParams.dak_oppervlakte_m2,
      ),
    );

    return {
      aanname: {
        R_bestaand: baseParams.huidige_r_waarde,
        dak_oppervlakte_m2: baseParams.dak_oppervlakte_m2,
        lambda_W_mK: baseParams.lambda_w_mk,
        materiaal_cost_per_m3_eur: baseParams.materiaal_cost_per_m3,
        install_cost_per_m2_per_100mm_eur:
          baseParams.install_cost_per_m2_per_100mm,
        huidige_jaarlijkse_verwarmingskosten_eur: 1200, // Could be calculated
      },
      berekeningen: transformedResults,
    };
  } catch (error) {
    console.error("Failed to fetch all calculations:", error);
    throw error;
  }
};

export default {
  evaluateInsulation,
  transformOperatonResult,
  fetchAllCalculations,
};
