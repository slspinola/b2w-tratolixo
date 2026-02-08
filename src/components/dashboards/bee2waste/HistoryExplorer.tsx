import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Bee2WasteMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface HistoryExplorerProps {
  metrics: Bee2WasteMetrics;
}

interface HistoryRow {
  id: string;
  data: string;
  municipio: string;
  cor: string;
  rota: string;
  sacos: number;
  peso_kg: number;
  contaminacao: number;
  gisScore: number;
}

type SortField = 'data' | 'municipio' | 'sacos' | 'peso_kg' | 'contaminacao' | 'gisScore';

const PAGE_SIZE = 8;

function generateHistoryData(metrics: Bee2WasteMetrics): HistoryRow[] {
  const rows: HistoryRow[] = [];

  metrics.monthlyTrends.forEach((trend) => {
    metrics.municipalityCards.forEach((mun, munIdx) => {
      const sacosPerMonth = Math.round(mun.sacos / Math.max(metrics.monthlyTrends.length, 1));
      const pesoPerMonth = (mun.bioTon * 1000) / Math.max(metrics.monthlyTrends.length, 1);

      // Generate a few route entries per municipality per month
      const numRoutes = 3;
      for (let r = 0; r < numRoutes; r++) {
        const routeSacos = Math.round(sacosPerMonth / numRoutes);
        const routePeso = pesoPerMonth / numRoutes;

        rows.push({
          id: `${trend.mes}-${mun.municipio_id}-R${String(r + 1).padStart(2, '0')}`,
          data: `${trend.mes}-${String(5 + r * 8 + munIdx * 2).padStart(2, '0')}`,
          municipio: mun.nome,
          cor: mun.cor,
          rota: `R${mun.municipio_id.slice(0, 3).toUpperCase()}-${String(r + 1).padStart(2, '0')}`,
          sacos: routeSacos,
          peso_kg: Math.round(routePeso * 100) / 100,
          contaminacao: Math.round(mun.contaminacao * (0.85 + Math.random() * 0.3) * 10) / 10,
          gisScore: Math.round(trend.gisScore * (0.9 + Math.random() * 0.2) * 10) / 10,
        });
      }
    });
  });

  return rows.sort((a, b) => b.data.localeCompare(a.data));
}

export function HistoryExplorer({ metrics }: HistoryExplorerProps) {
  const [sortField, setSortField] = useState<SortField>('data');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [filterMunicipio, setFilterMunicipio] = useState<string>('');

  const allRows = useMemo(() => generateHistoryData(metrics), [metrics]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (filterMunicipio) {
      rows = rows.filter((r) =>
        r.municipio.toLowerCase().includes(filterMunicipio.toLowerCase()),
      );
    }
    return rows;
  }, [allRows, filterMunicipio]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredRows, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const paginatedRows = sortedRows.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'municipio');
    }
    setPage(0);
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="py-2 font-medium cursor-pointer select-none"
      style={{ color: 'var(--text-muted)' }}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          size={10}
          style={{
            color: sortField === field ? 'var(--primary-default)' : 'var(--text-muted)',
          }}
        />
      </span>
    </th>
  );

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Historico de Recolha
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatNumber(filteredRows.length)} registos
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-4">
        <select
          value={filterMunicipio}
          onChange={(e) => {
            setFilterMunicipio(e.target.value);
            setPage(0);
          }}
          className="px-3 py-1.5 rounded-[var(--b2s-radius-sm)] text-xs"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Todos os municipios</option>
          {metrics.municipalityCards.map((mun) => (
            <option key={mun.municipio_id} value={mun.nome}>
              {mun.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <SortHeader field="data" label="Data" />
              <SortHeader field="municipio" label="Municipio" />
              <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                Rota
              </th>
              <SortHeader field="sacos" label="Sacos" />
              <SortHeader field="peso_kg" label="Peso (kg)" />
              <SortHeader field="contaminacao" label="Contam." />
              <SortHeader field="gisScore" label="ICD-GIS" />
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
                  {row.data}
                </td>
                <td className="py-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: row.cor }}
                    />
                    {row.municipio}
                  </span>
                </td>
                <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {row.rota}
                </td>
                <td className="py-2 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(row.sacos)}
                </td>
                <td className="py-2 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(row.peso_kg, 1)}
                </td>
                <td
                  className="py-2 text-right font-medium"
                  style={{
                    color:
                      row.contaminacao > 15
                        ? 'var(--danger-default)'
                        : row.contaminacao > 10
                          ? 'var(--warning-default)'
                          : 'var(--success-default)',
                  }}
                >
                  {formatNumber(row.contaminacao, 1)}%
                </td>
                <td className="py-2 text-right">
                  <span
                    className="font-bold"
                    style={{
                      color:
                        row.gisScore >= 80
                          ? 'var(--success-default)'
                          : row.gisScore >= 60
                            ? 'var(--warning-default)'
                            : row.gisScore >= 40
                              ? '#F97316'
                              : 'var(--danger-default)',
                    }}
                  >
                    {formatNumber(row.gisScore, 1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Pagina {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-[var(--b2s-radius-sm)] transition-colors disabled:opacity-30"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-[var(--b2s-radius-sm)] transition-colors disabled:opacity-30"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
