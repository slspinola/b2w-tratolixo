// ============================================================
// routes.ts — Collection route reference data (~10 per municipality)
// ============================================================

export interface Route {
  id: string;
  codigo: string;
  municipio_id: string;
  freguesia_ids: string[];
  equipa_id: string;
  frequencia: 'diaria' | '3x_semana' | '2x_semana';
  turno: 'manha' | 'tarde' | 'noite';
  pontos_recolha: number;
}

export function generateRoutes(): Route[] {
  return [
    // ---- Cascais (10 routes) ----
    { id: 'RT-CAS-001', codigo: 'CAS-001', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-01'], equipa_id: 'EQ-CAS-A', frequencia: 'diaria', turno: 'manha', pontos_recolha: 45 },
    { id: 'RT-CAS-002', codigo: 'CAS-002', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-01'], equipa_id: 'EQ-CAS-A', frequencia: 'diaria', turno: 'tarde', pontos_recolha: 38 },
    { id: 'RT-CAS-003', codigo: 'CAS-003', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-02'], equipa_id: 'EQ-CAS-A', frequencia: '3x_semana', turno: 'manha', pontos_recolha: 52 },
    { id: 'RT-CAS-004', codigo: 'CAS-004', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-02'], equipa_id: 'EQ-CAS-B', frequencia: '3x_semana', turno: 'tarde', pontos_recolha: 41 },
    { id: 'RT-CAS-005', codigo: 'CAS-005', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-03'], equipa_id: 'EQ-CAS-B', frequencia: 'diaria', turno: 'manha', pontos_recolha: 60 },
    { id: 'RT-CAS-006', codigo: 'CAS-006', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-03'], equipa_id: 'EQ-CAS-B', frequencia: '3x_semana', turno: 'tarde', pontos_recolha: 48 },
    { id: 'RT-CAS-007', codigo: 'CAS-007', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-04'], equipa_id: 'EQ-CAS-A', frequencia: '2x_semana', turno: 'manha', pontos_recolha: 32 },
    { id: 'RT-CAS-008', codigo: 'CAS-008', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-04'], equipa_id: 'EQ-CAS-B', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 28 },
    { id: 'RT-CAS-009', codigo: 'CAS-009', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-01', 'FRG-CAS-02'], equipa_id: 'EQ-CAS-A', frequencia: '3x_semana', turno: 'noite', pontos_recolha: 35 },
    { id: 'RT-CAS-010', codigo: 'CAS-010', municipio_id: 'MUN-CAS', freguesia_ids: ['FRG-CAS-03', 'FRG-CAS-04'], equipa_id: 'EQ-CAS-B', frequencia: '2x_semana', turno: 'noite', pontos_recolha: 30 },

    // ---- Sintra (10 routes) ----
    { id: 'RT-SIN-001', codigo: 'SIN-001', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-01'], equipa_id: 'EQ-SIN-A', frequencia: 'diaria', turno: 'manha', pontos_recolha: 55 },
    { id: 'RT-SIN-002', codigo: 'SIN-002', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-01'], equipa_id: 'EQ-SIN-A', frequencia: 'diaria', turno: 'tarde', pontos_recolha: 48 },
    { id: 'RT-SIN-003', codigo: 'SIN-003', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-02'], equipa_id: 'EQ-SIN-A', frequencia: 'diaria', turno: 'manha', pontos_recolha: 70 },
    { id: 'RT-SIN-004', codigo: 'SIN-004', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-02'], equipa_id: 'EQ-SIN-B', frequencia: '3x_semana', turno: 'tarde', pontos_recolha: 62 },
    { id: 'RT-SIN-005', codigo: 'SIN-005', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-03'], equipa_id: 'EQ-SIN-B', frequencia: 'diaria', turno: 'manha', pontos_recolha: 50 },
    { id: 'RT-SIN-006', codigo: 'SIN-006', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-03'], equipa_id: 'EQ-SIN-A', frequencia: '3x_semana', turno: 'tarde', pontos_recolha: 44 },
    { id: 'RT-SIN-007', codigo: 'SIN-007', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-04'], equipa_id: 'EQ-SIN-B', frequencia: '3x_semana', turno: 'manha', pontos_recolha: 42 },
    { id: 'RT-SIN-008', codigo: 'SIN-008', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-04'], equipa_id: 'EQ-SIN-B', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 38 },
    { id: 'RT-SIN-009', codigo: 'SIN-009', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-05'], equipa_id: 'EQ-SIN-A', frequencia: '2x_semana', turno: 'manha', pontos_recolha: 28 },
    { id: 'RT-SIN-010', codigo: 'SIN-010', municipio_id: 'MUN-SIN', freguesia_ids: ['FRG-SIN-05'], equipa_id: 'EQ-SIN-B', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 25 },

    // ---- Oeiras (10 routes) ----
    { id: 'RT-OEI-001', codigo: 'OEI-001', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-01'], equipa_id: 'EQ-OEI-A', frequencia: 'diaria', turno: 'manha', pontos_recolha: 50 },
    { id: 'RT-OEI-002', codigo: 'OEI-002', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-01'], equipa_id: 'EQ-OEI-A', frequencia: 'diaria', turno: 'tarde', pontos_recolha: 42 },
    { id: 'RT-OEI-003', codigo: 'OEI-003', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-02'], equipa_id: 'EQ-OEI-A', frequencia: 'diaria', turno: 'manha', pontos_recolha: 55 },
    { id: 'RT-OEI-004', codigo: 'OEI-004', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-02'], equipa_id: 'EQ-OEI-B', frequencia: '3x_semana', turno: 'tarde', pontos_recolha: 46 },
    { id: 'RT-OEI-005', codigo: 'OEI-005', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-03'], equipa_id: 'EQ-OEI-B', frequencia: '3x_semana', turno: 'manha', pontos_recolha: 40 },
    { id: 'RT-OEI-006', codigo: 'OEI-006', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-03'], equipa_id: 'EQ-OEI-A', frequencia: '3x_semana', turno: 'tarde', pontos_recolha: 36 },
    { id: 'RT-OEI-007', codigo: 'OEI-007', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-04'], equipa_id: 'EQ-OEI-B', frequencia: '2x_semana', turno: 'manha', pontos_recolha: 28 },
    { id: 'RT-OEI-008', codigo: 'OEI-008', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-04'], equipa_id: 'EQ-OEI-B', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 24 },
    { id: 'RT-OEI-009', codigo: 'OEI-009', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-01', 'FRG-OEI-02'], equipa_id: 'EQ-OEI-A', frequencia: '3x_semana', turno: 'noite', pontos_recolha: 38 },
    { id: 'RT-OEI-010', codigo: 'OEI-010', municipio_id: 'MUN-OEI', freguesia_ids: ['FRG-OEI-03', 'FRG-OEI-04'], equipa_id: 'EQ-OEI-B', frequencia: '2x_semana', turno: 'noite', pontos_recolha: 30 },

    // ---- Mafra (10 routes) ----
    { id: 'RT-MAF-001', codigo: 'MAF-001', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-01'], equipa_id: 'EQ-MAF-A', frequencia: '3x_semana', turno: 'manha', pontos_recolha: 30 },
    { id: 'RT-MAF-002', codigo: 'MAF-002', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-01'], equipa_id: 'EQ-MAF-A', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 22 },
    { id: 'RT-MAF-003', codigo: 'MAF-003', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-02'], equipa_id: 'EQ-MAF-A', frequencia: '3x_semana', turno: 'manha', pontos_recolha: 18 },
    { id: 'RT-MAF-004', codigo: 'MAF-004', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-02'], equipa_id: 'EQ-MAF-B', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 15 },
    { id: 'RT-MAF-005', codigo: 'MAF-005', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-03'], equipa_id: 'EQ-MAF-B', frequencia: '3x_semana', turno: 'manha', pontos_recolha: 22 },
    { id: 'RT-MAF-006', codigo: 'MAF-006', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-03'], equipa_id: 'EQ-MAF-A', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 18 },
    { id: 'RT-MAF-007', codigo: 'MAF-007', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-04'], equipa_id: 'EQ-MAF-B', frequencia: '2x_semana', turno: 'manha', pontos_recolha: 25 },
    { id: 'RT-MAF-008', codigo: 'MAF-008', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-04'], equipa_id: 'EQ-MAF-A', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 20 },
    { id: 'RT-MAF-009', codigo: 'MAF-009', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-05'], equipa_id: 'EQ-MAF-B', frequencia: '2x_semana', turno: 'manha', pontos_recolha: 20 },
    { id: 'RT-MAF-010', codigo: 'MAF-010', municipio_id: 'MUN-MAF', freguesia_ids: ['FRG-MAF-05'], equipa_id: 'EQ-MAF-A', frequencia: '2x_semana', turno: 'tarde', pontos_recolha: 18 },
  ];
}
