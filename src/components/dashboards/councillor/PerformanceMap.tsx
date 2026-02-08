import { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import type { ParishGisScore } from '../../../mock-data/computed/councillorMetrics.js';
import { formatNumber } from '../../../utils/formatters.js';

interface PerformanceMapProps {
  metrics: CouncillorMetrics;
}

function getGisColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function getGisLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Satisfatorio';
  return 'Insuficiente';
}

const MUNICIPALITY_COLORS: Record<string, string> = {
  cascais: '#3B82F6',
  sintra: '#22C55E',
  oeiras: '#F59E0B',
  mafra: '#8B5CF6',
};

interface ParishGroup {
  municipio_id: string;
  nome: string;
  parishes: ParishGisScore[];
}

export function PerformanceMap({ metrics }: PerformanceMapProps) {
  const [hoveredParish, setHoveredParish] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'score' | 'nome'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  // Group parishes by municipality
  const parishGroups = useMemo(() => {
    const groups = new Map<string, ParishGroup>();

    for (const summary of metrics.municipalitySummaries) {
      groups.set(summary.municipio_id, {
        municipio_id: summary.municipio_id,
        nome: summary.nome,
        parishes: [],
      });
    }

    for (const parish of metrics.parishScores) {
      for (const summary of metrics.municipalitySummaries) {
        if (parish.freguesia_id.split('-')[1] === summary.municipio_id.split('-')[1]) {
          const group = groups.get(summary.municipio_id);
          if (group && !group.parishes.some((gp) => gp.freguesia_id === parish.freguesia_id)) {
            group.parishes.push(parish);
          }
          break;
        }
      }
    }

    return Array.from(groups.values());
  }, [metrics.municipalitySummaries, metrics.parishScores]);

  // Sorted parish ranking
  const sortedParishes = useMemo(() => {
    const sorted = [...metrics.parishScores];
    if (sortField === 'score') {
      sorted.sort((a, b) => sortAsc ? a.gis.score - b.gis.score : b.gis.score - a.gis.score);
    } else {
      sorted.sort((a, b) => sortAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
    }
    return sorted;
  }, [metrics.parishScores, sortField, sortAsc]);

  const handleSort = (field: 'score' | 'nome') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'nome');
    }
  };

  // SVG map layout: arrange parishes as rounded rectangles in a grid per municipality
  const RECT_W = 56;
  const RECT_H = 36;
  const GAP = 6;
  const COLS_PER_GROUP = 4;
  const GROUP_PADDING = 16;
  const GROUP_HEADER = 24;

  const svgContent = useMemo(() => {
    const elements: React.ReactNode[] = [];
    let yOffset = 8;

    parishGroups.forEach((group) => {
      const munColor = MUNICIPALITY_COLORS[group.municipio_id] ?? 'var(--text-muted)';

      // Municipality label
      elements.push(
        <text
          key={`label-${group.municipio_id}`}
          x={8}
          y={yOffset + 14}
          fontSize={11}
          fontWeight={600}
          fill={munColor}
        >
          {group.nome}
        </text>,
      );

      yOffset += GROUP_HEADER;

      // Parish rectangles
      group.parishes.forEach((parish, idx) => {
        const col = idx % COLS_PER_GROUP;
        const row = Math.floor(idx / COLS_PER_GROUP);
        const x = 8 + col * (RECT_W + GAP);
        const y = yOffset + row * (RECT_H + GAP);
        const isHovered = hoveredParish === parish.freguesia_id;
        const gisColor = getGisColor(parish.gis.score);

        elements.push(
          <g
            key={parish.freguesia_id}
            onMouseEnter={() => setHoveredParish(parish.freguesia_id)}
            onMouseLeave={() => setHoveredParish(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={x}
              y={y}
              width={RECT_W}
              height={RECT_H}
              rx={6}
              fill={gisColor}
              fillOpacity={isHovered ? 0.95 : 0.75}
              stroke={isHovered ? 'var(--text-primary)' : 'none'}
              strokeWidth={isHovered ? 1.5 : 0}
            />
            <text
              x={x + RECT_W / 2}
              y={y + 14}
              textAnchor="middle"
              fontSize={8}
              fontWeight={500}
              fill="#fff"
            >
              {parish.nome.length > 9
                ? `${parish.nome.slice(0, 8)}...`
                : parish.nome}
            </text>
            <text
              x={x + RECT_W / 2}
              y={y + 26}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="#fff"
            >
              {formatNumber(parish.gis.score, 0)}
            </text>
          </g>,
        );
      });

      const rows = Math.ceil(group.parishes.length / COLS_PER_GROUP);
      yOffset += rows * (RECT_H + GAP) + GROUP_PADDING;
    });

    return { elements, totalHeight: yOffset + 8 };
  }, [parishGroups, hoveredParish]);

  const hoveredData = hoveredParish
    ? metrics.parishScores.find((p) => p.freguesia_id === hoveredParish)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SVG Map */}
      <div
        className="rounded-[var(--b2s-radius-md)] p-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Mapa de Desempenho por Freguesia
        </h3>

        <div className="relative overflow-auto" style={{ maxHeight: 420 }}>
          <svg
            width="100%"
            viewBox={`0 0 260 ${svgContent.totalHeight}`}
            style={{ minHeight: 200 }}
          >
            {svgContent.elements}
          </svg>

          {/* Tooltip */}
          {hoveredData && (
            <div
              className="absolute top-2 right-2 rounded-[var(--b2s-radius-sm)] p-3 text-xs z-10"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {hoveredData.nome}
              </p>
              <div className="space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                <p>
                  ICD-GIS:{' '}
                  <span className="font-bold" style={{ color: getGisColor(hoveredData.gis.score) }}>
                    {formatNumber(hoveredData.gis.score, 1)}
                  </span>{' '}
                  ({getGisLabel(hoveredData.gis.score)})
                </p>
                <p>Contaminacao: {formatNumber(hoveredData.taxaContaminacao, 1)}%</p>
                <p>kg/hab/ano: {formatNumber(hoveredData.kgPerCapitaAno, 1)}</p>
                <p>CO{'\u2082'} evitado: {formatNumber(hoveredData.co2Evitado, 1)} t</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#22C55E' }} />
            Verde {'\u2265'}80
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#F59E0B' }} />
            Amarelo 60-79
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#F97316' }} />
            Laranja 40-59
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#EF4444' }} />
            Vermelho &lt;40
          </span>
        </div>
      </div>

      {/* Parish ranking table */}
      <div
        className="rounded-[var(--b2s-radius-md)] p-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Ranking de Freguesias (ICD-GIS)
        </h3>

        <div className="overflow-auto" style={{ maxHeight: 420 }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  #
                </th>
                <th
                  className="text-left py-2 font-medium cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort('nome')}
                >
                  <span className="inline-flex items-center gap-1">
                    Freguesia <ArrowUpDown size={10} />
                  </span>
                </th>
                <th
                  className="text-right py-2 font-medium cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort('score')}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    ICD-GIS <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  Contam.
                </th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  kg/hab/ano
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedParishes.map((parish, idx) => (
                <tr
                  key={parish.freguesia_id}
                  className="transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: hoveredParish === parish.freguesia_id ? 'var(--bg-hover)' : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredParish(parish.freguesia_id)}
                  onMouseLeave={() => setHoveredParish(null)}
                >
                  <td className="py-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </td>
                  <td className="py-1.5" style={{ color: 'var(--text-primary)' }}>
                    {parish.nome}
                  </td>
                  <td className="text-right py-1.5">
                    <span
                      className="inline-flex items-center gap-1 font-bold"
                      style={{ color: getGisColor(parish.gis.score) }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: getGisColor(parish.gis.score) }}
                      />
                      {formatNumber(parish.gis.score, 1)}
                    </span>
                  </td>
                  <td className="text-right py-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {formatNumber(parish.taxaContaminacao, 1)}%
                  </td>
                  <td className="text-right py-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {formatNumber(parish.kgPerCapitaAno, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
