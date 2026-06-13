import type { CatalogoCategoria } from "@/types/producto";

export function CategoryFilter({ categorias, selected, onChange }: {
  categorias: CatalogoCategoria[]; selected: number | null; onChange: (id: number | null) => void;
}) {
  const btn = (active: boolean) =>
    `shrink-0 rounded-xl px-4 py-2 font-display text-sm font-semibold transition-all ${
      active
        ? "bg-gradient-to-r from-electric to-electric-deep text-white shadow-[0_10px_24px_-10px_rgba(14,165,233,0.9)]"
        : "border border-steel-light/50 bg-steel/50 text-ice-soft hover:border-electric/40 hover:text-ice"
    }`;
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onChange(null)} className={btn(selected === null)}>Todos</button>
      {categorias.map((c) => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)} className={btn(selected === c.id)}>
          {c.nombre} <span className="ml-1 text-xs opacity-70">({c.cantidad_productos})</span>
        </button>
      ))}
    </div>
  );
}
