import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Feature, Polygon } from 'geojson';
import type { CouncillorMetrics } from '../../../mock-data/store.js';
import type { ParishGisScore } from '../../../mock-data/computed/councillorMetrics.js';
import { parishesGeoJSON } from '../../../data/parishes-geojson.js';
import type { ParishProperties } from '../../../data/parishes-geojson.js';
import { formatNumber } from '../../../utils/formatters.js';

// ---- Metric options ----

interface MetricOption {
  key: string;
  label: string;
  getValue: (p: ParishGisScore) => number;
  format: (n: number) => string;
  invertColor?: boolean; // true = lower is better (e.g. contamination)
}

const METRICS: MetricOption[] = [
  {
    key: 'gis',
    label: 'ICD-GIS',
    getValue: (p) => p.gis.score,
    format: (n) => formatNumber(n, 1),
  },
  {
    key: 'captacao',
    label: 'kg/hab/ano',
    getValue: (p) => p.kgPerCapitaAno,
    format: (n) => formatNumber(n, 1),
  },
  {
    key: 'contaminacao',
    label: 'Contaminacao %',
    getValue: (p) => p.taxaContaminacao,
    format: (n) => `${formatNumber(n, 1)}%`,
    invertColor: true,
  },
  {
    key: 'co2',
    label: 'CO\u2082 Evitado (t)',
    getValue: (p) => p.co2Evitado,
    format: (n) => `${formatNumber(n, 1)} t`,
  },
];

// ---- Color helpers ----

const COLORS = {
  green: '#22C55E',
  yellow: '#EAB308',
  orange: '#F97316',
  red: '#EF4444',
};

function semaphoreColor(score: number): string {
  if (score >= 80) return COLORS.green;
  if (score >= 60) return COLORS.yellow;
  if (score >= 40) return COLORS.orange;
  return COLORS.red;
}

function semaphoreLabel(score: number): string {
  if (score >= 80) return 'Alto desempenho';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Risco';
  return 'Critico';
}

