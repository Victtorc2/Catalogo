import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Paginación numérica con flechas. Muestra hasta 5 páginas alrededor de la actual. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Ventana de páginas a mostrar.
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  const btn = (active: boolean) =>
    `flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all ${
      active ? "bg-ocean text-white shadow-sm" : "border border-line bg-white text-ink-soft hover:border-ocean/40 hover:text-ocean"
    }`;

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition-all hover:border-ocean/40 hover:text-ocean disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onChange(1)} className={btn(false)}>1</button>
          {start > 2 && <span className="px-1 text-ink-faint">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} className={btn(p === page)}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-ink-faint">…</span>}
          <button type="button" onClick={() => onChange(totalPages)} className={btn(false)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition-all hover:border-ocean/40 hover:text-ocean disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
