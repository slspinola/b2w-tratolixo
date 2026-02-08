import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1
        className="text-[80px] font-bold leading-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        404
      </h1>
      <p
        className="text-xl mt-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        Pagina nao encontrada
      </p>
      <Link
        to="/ceo"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: 'var(--primary-default)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-default)';
        }}
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
