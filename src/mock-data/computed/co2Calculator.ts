// ============================================================
// co2Calculator.ts — CO2 emission avoidance calculations
// ============================================================
// Two formulas from project documentation:
//
// Simplified:
//   CO2e = M_bio_ok * (EF_ref - EF_treat)
//
// Complete:
//   CO2e = M_bio_ok * (EF_ref - EF_treat) - M_rej * EF_rej_dest - M_bio * EF_ops
//
// Where:
//   M_bio_ok = M_bio * (1 - C)      (clean bio-waste in tons)
//   M_rej    = M_bio * C             (rejected material in tons)
//   C        = contamination rate    (0-1 fraction)
//   EF_ref   = landfill emission factor (0.900 tCO2e/t)
//   EF_treat = treatment emission factor (0.100 tCO2e/t — anaerobic digestion)
//   EF_ops   = operational emissions (0.030 tCO2e/t)
//   EF_rej   = rejected material destination (0.500 tCO2e/t)

// ---- Constants ----

const EF_REF = 0.900; // Landfill reference (tCO2e/t)
const EF_TREAT = 0.100; // Anaerobic digestion (tCO2e/t)
const EF_OPS = 0.030; // Operational emissions (tCO2e/t)
const EF_REJ = 0.500; // Rejected material to landfill (tCO2e/t)

// ---- Formulas ----

/**
 * Simplified CO2 avoided calculation.
 * @param bioTons Total bio-waste collected (tons)
 * @param contaminationRate Contamination percentage (0-100)
 * @returns tCO2e avoided
 */
export function co2Simplified(bioTons: number, contaminationRate: number): number {
  const c = contaminationRate / 100;
  const mBioOk = bioTons * (1 - c);
  return mBioOk * (EF_REF - EF_TREAT);
}

/**
 * Complete CO2 avoided calculation (net of operational and rejection costs).
 * @param bioTons Total bio-waste collected (tons)
 * @param contaminationRate Contamination percentage (0-100)
 * @returns tCO2e avoided (net)
 */
export function co2Complete(bioTons: number, contaminationRate: number): number {
  const c = contaminationRate / 100;
  const mBioOk = bioTons * (1 - c);
  const mRej = bioTons * c;
  return mBioOk * (EF_REF - EF_TREAT) - mRej * EF_REJ - bioTons * EF_OPS;
}

/**
 * Calculate the CO2 that would have been emitted if all waste went to landfill.
 * @param bioTons Total bio-waste (tons)
 * @returns tCO2e that would have been emitted
 */
export function co2LandfillReference(bioTons: number): number {
  return bioTons * EF_REF;
}

/**
 * Calculate per-ton CO2 intensity for treated bio-waste.
 * @param bioTons Total bio-waste (tons)
 * @param contaminationRate Contamination percentage (0-100)
 * @returns tCO2e per ton of bio-waste collected
 */
export function co2IntensityPerTon(bioTons: number, contaminationRate: number): number {
  if (bioTons === 0) return 0;
  return co2Complete(bioTons, contaminationRate) / bioTons;
}
