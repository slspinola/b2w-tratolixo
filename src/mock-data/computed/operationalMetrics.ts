// ============================================================
// operationalMetrics.ts — Operational dashboard aggregated metrics
// ============================================================

import type { MockDatabase } from '../generators/index.js';
import { randomInt, normalRandom, clamp, pick, random, withNoise } from '../seed.js';
import { contaminationTypes } from '../generators/contamination.js';

// ---- Types ----

export interface RouteStatus {
  rota_id: string;
  codigo: string;
  turno: string;
  freguesia: string;
  sacos_planeados: number;
  sacos_recolhidos: number;
  peso_kg: number;
  estado: 'concluida' | 'em_curso' | 'pendente' | 'atrasada';
  hora_inicio: string | null;
  hora_fim: string | null;
  equipa_id: string;
}

export interface InspectedBag {
  id: string;
  hora: string;
  rota_codigo: string;
  peso_kg: number;
  contaminado: boolean;
  tipo_contaminacao: string | null;
  rejeitado: boolean;
}

export interface ActiveAlert {
  id: string;
  tipo: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  sector: string;
  hora: string;
  mensagem: string;
  resolvido: boolean;
}

export interface TeamProductivity {
  equipa_id: string;
  nome: string;
  sacos_dia: number;
  peso_dia_kg: number;
  rotas_concluidas: number;
  rotas_total: number;
  eficiencia_pct: number;
}

export interface OperationalMetrics {
  // Today summary
  sacosHoje: number;
  pesoHojeKg: number;
  rotasConcluidas: number;
  rotasTotal: number;
  alertasAtivos: number;

  // Route table
  routeStatuses: RouteStatus[];

  // Recent inspections
  lastInspectedBags: InspectedBag[];

  // Alerts
  activeAlerts: ActiveAlert[];

  // Team productivity
  teamProductivity: TeamProductivity[];

  // Incidents by sector (today)
  incidentsBySector: { sector: string; count: number }[];

  // MTTR (mean time to repair, minutes)
  mttrMinutes: number;

  // Hourly collection rate
  hourlyCollection: { hora: number; sacos: number; peso_kg: number }[];
}

// ---- Helpers ----

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---- Main computation ----

