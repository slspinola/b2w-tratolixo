/**
 * Data Model Entity Interfaces
 *
 * TypeScript interfaces for the 14 core data model entities
 * used across the Tratolixo bio-waste monitoring dashboards.
 */

export interface Municipio {
  id: string;
  nome: string;
  populacao: number;
  area_km2: number;
  cor: string;
}

export interface Freguesia {
  id: string;
  municipio_id: string;
  nome: string;
  populacao: number;
  area_km2: number;
  /** SVG path data for simplified map rendering */
  svgPath?: string;
}

export interface Equipa {
  id: string;
  nome: string;
  municipio_id: string;
  tipo: 'recolha' | 'processamento';
  membros: number;
}

export interface Tapete {
  id: string;
  codigo: string;
  localizacao: string;
  ativo: boolean;
}

export interface Turno {
  id: string;
  equipa_id: string;
  /** ISO date string (YYYY-MM-DD) */
  data: string;
  tipo: 'manha' | 'tarde' | 'noite';
  hora_inicio: string;
  hora_fim: string;
  horas_extra_min: number;
}

export interface RotaRecolha {
  id: string;
  codigo: string;
  municipio_id: string;
  freguesias_ids: string[];
  planeada: boolean;
  realizada: boolean;
  /** ISO date string (YYYY-MM-DD) */
  data: string;
  turno_tipo: 'manha' | 'tarde' | 'noite';
  hora_inicio_planeada: string;
  hora_inicio_real?: string;
  hora_fim_planeada: string;
  hora_fim_real?: string;
  km_planeados: number;
  km_reais: number;
  sacos_recolhidos: number;
  peso_total_kg: number;
}

export interface BioBag {
  id: string;
  uid_rfid: string;
  rota_id: string;
  tapete_id: string;
  freguesia_id: string;
  /** ISO datetime string */
  timestamp: string;
  peso_kg: number;
  volume_m3: number;
  area_m2: number;
  /** Contamination rate, 0-100 */
  taxa_contaminacao: number;
  rejeitado: boolean;
  geo_lat?: number;
  geo_lng?: number;
  imagem_url?: string;
}

export interface TipoContaminacao {
  id: string;
  nome: string;
  cor: string;
}

export interface ContaminacaoSaco {
  bio_bag_id: string;
  tipo_contaminacao_id: string;
  peso_kg: number;
  percentagem: number;
}

export interface Incidente {
  id: string;
  tapete_id: string;
  tipo:
    | 'avaria_tapete'
    | 'bloqueio'
    | 'contaminacao_critica'
    | 'falha_sensor'
    | 'erro_rfid'
    | 'manutencao';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  descricao: string;
  /** ISO datetime string */
  data_inicio: string;
  /** ISO datetime string */
  data_resolucao?: string;
  tempo_resolucao_min?: number;
  sector: string;
  resolvido: boolean;
}

export interface FatorEmissao {
  id: string;
  cenario:
    | 'aterro'
    | 'digestao_anaerobica'
    | 'compostagem'
    | 'operacoes'
    | 'rejeitados';
  valor_tco2e_por_t: number;
  fonte: string;
}

export interface ResiduosUrbanosTotal {
  id: string;
  municipio_id: string;
  /** Format: YYYY-MM */
  mes: string;
  total_ru_ton: number;
}

export interface RegistoCusto {
  id: string;
  municipio_id: string;
  /** Format: YYYY-MM */
  mes: string;
  categoria:
    | 'recolha'
    | 'tratamento'
    | 'transporte'
    | 'mao_obra'
    | 'overhead';
  valor_eur: number;
}
