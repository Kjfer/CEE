import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  /** Genera el array de páginas con "..." donde sea necesario */
  function getPageNumbers(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Contador */}
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{' '}
        de{' '}
        <span className="font-medium text-foreground">{totalItems}</span>{' '}
        resultados
      </p>

      {/* Controles */}
      <nav aria-label="Paginación" className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md border text-sm transition',
            currentPage === 1
              ? 'cursor-not-allowed border-border text-muted-foreground opacity-40'
              : 'border-border hover:border-cee-red hover:text-cee-red',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition',
                page === currentPage
                  ? 'border-cee-red bg-cee-red text-white'
                  : 'border-border hover:border-cee-red hover:text-cee-red',
              )}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Página siguiente"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md border text-sm transition',
            currentPage === totalPages
              ? 'cursor-not-allowed border-border text-muted-foreground opacity-40'
              : 'border-border hover:border-cee-red hover:text-cee-red',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
