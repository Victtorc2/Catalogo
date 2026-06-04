import type { CatalogoCategoria } from "@/types/producto";

export function CategoryFilter({ categorias, selected, onChange }: {
  categorias: CatalogoCategoria[]; selected: number | null; onChange: (id: number | null) => void;
}) {
  const btn = (active: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${active ? "bg-ocean text-white shadow-sm" : "bg-sand text-ink-soft hover:bg-sand-dark"}`;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button type="button" onClick={() => onChange(null)} className={btn(selected === null)}>Todos</button>
      {categorias.map(c => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)} className={btn(selected === c.id)}>
          {c.nombre} <span className="ml-1 text-xs opacity-70">({c.cantidad_productos})</span>
        </button>
      ))}
    </div>
  );
}
