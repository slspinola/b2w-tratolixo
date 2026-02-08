import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 list-none p-0 m-0" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  className="text-[var(--text-muted)]"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.path ? (
                <span
                  className="
                    text-[13px] font-semibold
                    text-[var(--text-primary)]
                  "
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="
                    text-[13px]
                    text-[var(--text-secondary)]
                    hover:text-[var(--primary-default)]
                    transition-colors duration-150
                    no-underline
                  "
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
