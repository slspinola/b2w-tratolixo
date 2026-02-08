// ============================================================
// parishes-geojson.ts — GeoJSON polygon boundaries for parishes
// ============================================================
// Approximate but geographically realistic boundaries for the
// 18 parishes across 4 municipalities (Cascais, Sintra, Oeiras, Mafra).
// Coordinates use WGS84 (EPSG:4326) — [longitude, latitude].

import type { FeatureCollection, Feature, Polygon } from 'geojson';

export interface ParishProperties {
  id: string;
  nome: string;
  municipio_id: string;
  municipio_nome: string;
}

type ParishFeature = Feature<Polygon, ParishProperties>;

const parishes: ParishFeature[] = [
  // ── CASCAIS ─────────────────────────────────────────────
  {
    type: 'Feature',
    properties: { id: 'FRG-CAS-01', nome: 'Cascais e Estoril', municipio_id: 'MUN-CAS', municipio_nome: 'Cascais' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.4220, 38.6920], [-9.4350, 38.6980], [-9.4510, 38.7050],
        [-9.4680, 38.7060], [-9.4820, 38.6960], [-9.4780, 38.6850],
        [-9.4600, 38.6780], [-9.4420, 38.6750], [-9.4260, 38.6780],
        [-9.4220, 38.6920],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-CAS-02', nome: 'Carcavelos e Parede', municipio_id: 'MUN-CAS', municipio_nome: 'Cascais' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3550, 38.6850], [-9.3680, 38.6920], [-9.3850, 38.6980],
        [-9.4020, 38.7020], [-9.4220, 38.6920], [-9.4260, 38.6780],
        [-9.4100, 38.6720], [-9.3900, 38.6700], [-9.3700, 38.6720],
        [-9.3550, 38.6750], [-9.3550, 38.6850],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-CAS-03', nome: 'São Domingos de Rana', municipio_id: 'MUN-CAS', municipio_nome: 'Cascais' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3850, 38.6980], [-9.3680, 38.7080], [-9.3700, 38.7200],
        [-9.3850, 38.7300], [-9.4050, 38.7320], [-9.4250, 38.7250],
        [-9.4350, 38.7150], [-9.4350, 38.6980], [-9.4220, 38.6920],
        [-9.4020, 38.7020], [-9.3850, 38.6980],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-CAS-04', nome: 'Alcabideche', municipio_id: 'MUN-CAS', municipio_nome: 'Cascais' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.4250, 38.7250], [-9.4050, 38.7320], [-9.4000, 38.7450],
        [-9.4100, 38.7550], [-9.4300, 38.7600], [-9.4530, 38.7580],
        [-9.4700, 38.7480], [-9.4750, 38.7300], [-9.4680, 38.7060],
        [-9.4510, 38.7050], [-9.4350, 38.6980], [-9.4350, 38.7150],
        [-9.4250, 38.7250],
      ]],
    },
  },

  // ── OEIRAS ──────────────────────────────────────────────
  {
    type: 'Feature',
    properties: { id: 'FRG-OEI-01', nome: 'Oeiras e São Julião', municipio_id: 'MUN-OEI', municipio_nome: 'Oeiras' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3050, 38.6880], [-9.3200, 38.6950], [-9.3350, 38.6980],
        [-9.3400, 38.7050], [-9.3280, 38.7100], [-9.3120, 38.7050],
        [-9.2980, 38.6980], [-9.2900, 38.6900], [-9.2920, 38.6800],
        [-9.3050, 38.6780], [-9.3050, 38.6880],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-OEI-02', nome: 'Algés, Linda-a-Velha e Cruz Quebrada', municipio_id: 'MUN-OEI', municipio_nome: 'Oeiras' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.2600, 38.7000], [-9.2700, 38.7100], [-9.2780, 38.7200],
        [-9.2950, 38.7220], [-9.3050, 38.7150], [-9.3120, 38.7050],
        [-9.2980, 38.6980], [-9.2900, 38.6900], [-9.2750, 38.6920],
        [-9.2600, 38.7000],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-OEI-03', nome: 'Carnaxide e Queijas', municipio_id: 'MUN-OEI', municipio_nome: 'Oeiras' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.2780, 38.7200], [-9.2800, 38.7320], [-9.2950, 38.7400],
        [-9.3150, 38.7380], [-9.3250, 38.7280], [-9.3280, 38.7180],
        [-9.3280, 38.7100], [-9.3050, 38.7150], [-9.2950, 38.7220],
        [-9.2780, 38.7200],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-OEI-04', nome: 'Porto Salvo', municipio_id: 'MUN-OEI', municipio_nome: 'Oeiras' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3280, 38.7100], [-9.3280, 38.7180], [-9.3250, 38.7280],
        [-9.3150, 38.7380], [-9.3300, 38.7400], [-9.3480, 38.7350],
        [-9.3550, 38.7200], [-9.3550, 38.6850], [-9.3400, 38.7050],
        [-9.3280, 38.7100],
      ]],
    },
  },

  // ── SINTRA ──────────────────────────────────────────────
  {
    type: 'Feature',
    properties: { id: 'FRG-SIN-01', nome: 'Agualva e Mira-Sintra', municipio_id: 'MUN-SIN', municipio_nome: 'Sintra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3150, 38.7380], [-9.3080, 38.7500], [-9.3100, 38.7620],
        [-9.3250, 38.7680], [-9.3400, 38.7650], [-9.3480, 38.7520],
        [-9.3480, 38.7350], [-9.3300, 38.7400], [-9.3150, 38.7380],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-SIN-02', nome: 'Queluz e Belas', municipio_id: 'MUN-SIN', municipio_nome: 'Sintra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.2800, 38.7320], [-9.2700, 38.7450], [-9.2680, 38.7600],
        [-9.2750, 38.7750], [-9.2920, 38.7800], [-9.3100, 38.7780],
        [-9.3100, 38.7620], [-9.3080, 38.7500], [-9.3150, 38.7380],
        [-9.2950, 38.7400], [-9.2800, 38.7320],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-SIN-03', nome: 'Rio de Mouro', municipio_id: 'MUN-SIN', municipio_nome: 'Sintra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3250, 38.7680], [-9.3100, 38.7780], [-9.3050, 38.7900],
        [-9.3120, 38.8020], [-9.3300, 38.8050], [-9.3480, 38.7980],
        [-9.3520, 38.7850], [-9.3500, 38.7720], [-9.3400, 38.7650],
        [-9.3250, 38.7680],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-SIN-04', nome: 'Cacém e São Marcos', municipio_id: 'MUN-SIN', municipio_nome: 'Sintra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.2920, 38.7800], [-9.2850, 38.7920], [-9.2900, 38.8050],
        [-9.3050, 38.8100], [-9.3120, 38.8020], [-9.3050, 38.7900],
        [-9.3100, 38.7780], [-9.2920, 38.7800],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-SIN-05', nome: 'Sintra (São Pedro)', municipio_id: 'MUN-SIN', municipio_nome: 'Sintra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3480, 38.7980], [-9.3300, 38.8050], [-9.3050, 38.8100],
        [-9.2900, 38.8050], [-9.2850, 38.8200], [-9.2950, 38.8400],
        [-9.3150, 38.8550], [-9.3400, 38.8600], [-9.3650, 38.8580],
        [-9.3850, 38.8450], [-9.4000, 38.8280], [-9.4100, 38.8100],
        [-9.4050, 38.7950], [-9.3900, 38.7850], [-9.3750, 38.7780],
        [-9.3520, 38.7850], [-9.3480, 38.7980],
      ]],
    },
  },

  // ── MAFRA ───────────────────────────────────────────────
  {
    type: 'Feature',
    properties: { id: 'FRG-MAF-01', nome: 'Mafra', municipio_id: 'MUN-MAF', municipio_nome: 'Mafra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3350, 38.9200], [-9.3200, 38.9300], [-9.3100, 38.9500],
        [-9.3200, 38.9650], [-9.3450, 38.9700], [-9.3650, 38.9600],
        [-9.3750, 38.9400], [-9.3650, 38.9250], [-9.3350, 38.9200],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-MAF-02', nome: 'Ericeira', municipio_id: 'MUN-MAF', municipio_nome: 'Mafra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3750, 38.9400], [-9.3650, 38.9600], [-9.3700, 38.9800],
        [-9.3850, 38.9950], [-9.4100, 38.9980], [-9.4250, 38.9850],
        [-9.4200, 38.9650], [-9.4050, 38.9500], [-9.3900, 38.9350],
        [-9.3750, 38.9400],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-MAF-03', nome: 'Malveira e São Miguel de Alcainça', municipio_id: 'MUN-MAF', municipio_nome: 'Mafra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.2800, 38.8800], [-9.2650, 38.8950], [-9.2600, 38.9150],
        [-9.2700, 38.9300], [-9.2950, 38.9350], [-9.3200, 38.9300],
        [-9.3350, 38.9200], [-9.3300, 38.9050], [-9.3150, 38.8900],
        [-9.2950, 38.8800], [-9.2800, 38.8800],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-MAF-04', nome: 'Enxara do Bispo e A-dos-Cunhados', municipio_id: 'MUN-MAF', municipio_nome: 'Mafra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3200, 38.9650], [-9.3100, 38.9500], [-9.2950, 38.9350],
        [-9.2700, 38.9300], [-9.2600, 38.9500], [-9.2650, 38.9750],
        [-9.2800, 38.9950], [-9.3050, 39.0050], [-9.3300, 39.0000],
        [-9.3450, 38.9850], [-9.3450, 38.9700], [-9.3200, 38.9650],
      ]],
    },
  },
  {
    type: 'Feature',
    properties: { id: 'FRG-MAF-05', nome: 'Venda do Pinheiro e Santo Estêvão', municipio_id: 'MUN-MAF', municipio_nome: 'Mafra' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-9.3150, 38.8900], [-9.3300, 38.9050], [-9.3350, 38.9200],
        [-9.3650, 38.9250], [-9.3900, 38.9200], [-9.4000, 38.9050],
        [-9.3950, 38.8900], [-9.3850, 38.8750], [-9.3650, 38.8580],
        [-9.3400, 38.8600], [-9.3150, 38.8800], [-9.3150, 38.8900],
      ]],
    },
  },
];

export const parishesGeoJSON: FeatureCollection<Polygon, ParishProperties> = {
  type: 'FeatureCollection',
  features: parishes,
};
