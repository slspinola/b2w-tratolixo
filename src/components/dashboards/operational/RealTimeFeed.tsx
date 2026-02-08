import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Radio } from 'lucide-react';

interface FeedBag {
  id: string;
  hora: string;
  uid_rfid: string;
  freguesia: string;
  peso_kg: number;
  contaminacao_pct: number;
  estado: 'OK' | 'Rejeitado';
  _isNew?: boolean;
}

const freguesias = [
  'Mafra', 'Ericeira', 'Malveira', 'Enxara do Bispo',
  'Santo Isidoro', 'Sobral da Abelheira', 'Carvoeira',
  'Cheleiros', 'Encarnacao', 'Gradil',
];

function randomRfid(): string {
  const hex = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, '0');
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

function randomBag(index: number): FeedBag {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const contam = Math.random() < 0.12 ? Math.round(Math.random() * 40 + 10) : 0;
  const rejeitado = contam > 30;

  return {
    id: `SAC-${String(Date.now()).slice(-6)}-${index}`,
    hora: `${h}:${m}:${s}`,
    uid_rfid: randomRfid(),
    freguesia: freguesias[Math.floor(Math.random() * freguesias.length)],
    peso_kg: Math.round((Math.random() * 18 + 2) * 10) / 10,
    contaminacao_pct: contam,
    estado: rejeitado ? 'Rejeitado' : 'OK',
    _isNew: true,
  };
}

function generateInitialBags(): FeedBag[] {
  const bags: FeedBag[] = [];
  for (let i = 0; i < 10; i++) {
    const bag = randomBag(i);
    bag._isNew = false;
    bags.push(bag);
  }
  return bags;
}

export function RealTimeFeed() {
  const [bags, setBags] = useState<FeedBag[]>(generateInitialBags);
  const [collapsed, setCollapsed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(10);

  const addBag = useCallback(() => {
    indexRef.current += 1;
    const newBag = randomBag(indexRef.current);
    setBags((prev) => {
      const updated = [newBag, ...prev.slice(0, 9)];
      // Clear _isNew on previous items
      return updated.map((b, i) => (i === 0 ? b : { ...b, _isNew: false }));
    });
  }, []);

  useEffect(() => {
    const delay = 3000 + Math.random() * 2000; // 3-5 seconds
    intervalRef.current = setInterval(addBag, delay);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [addBag]);

  const bagCount = useMemo(() => bags.length, [bags]);

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
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="
          w-full flex items-center justify-between
          px-5 py-4
          cursor-pointer
          transition-colors duration-150
        "
        style={{ background: 'var(--bg-card)' }}
        aria-expanded={!collapsed}
        aria-controls="realtime-feed-body"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio
              size={18}
              style={{ color: 'var(--success-default)' }}
              aria-hidden="true"
            />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: 'var(--success-default)' }}
            />
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Feed em Tempo Real
          </h3>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            {bagCount} registos
          </span>
        </div>
        {collapsed ? (
          <ChevronDown
            size={18}
            style={{ color: 'var(--text-secondary)' }}
            aria-hidden="true"
          />
        ) : (
          <ChevronUp
            size={18}
            style={{ color: 'var(--text-secondary)' }}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Body */}
      <div
        id="realtime-feed-body"
        className="transition-all duration-300 overflow-hidden"
        style={{
          maxHeight: collapsed ? '0px' : '500px',
          opacity: collapsed ? 0 : 1,
        }}
      >
        <div className="px-5 pb-4">
          <table className="w-full text-xs" style={{ color: 'var(--text-primary)' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Hora', 'UID RFID', 'Freguesia', 'Peso (kg)', 'Contam. (%)', 'Estado'].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-[10px] font-semibold uppercase tracking-wider text-left py-2.5 px-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {bags.map((bag) => (
                <tr
                  key={bag.id}
                  className="border-b transition-all duration-500"
                  style={{
                    borderColor: 'var(--border)',
                    background: bag._isNew ? 'var(--bg-hover)' : 'transparent',
                    animation: bag._isNew ? 'slideDown 0.4s ease-out' : 'none',
                  }}
                >
                  <td className="py-2 px-2 tabular-nums font-mono text-[11px]">
                    {bag.hora}
                  </td>
                  <td className="py-2 px-2 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {bag.uid_rfid}
                  </td>
                  <td className="py-2 px-2">{bag.freguesia}</td>
                  <td className="py-2 px-2 tabular-nums">
                    {bag.peso_kg.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 tabular-nums">
                    <span
                      style={{
                        color:
                          bag.contaminacao_pct > 30
                            ? 'var(--danger-default)'
                            : bag.contaminacao_pct > 0
                              ? 'var(--warning-default)'
                              : 'var(--success-default)',
                      }}
                    >
                      {bag.contaminacao_pct}%
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full"
                      style={{
                        background:
                          bag.estado === 'OK'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        color:
                          bag.estado === 'OK'
                            ? 'var(--success-default)'
                            : 'var(--danger-default)',
                      }}
                    >
                      {bag.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-down keyframes (injected once) */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
