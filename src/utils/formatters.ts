export const formatNumber = (n: number, decimals = 0) =>
  new Intl.NumberFormat('pt-PT', { maximumFractionDigits: decimals }).format(n);

export const formatPercent = (n: number, decimals = 1) =>
  new Intl.NumberFormat('pt-PT', { style: 'percent', maximumFractionDigits: decimals }).format(n / 100);

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);

export function formatMonth(date: Date): string;
export function formatMonth(mes: string): string;
export function formatMonth(input: Date | string): string {
  const date = typeof input === 'string'
    ? new Date(`${input}-15T00:00:00`)
    : input;
  const raw = new Intl.DateTimeFormat('pt-PT', { month: 'short', year: 'numeric' }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export const formatTons = (n: number, decimals = 1) =>
  `${formatNumber(n, decimals)} ton`;

export const formatTrend = (value: number) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, 1)}%`;
};