export function computeOperationalMetrics(
  db: MockDatabase,
  filters: { municipio: string | null; data: Date; turno: string | null },
): OperationalMetrics {
  const { municipio, turno } = filters;

  // Filter routes for this municipality
  const routes = db.routes.filter(
    (r) => (!municipio || r.municipio_id === municipio) && (!turno || r.turno === turno),
  );

  // Simulate daily data for each route
  const routeStatuses: RouteStatus[] = routes.map((route) => {
    const baseRecolha = route.pontos_recolha;
    const planeados = Math.round(withNoise(baseRecolha * 2.5, 0.15));
    const completionPct = clamp(normalRandom(0.88, 0.08), 0.60, 1.0);
    const recolhidos = Math.round(planeados * completionPct);
    const pesoKg = Math.round(recolhidos * clamp(normalRandom(8, 2.5), 2, 20));

    // Determine status
    const statusRoll = random();
    let estado: RouteStatus['estado'];
    if (statusRoll < 0.55) estado = 'concluida';
    else if (statusRoll < 0.75) estado = 'em_curso';
    else if (statusRoll < 0.90) estado = 'pendente';
    else estado = 'atrasada';

    // Determine times based on turno
    const turnoBase = route.turno === 'manha' ? 6 : route.turno === 'tarde' ? 14 : 22;
    const horaInicio = estado !== 'pendente'
      ? formatTime(turnoBase + randomInt(0, 1), randomInt(0, 59))
      : null;
    const horaFim = estado === 'concluida'
      ? formatTime(turnoBase + randomInt(3, 6), randomInt(0, 59))
      : null;

    // Find parish name
    const parish = db.parishes.find((p) => p.id === route.freguesia_ids[0]);

    return {
      rota_id: route.id,
      codigo: route.codigo,
      turno: route.turno,
      freguesia: parish?.nome ?? route.freguesia_ids[0],
      sacos_planeados: planeados,
      sacos_recolhidos: estado === 'pendente' ? 0 : recolhidos,
      peso_kg: estado === 'pendente' ? 0 : pesoKg,
      estado,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      equipa_id: route.equipa_id,
    };
  });

  // ---- Last 10 inspected bags ----
  const lastInspectedBags: InspectedBag[] = [];
  for (let i = 0; i < 10; i++) {
    const contaminado = random() < 0.12; // ~12% contamination
    const pesoKg = Math.round(clamp(normalRandom(8, 3), 0.5, 30) * 10) / 10;
    const tipoContam = contaminado ? pick(contaminationTypes).id : null;
    const rejeitado = contaminado && random() < 0.3; // 30% of contaminated are rejected

    const rt = routes.length > 0 ? pick(routes) : null;

    lastInspectedBags.push({
      id: `SAC-${String(1000 + i).padStart(6, '0')}`,
      hora: formatTime(randomInt(6, 20), randomInt(0, 59)),
      rota_codigo: rt?.codigo ?? 'N/A',
      peso_kg: pesoKg,
      contaminado,
      tipo_contaminacao: tipoContam,
      rejeitado,
    });
  }
  lastInspectedBags.sort((a, b) => b.hora.localeCompare(a.hora));

  // ---- Active alerts ----
  const alertTypes = [
    { tipo: 'avaria_tapete', mensagem: 'Tapete de triagem parado - sector {s}' },
    { tipo: 'bloqueio', mensagem: 'Bloqueio detetado na linha de {s}' },
    { tipo: 'contaminacao_critica', mensagem: 'Nivel critico de contaminacao em {s}' },
    { tipo: 'falha_sensor', mensagem: 'Falha de sensor no sector {s}' },
    { tipo: 'erro_rfid', mensagem: 'Erro de leitura RFID em {s}' },
  ];
  const sectors = ['triagem', 'recepcao', 'pesagem', 'compactacao', 'descarga'];
  const severidades: ('baixa' | 'media' | 'alta' | 'critica')[] = ['baixa', 'media', 'alta', 'critica'];

  const numAlerts = randomInt(2, 6);
  const activeAlerts: ActiveAlert[] = [];
  for (let i = 0; i < numAlerts; i++) {
    const alertType = pick(alertTypes);
    const sector = pick(sectors);
    activeAlerts.push({
      id: `ALR-${String(i + 1).padStart(4, '0')}`,
      tipo: alertType.tipo,
      severidade: pick(severidades),
      sector,
      hora: formatTime(randomInt(6, 20), randomInt(0, 59)),
      mensagem: alertType.mensagem.replace('{s}', sector),
      resolvido: random() < 0.3,
    });
  }
  activeAlerts.sort((a, b) => b.hora.localeCompare(a.hora));

  // ---- Team productivity ----
  const teams = db.teams.filter((t) => !municipio || t.municipio_id === municipio);
  const teamProductivity: TeamProductivity[] = teams.map((team) => {
    const teamRoutes = routeStatuses.filter((r) => r.equipa_id === team.id);
    const sacoDia = teamRoutes.reduce((s, r) => s + r.sacos_recolhidos, 0);
    const pesoDia = teamRoutes.reduce((s, r) => s + r.peso_kg, 0);
    const concluidas = teamRoutes.filter((r) => r.estado === 'concluida').length;
    return {
      equipa_id: team.id,
      nome: team.nome,
      sacos_dia: sacoDia,
      peso_dia_kg: pesoDia,
      rotas_concluidas: concluidas,
      rotas_total: teamRoutes.length,
      eficiencia_pct: teamRoutes.length > 0
        ? Math.round((concluidas / teamRoutes.length) * 100)
        : 0,
    };
  });

  // ---- Incidents by sector ----
  const incidentCounts = new Map<string, number>();
  for (const s of sectors) {
    incidentCounts.set(s, randomInt(0, 3));
  }
  const incidentsBySector = sectors.map((s) => ({
    sector: s,
    count: incidentCounts.get(s) ?? 0,
  }));

  // ---- MTTR ----
  const mttrMinutes = Math.round(clamp(normalRandom(18, 8), 5, 60));

  // ---- Hourly collection ----
  const hourlyCollection: { hora: number; sacos: number; peso_kg: number }[] = [];
  for (let h = 6; h <= 22; h++) {
    // Peak hours 8-12, 15-18
    const isPeak = (h >= 8 && h <= 12) || (h >= 15 && h <= 18);
    const baseSacos = isPeak ? randomInt(80, 200) : randomInt(20, 80);
    hourlyCollection.push({
      hora: h,
      sacos: baseSacos,
      peso_kg: Math.round(baseSacos * clamp(normalRandom(8, 2), 3, 15)),
    });
  }

  // ---- Summary ----
  const sacosHoje = routeStatuses.reduce((s, r) => s + r.sacos_recolhidos, 0);
  const pesoHojeKg = routeStatuses.reduce((s, r) => s + r.peso_kg, 0);
  const rotasConcluidas = routeStatuses.filter((r) => r.estado === 'concluida').length;

  return {
    sacosHoje,
    pesoHojeKg,
    rotasConcluidas,
    rotasTotal: routeStatuses.length,
    alertasAtivos: activeAlerts.filter((a) => !a.resolvido).length,
    routeStatuses,
    lastInspectedBags,
    activeAlerts,
    teamProductivity,
    incidentsBySector,
    mttrMinutes,
    hourlyCollection,
  };
}
