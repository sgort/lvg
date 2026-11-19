// Mock data for the one demonstration property. Only propertyService.js imports
// this file, so real sources can replace it without touching the screens.
const publicInfo = {
  address: 'Lange Hilleweg 73 B',
  postalCode: '3073 BJ',
  city: 'Rotterdam',
  cadastralId: 'G 3916',
  size: '158 m²',
  buildYear: 1990,
  energyLabel: 'C',
  wozHistory: [
    { value: '€ 317.000', date: '1 januari 2025' },
    { value: '€ 304.000', date: '1 januari 2024' },
  ],
};

const personalizedInfo = {
  currentEnergyUsage: 'Gemiddeld',
  potentialSavings: '€ 850/jaar',
  recommendedImprovements: [
    {
      item: 'Dakisolatie verbeteren',
      cost: '€ 2.500 - € 4.000',
      savings: '€ 350/jaar',
      labelImprovement: 'C → B',
    },
    {
      item: 'HR++ beglazing',
      cost: '€ 4.000 - € 6.000',
      savings: '€ 300/jaar',
      labelImprovement: 'C → B',
    },
    {
      item: 'Vloerisolatie',
      cost: '€ 1.500 - € 3.000',
      savings: '€ 200/jaar',
      labelImprovement: 'C → B',
    },
  ],
  monthlyUsage: [
    { month: 'Jan', gas: 180, electric: 250 },
    { month: 'Feb', gas: 160, electric: 240 },
    { month: 'Mrt', gas: 120, electric: 220 },
    { month: 'Apr', gas: 80, electric: 200 },
  ],
};

const buildingData = {
  gebouw: {
    gebouwtype: 'woonhuis',
    bouwjaar: 1990,
    vloeroppervlakte_m2: 120,
    bezettingspatroon: 'avonden_en_nachten',
  },
  dak: {
    daktype: 'zadeldak',
    dakhelling_graden: 30,
    dakbedekking_materiaal: 'bitumen_shingles',
    dakbeschot_materiaal: 'hout',
    dakconditie: 'goed',
  },
  klimaat: {
    klimaatzone: 'Zone_5',
    gemiddelde_temperatuur_C: 10,
    gemiddelde_vochtigheid_procent: 70,
    windbelasting: 'blootgesteld',
    zoninstraling_niveau: 'hoog',
  },
  bestaande_isolatie: {
    type: 'glaswol',
    dikte_mm: 100,
    R_waarde_m2K_per_W: 2.8,
    dampscherm_aanwezig: true,
    luchtlek_niveau: 'gemiddeld',
  },
  vocht_en_ventilatie: {
    zolderventilatie_type: 'nok_en_kierdak_ventilatie',
    vochtproblemen: 'lichte_schimmel_in_hoeken',
    dakmembraan_type: 'bitumen',
    dampdiffusierichting: 'binnen_naar_buiten',
  },
  energie_en_budget: {
    doel_R_waarde_m2K_per_W: 6.0,
    energiekosten_per_kWh: 0.15,
    budget_limiet_euro: 2000,
    renovatie_haalbaarheid: 'eenvoudig',
  },
  extra: {
    dak_kleur: 'donkergrijs',
    plafond_afwerking_type: 'gipsplaat',
    gewenste_levensduur_jaren: 25,
    lokale_bouwcode_versie: 'Bouwbesluit_2021',
    brandwerendheidsklasse: 'Klasse_A',
    geluidsisolatie_prioriteit: false,
  },
};

const contractors = [
  {
    id: 1,
    name: 'IsolatieGroep Rotterdam',
    specialty: 'Dakisolatie specialist',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'EcoTherm Isolatie',
    specialty: 'Duurzame isolatie',
    rating: 4.7,
  },
  {
    id: 3,
    name: 'DakTotaal B.V.',
    specialty: 'Complete dakoplossingen',
    rating: 4.9,
  },
  { id: 4, name: 'WarmteWerken', specialty: 'Energiebesparing', rating: 4.6 },
  { id: 5, name: 'IsolatieXpert', specialty: 'Snelle service', rating: 4.5 },
  {
    id: 6,
    name: 'GreenRoof Solutions',
    specialty: 'Groene daken & isolatie',
    rating: 4.8,
  },
];

export const mockProperties = {
  'lange-hilleweg-73b': { publicInfo, personalizedInfo, buildingData, contractors },
};
