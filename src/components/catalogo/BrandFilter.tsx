import type { CatalogoMarca } from "@/types/producto";

interface BrandFilterProps {
  marcas: CatalogoMarca[];
  selected: string | null;
  onChange: (marca: string | null) => void;
}

/** Filtro de marcas (segundo nivel). Aparece al seleccionar una categoría. */
export function BrandFilter({ marcas, selected, onChange }: BrandFilterProps) {
  if (marcas.length === 0) return null;

  const chip = (active: boolean) =>
    `shrink-0 rounded-lg border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
      active
        ? "border-strike bg-strike/90 text-white shadow-[0_8px_20px_-10px_rgba(249,115,22,0.9)]"
        : "border-steel-light/50 bg-steel/40 text-ice-soft hover:border-strike/50 hover:text-strike"
    }`;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-ice-faint">Marca:</span>
      <button type="button" onClick={() => onChange(null)} className={chip(selected === null)}>
        Todas
      </button>
      {marcas.map((m) => (
        <button
          key={m.nombre}
          type="button"
          onClick={() => onChange(m.nombre)}
          className={chip(selected === m.nombre)}
        >
          {m.nombre}
          <span className="ml-1 opacity-70">({m.cantidad_productos})</span>
        </button>
      ))}
    </div>
  );
}
