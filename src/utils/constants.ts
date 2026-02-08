export const THRESHOLDS = {
  contamination: { good: 5, acceptable: 10, warning: 15, critical: 20, max: 30 },
  semaphore: { verde: 80, amarelo: 60, laranja: 40 },
  mttr: { target: 15, warning: 30, critical: 60 },
  bagWeight: { min: 0.5, mean: 8, max: 30, anomaly: 30 },
  routeCompliance: { target: 95 },
};

export const LABELS = {
  dashboards: {
    ceo: 'Dashboard CEO',
    operational: 'Dashboard Operacional',
    cfo: 'Dashboard CFO',
    councillor: 'Vereador do Ambiente',
    bee2waste: 'Bee2Waste',
  },
  periods: {
    mes: 'Mês Corrente',
    ytd: 'Acumulado (YTD)',
    trimestre: 'Trimestre',
    ano: 'Ano',
  },
  shifts: {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
  },
  contaminationTypes: {
    VIDRO: 'Vidro',
    PAPEL: 'Papel/Cartão',
    METAL: 'Metal',
    PLASTICO: 'Plástico',
    TEXTIL: 'Têxtil',
    ORGANICO_NB: 'Orgânico N/B',
    OUTROS: 'Outros',
  },
};
