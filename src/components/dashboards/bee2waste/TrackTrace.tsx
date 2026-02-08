import { useState, useMemo } from 'react';
import { Search, Package, MapPin, Truck } from 'lucide-react';
import type { Bee2WasteMetrics } from '../../../mock-data/store.js';
import { formatNumber } from '../../../utils/formatters.js';

interface TrackTraceProps {
  metrics: Bee2WasteMetrics;
}

interface TraceResult {
  uid: string;
  rota: string;
  freguesia: string;
  municipio: string;
  data: string;
  peso_kg: number;
  contaminacao: number;
  estado: 'recolhido' | 'em_transito' | 'processado';
}

function generateTraceResults(
  metrics: Bee2WasteMetrics,
  query: string,
): TraceResult[] {
  if (!query.trim()) return [];

  const results: TraceResult[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  // Generate simulated track & trace results based on municipality data
  metrics.municipalityCards.forEach((mun) => {
    const monthlyCount = Math.ceil(mun.sacos / Math.max(metrics.monthlyTrends.length, 1));
    const sampleCount = Math.min(5, Math.ceil(monthlyCount / 100));

    for (let i = 0; i < sampleCount; i++) {
      const uid = `B2W-${mun.municipio_id.slice(0, 3).toUpperCase()}-${String(1000 + i).padStart(5, '0')}`;
      const rota = `R${mun.municipio_id.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`;

      // Filter by search query
      if (
        uid.toLowerCase().includes(normalizedQuery) ||
        rota.toLowerCase().includes(normalizedQuery) ||
        mun.nome.toLowerCase().includes(normalizedQuery)
      ) {
        const lastMonth = metrics.monthlyTrends[metrics.monthlyTrends.length - 1];
        results.push({
          uid,
          rota,
          freguesia: `Freguesia ${i + 1}`,
          municipio: mun.nome,
          data: lastMonth?.mes ? `${lastMonth.mes}-${String(10 + i).padStart(2, '0')}` : '2026-01-15',
          peso_kg: Math.round((mun.bioTon * 1000 / mun.sacos) * (0.8 + Math.random() * 0.4) * 100) / 100,
          contaminacao: Math.round(mun.contaminacao * (0.7 + Math.random() * 0.6) * 10) / 10,
          estado: i === 0 ? 'em_transito' : i === 1 ? 'processado' : 'recolhido',
        });
      }
    }
  });

  return results.slice(0, 10);
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  recolhido: { label: 'Recolhido', color: 'var(--primary-default)' },
  em_transito: { label: 'Em Transito', color: 'var(--warning-default)' },
  processado: { label: 'Processado', color: 'var(--success-default)' },
};

export function TrackTrace({ metrics }: TrackTraceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const results = useMemo(
    () => generateTraceResults(metrics, activeQuery),
    [metrics, activeQuery],
  );

  const handleSearch = () => {
    setActiveQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Track & Trace
      </h3>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-[var(--b2s-radius-sm)]"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Pesquisar por UID, rota ou freguesia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-[var(--b2s-radius-sm)] text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary-default)' }}
        >
          Pesquisar
        </button>
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {metrics.municipalityCards.map((mun) => (
          <button
            key={mun.municipio_id}
            onClick={() => {
              setSearchQuery(mun.nome.toLowerCase());
              setActiveQuery(mun.nome.toLowerCase());
            }}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-opacity hover:opacity-80"
            style={{
              background: `${mun.cor}20`,
              color: mun.cor,
              border: `1px solid ${mun.cor}40`,
            }}
          >
            {mun.nome}
          </button>
        ))}
      </div>

      {/* Results table */}
      {activeQuery && (
        <div className="overflow-x-auto">
          {results.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    <span className="inline-flex items-center gap-1">
                      <Package size={10} /> UID
                    </span>
                  </th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                    <span className="inline-flex items-center gap-1">
                      <Truck size={10} /> Rota
                    </span>
                  </th>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} /> Municipio
                    </span>
                  </th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                    Data
                  </th>
                  <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Peso
                  </th>
                  <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Contam.
                  </th>
                  <th className="text-center py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const estado = ESTADO_LABELS[result.estado] ?? { label: result.estado, color: 'var(--text-muted)' };
                  return (
                    <tr
                      key={result.uid}
                      className="transition-colors hover:opacity-90"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: 'transparent',
                      }}
                    >
                      <td className="py-2 font-mono font-medium" style={{ color: 'var(--primary-default)' }}>
                        {result.uid}
                      </td>
                      <td className="py-2 hidden sm:table-cell" style={{ color: 'var(--text-primary)' }}>
                        {result.rota}
                      </td>
                      <td className="py-2" style={{ color: 'var(--text-primary)' }}>
                        {result.municipio}
                      </td>
                      <td className="text-right py-2 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                        {result.data}
                      </td>
                      <td className="text-right py-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatNumber(result.peso_kg, 2)} kg
                      </td>
                      <td
                        className="text-right py-2 font-medium"
                        style={{
                          color: result.contaminacao > 15
                            ? 'var(--danger-default)'
                            : result.contaminacao > 10
                              ? 'var(--warning-default)'
                              : 'var(--success-default)',
                        }}
                      >
                        {formatNumber(result.contaminacao, 1)}%
                      </td>
                      <td className="text-center py-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: `${estado.color}20`,
                            color: estado.color,
                          }}
                        >
                          {estado.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div
              className="text-center py-8 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Nenhum resultado encontrado para &quot;{activeQuery}&quot;
            </div>
          )}
        </div>
      )}

      {!activeQuery && (
        <div
          className="text-center py-8 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Introduza um UID, rota ou nome de municipio para rastrear sacos
        </div>
      )}
    </div>
  );
}