/** Interpolate color from red → orange → yellow → green based on t ∈ [0,1] */
function interpolateColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  // 4-stop gradient: red(0) → orange(0.33) → yellow(0.66) → green(1)
  let r: number, g: number, b: number;
  if (clamped < 0.33) {
    const p = clamped / 0.33;
    r = 239 + (249 - 239) * p;
    g = 68 + (115 - 68) * p;
    b = 68 + (22 - 68) * p;
  } else if (clamped < 0.66) {
    const p = (clamped - 0.33) / 0.33;
    r = 249 + (234 - 249) * p;
    g = 115 + (179 - 115) * p;
    b = 22 + (8 - 22) * p;
  } else {
    const p = (clamped - 0.66) / 0.34;
    r = 234 + (34 - 234) * p;
    g = 179 + (197 - 179) * p;
    b = 8 + (94 - 8) * p;
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

// ---- Municipality colors ----

const MUN_COLORS: Record<string, string> = {
  'MUN-CAS': '#3B82F6',
  'MUN-SIN': '#22C55E',
  'MUN-OEI': '#F59E0B',
  'MUN-MAF': '#8B5CF6',
};

// ---- Component ----

interface HeatMapProps {
  metrics: CouncillorMetrics;
}

export function HeatMap({ metrics }: HeatMapProps) {
  const [activeMetric, setActiveMetric] = useState('gis');
  const [hoveredParish, setHoveredParish] = useState<string | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const metric = METRICS.find((m) => m.key === activeMetric) ?? METRICS[0];

  // Build lookup: parish_id → ParishGisScore
  const parishMap = useMemo(() => {
    const map = new Map<string, ParishGisScore>();
    for (const p of metrics.parishScores) {
      map.set(p.freguesia_id, p);
    }
    return map;
  }, [metrics.parishScores]);

  // Compute min/max for normalization
  const { min, max } = useMemo(() => {
    const values = metrics.parishScores.map((p) => metric.getValue(p));
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [metrics.parishScores, metric]);

  function normalize(value: number): number {
    if (max === min) return 0.5;
    let t = (value - min) / (max - min);
    if (metric.invertColor) t = 1 - t;
    return t;
  }

  // Style each GeoJSON feature
  const style = useCallback(
    (feature?: Feature): PathOptions => {
      if (!feature) return {};
      const props = feature.properties as ParishProperties;
      const parish = parishMap.get(props.id);
      if (!parish) {
        return { fillColor: '#94A3B8', fillOpacity: 0.3, weight: 1, color: '#64748B' };
      }
      const value = metric.getValue(parish);
      const t = normalize(value);
      const isHovered = hoveredParish === props.id;
      return {
        fillColor: interpolateColor(t),
        fillOpacity: isHovered ? 0.95 : 0.75,
        weight: isHovered ? 3 : 1.5,
        color: isHovered ? '#1E293B' : '#FFFFFF',
        dashArray: undefined,
      };
    },
    [parishMap, metric, hoveredParish, min, max],
  );

  // Interaction handlers
  const onEachFeature = useCallback(
    (feature: Feature<Polygon, ParishProperties>, layer: Layer) => {
      layer.on({
        mouseover: () => {
          setHoveredParish(feature.properties.id);
        },
        mouseout: () => {
          setHoveredParish(null);
        },
      });
    },
    [],
  );

  // Force re-render GeoJSON when metric or hover changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(style as L.StyleFunction);
    }
  }, [style]);

  // Get hovered parish data
  const hoveredData = hoveredParish ? parishMap.get(hoveredParish) : null;
  const hoveredFeature = hoveredParish
    ? parishesGeoJSON.features.find((f) => f.properties.id === hoveredParish)
    : null;

  // Map center — roughly center of the 4 municipalities
  const center: [number, number] = [38.82, -9.34];

  return (
    <div
      className="rounded-[var(--b2s-radius-md)] overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
          Mapa de Desempenho por Freguesia (ICD-GIS)
        </h3>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Mapa coropletico — poligonos coloridos por semaforo de desempenho
        </p>
      </div>

      {/* Metric selector */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors"
            style={{
              background: activeMetric === m.key ? 'var(--primary-default)' : 'var(--bg-secondary)',
              color: activeMetric === m.key ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${activeMetric === m.key ? 'var(--primary-default)' : 'var(--border)'}`,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Map + Info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Leaflet Map */}
        <div className="lg:col-span-2 relative" style={{ height: 480 }}>
          <MapContainer
            center={center}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              ref={geoJsonRef}
              data={parishesGeoJSON}
              style={style}
              onEachFeature={onEachFeature}
            />
          </MapContainer>

          {/* Hover tooltip overlay */}
          {hoveredData && hoveredFeature && (
            <div
              ref={tooltipRef}
              className="absolute top-3 right-3 z-[1000] rounded-[var(--b2s-radius-md)] p-4 text-xs"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 200,
                pointerEvents: 'none',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: semaphoreColor(hoveredData.gis.score) }}
                />
                <span className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  {hoveredData.nome}
                </span>
              </div>
              <div className="text-[10px] font-medium mb-2" style={{ color: MUN_COLORS[hoveredFeature.properties.municipio_id] ?? 'var(--text-muted)' }}>
                {hoveredFeature.properties.municipio_nome}
              </div>
              <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>ICD-GIS</span>
                  <span className="font-bold" style={{ color: semaphoreColor(hoveredData.gis.score) }}>
                    {formatNumber(hoveredData.gis.score, 1)} — {semaphoreLabel(hoveredData.gis.score)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>kg/hab/ano</span>
                  <span className="font-medium">{formatNumber(hoveredData.kgPerCapitaAno, 1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contaminacao</span>
                  <span className="font-medium">{formatNumber(hoveredData.taxaContaminacao, 1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>CO{'\u2082'} Evitado</span>
                  <span className="font-medium">{formatNumber(hoveredData.co2Evitado, 1)} t</span>
                </div>
                <div className="flex justify-between">
                  <span>Populacao</span>
                  <span className="font-medium">{formatNumber(hoveredData.populacao, 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel — parish ranking */}
        <div
          className="p-4 overflow-auto"
          style={{ borderLeft: '1px solid var(--border)', maxHeight: 480 }}
        >
          <h4
            className="text-[12px] font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Ranking — {metric.label}
          </h4>

          <div className="space-y-1">
            {[...metrics.parishScores]
              .sort((a, b) => {
                const va = metric.getValue(a);
                const vb = metric.getValue(b);
                return metric.invertColor ? va - vb : vb - va;
              })
              .map((parish, idx) => {
                const value = metric.getValue(parish);
                const t = normalize(value);
                const gisScore = parish.gis.score;
                const isHovered = hoveredParish === parish.freguesia_id;
                return (
                  <div
                    key={parish.freguesia_id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-default"
                    style={{
                      background: isHovered ? 'var(--bg-hover, rgba(0,0,0,0.04))' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredParish(parish.freguesia_id)}
                    onMouseLeave={() => setHoveredParish(null)}
                  >
                    <span
                      className="text-[10px] font-bold w-5 text-center"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: semaphoreColor(gisScore) }}
                    />
                    <span
                      className="flex-1 text-[11px] truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {parish.nome}
                    </span>
                    <span
                      className="text-[11px] font-bold tabular-nums"
                      style={{ color: interpolateColor(t) }}
                    >
                      {metric.format(value)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Legend bar */}
      <div
        className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.green }} />
            Verde {'\u2265'}80
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.yellow }} />
            Amarelo 60-79
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.orange }} />
            Laranja 40-59
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.red }} />
            Vermelho &lt;40
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {metrics.parishScores.length} freguesias | {metrics.municipalitySummaries.length} municipios
          {' | '}ICD-GIS = captacao 25% + qualidade 30% + alertas 15% + CO{'\u2082'} 15% + cobertura 15%
        </span>
      </div>
    </div>
  );
}
