// ============================================================
// generators/index.ts — Master entry point for mock data generation
// ============================================================

import { municipalities, parishes } from './municipalities.js';
import type { Municipality, Parish } from './municipalities.js';
import { generateTeams } from './teams.js';
import type { Team } from './teams.js';
import { generateRoutes } from './routes.js';
import type { Route } from './routes.js';
import { contaminationTypes } from './contamination.js';
import type { ContaminationType } from './contamination.js';
import { emissionFactors } from './emissions.js';
import type { EmissionFactor } from './emissions.js';
import { generateMonthlyParishData } from './bags.js';
import type { MonthlyParishData } from './bags.js';
import { generateMonthlyIncidents } from './incidents.js';
import type { MonthlyIncidents } from './incidents.js';
import { generateMonthlyCosts } from './costs.js';
import type { MonthlyCosts } from './costs.js';
import { generateMonthlyUrbanWaste } from './urbanWaste.js';
import type { MonthlyUrbanWaste } from './urbanWaste.js';

// ---- Re-export types for consumer convenience ----

export type {
  Municipality,
  Parish,
  Team,
  Route,
  ContaminationType,
  EmissionFactor,
  MonthlyParishData,
  MonthlyIncidents,
  MonthlyCosts,
  MonthlyUrbanWaste,
};

// ---- Database shape ----

export interface MockDatabase {
  municipalities: readonly Municipality[];
  parishes: readonly Parish[];
  teams: Team[];
  routes: Route[];
  contaminationTypes: readonly ContaminationType[];
  emissionFactors: readonly EmissionFactor[];
  monthlyParishData: MonthlyParishData[];
  monthlyIncidents: MonthlyIncidents[];
  monthlyCosts: MonthlyCosts[];
  monthlyUrbanWaste: MonthlyUrbanWaste[];
}

// ---- Singleton lazy initialization ----

let _db: MockDatabase | null = null;

/**
 * Returns the complete mock database.
 * Data is generated once on first call using the seeded PRNG,
 * guaranteeing deterministic output.
 */
export function getDatabase(): MockDatabase {
  if (!_db) {
    const monthlyParishData = generateMonthlyParishData();

    _db = {
      municipalities,
      parishes,
      teams: generateTeams(),
      routes: generateRoutes(),
      contaminationTypes,
      emissionFactors,
      monthlyParishData,
      monthlyIncidents: generateMonthlyIncidents(),
      monthlyCosts: generateMonthlyCosts(monthlyParishData),
      monthlyUrbanWaste: generateMonthlyUrbanWaste(monthlyParishData),
    };
  }
  return _db;
}
