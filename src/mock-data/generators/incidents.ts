// ============================================================
// incidents.ts — Monthly incident data per municipality
// ============================================================

import { randomInt, pick, normalRandom, clamp, withNoise, random } from '../seed.js';
import { municipalities } from './municipalities.js';
import { MONTHS } from './bags.js';

// ---- Types ----

export interface Incident {
  id: string;
  tipo: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  sector: string;
  data: string; // ISO date
  tempo_resolucao_min: number;
  resolvido: boolean;
}

export interface MonthlyIncidents {
  mes: string;
  municipio_id: string;
  incidents: Incident[];
}

// ---- Configuration ----

const INCIDENT_TYPES = [
  { tipo: 'avaria_tapete', peso: 0.25 },
  { tipo: 'bloqueio', peso: 0.20 },
  { tipo: 'contaminacao_critica', peso: 0.15 },
  { tipo: 'falha_sensor', peso: 0.15 },
  { tipo: 'erro_rfid', peso: 0.15 },
  { tipo: 'manutencao', peso: 0.10 },
] as const;

const SECTORS = ['triagem', 'recepcao', 'pesagem', 'compactacao', 'descarga'] as const;

const SEVERITY_DISTRIBUTION = [
  { severidade: 'baixa' as const, peso: 0.35 },
  { severidade: 'media' as const, peso: 0.35 },
  { severidade: 'alta' as const, peso: 0.20 },
  { severidade: 'critica' as const, peso: 0.10 },
] as const;

/** Mean time to repair (minutes) */
const MTTR_MEAN = 18;
const MTTR_STD = 8;

function pickWeighted<T>(items: readonly { peso: number }[], getValue: (item: { peso: number }) => T): T {
  const r = random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += items[i].peso;
    if (r <= cumulative) {
      return getValue(items[i]);
    }
  }
  return getValue(items[items.length - 1]);
}

// ---- Generator ----

export function generateMonthlyIncidents(): MonthlyIncidents[] {
  const result: MonthlyIncidents[] = [];
  let incidentCounter = 0;

  for (const mun of municipalities) {
    for (const mes of MONTHS) {
      // 5-8 incidents per municipality per month, with noise
      const count = Math.round(clamp(withNoise(6.5, 0.3), 3, 12));
      const incidents: Incident[] = [];

      // Parse month for date generation
      const [yearStr, monthStr] = mes.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();

      for (let i = 0; i < count; i++) {
        incidentCounter++;
        const day = randomInt(1, daysInMonth);
        const hour = randomInt(6, 22);
        const minute = randomInt(0, 59);

        const tipo = pickWeighted(INCIDENT_TYPES, (item) => (item as typeof INCIDENT_TYPES[number]).tipo);
        const severidade = pickWeighted(SEVERITY_DISTRIBUTION, (item) => (item as typeof SEVERITY_DISTRIBUTION[number]).severidade);

        const tempoResolucao = Math.round(
          clamp(normalRandom(MTTR_MEAN, MTTR_STD), 3, 90),
        );

        // Higher severity -> lower resolution probability
        const resolvido = severidade === 'critica' ? random() > 0.15 : random() > 0.05;

        incidents.push({
          id: `INC-${String(incidentCounter).padStart(5, '0')}`,
          tipo,
          severidade,
          sector: pick(SECTORS),
          data: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
          tempo_resolucao_min: tempoResolucao,
          resolvido,
        });
      }

      // Sort incidents by date
      incidents.sort((a, b) => a.data.localeCompare(b.data));

      result.push({
        mes,
        municipio_id: mun.id,
        incidents,
      });
    }
  }

  return result;
}
