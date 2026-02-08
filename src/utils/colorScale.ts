export const semaphoreColor = (score: number) => {
  if (score >= 80) return { bg: '#ecfdf5', border: '#059669', text: '#059669', label: 'Verde' };
  if (score >= 60) return { bg: '#fffbeb', border: '#d97706', text: '#d97706', label: 'Amarelo' };
  if (score >= 40) return { bg: '#fff7ed', border: '#ea580c', text: '#ea580c', label: 'Laranja' };
  return { bg: '#fef2f2', border: '#dc2626', text: '#dc2626', label: 'Vermelho' };
};

export const semaphoreStatus = (score: number): 'verde' | 'amarelo' | 'laranja' | 'vermelho' => {
  if (score >= 80) return 'verde';
  if (score >= 60) return 'amarelo';
  if (score >= 40) return 'laranja';
  return 'vermelho';
};

export const contaminationColor = (rate: number) => {
  if (rate <= 5) return '#059669';   // dark green
  if (rate <= 10) return '#10b981';  // green
  if (rate <= 15) return '#f59e0b';  // yellow
  if (rate <= 20) return '#f97316';  // orange
  return '#ef4444';                  // red
};
