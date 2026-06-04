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
    `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
      active
        ? "border-coral bg-coral text-white shadow-sm"
        : "border-line bg-white text-ink-soft hover:border-coral/40 hover:text-coral"
    }`;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <span className="shrink-0 text-xs font-medium text-ink-faint">Marca:</span>
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
